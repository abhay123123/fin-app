from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .routers import chat
from . import models, schemas, database
from datetime import timedelta
from .services import ocr
import shutil
import os

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://spendwise-frontend-ey25.onrender.com",
    "https://spendwise-backend-6n8n.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
models.Base.metadata.create_all(bind=database.engine)

@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db)):
    db_expense = models.Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

from datetime import date, datetime
from fastapi.responses import StreamingResponse
import csv
import io

@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0, 
    limit: int = 100, 
    start_date: date = None, 
    end_date: date = None, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Expense)
    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)
    if end_date:
        # Include the whole end_date (up to 23:59:59)
        # Assuming created_at is datetime, comparing with date checks 00:00:00
        # So we add 1 day to end_date and use <
        next_day = end_date
        query = query.filter(models.Expense.created_at < datetime(end_date.year, end_date.month, end_date.day) + timedelta(days=1))
    
    expenses = query.order_by(models.Expense.created_at.desc()).offset(skip).limit(limit).all()
    return expenses

@app.get("/expenses/export")
def export_expenses(
    start_date: date = None, 
    end_date: date = None, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Expense)
    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)
    if end_date:
         query = query.filter(models.Expense.created_at < datetime(end_date.year, end_date.month, end_date.day) + timedelta(days=1))
    
    expenses = query.order_by(models.Expense.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Date', 'Amount', 'Category', 'Store', 'Description'])
    
    for expense in expenses:
        writer.writerow([
            expense.id, 
            expense.created_at.strftime("%Y-%m-%d"), 
            expense.amount, 
            expense.category, 
            expense.store_name, 
            expense.description
        ])
    
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()), 
        media_type="text/csv", 
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )

@app.post("/expenses/import")
async def import_expenses(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")

    content = await file.read()
    decoded_content = content.decode('utf-8').splitlines()
    reader = csv.reader(decoded_content)
    
    # Optional: Skip header if present. 
    # Heuristic: Check if first row contains "Amount" or "Date"
    header = next(reader, None)
    if header:
        header_lower = [h.lower().strip() for h in header]
        if "amount" not in header_lower and "date" not in header_lower:
            # Maybe not a header, reset? simple csv import usually assumes header or specific order.
            # Let's assume standard format: Date, Amount, Category, Store, Description
            # Or standard export format: ID, Date, Amount, Category, Store, Description
            pass
        
    imported_count = 0
    errors = []
    
    for row in reader:
        try:
            # Expected minimal: Date, Amount
            # Let's try to map by index for simplicity if no header mapping logic
            # Assuming Export Format: ID, Date, Amount, Category, Store, Description (6 cols)
            # OR Simple Format: Date, Amount, Category, Store, Description (5 cols)
            
            if len(row) < 2:
                continue
                
            # parsers
            date_str = row[0] if len(row) < 6 else row[1] # If ID is first
            amount_str = row[1] if len(row) < 6 else row[2]
            category_str = row[2] if len(row) >= 3 and len(row) < 6 else (row[3] if len(row) >= 4 else "Uncategorized")
            store_str = row[3] if len(row) >= 4 and len(row) < 6 else (row[4] if len(row) >= 5 else "")
            desc_str = row[4] if len(row) >= 5 and len(row) < 6 else (row[5] if len(row) >= 6 else "")
            
            # naive safe date parsing
            # try YYYY-MM-DD then MM/DD/YYYY
            expense_date = datetime.now()
            for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"):
                try:
                    expense_date = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    pass
            
            amount = float(amount_str.replace('$', '').replace(',', ''))
            
            # Normalize category
            category = category_str.strip() or "Uncategorized"
            
            # Check if category exists, if not create it? 
            # For now, just string.
            
            new_expense = models.Expense(
                amount=amount,
                category=category,
                store_name=store_str.strip(),
                description=desc_str.strip(),
                created_at=expense_date
            )
            db.add(new_expense)
            imported_count += 1
            
        except Exception as e:
            errors.append(f"Row error: {e}")
            continue

    db.commit()
    return {"message": f"Successfully imported {imported_count} expenses", "errors": errors}

@app.post("/upload-receipt/")
async def upload_receipt(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Read the file again for OCR
        with open(temp_file, "rb") as f:
            image_bytes = f.read()
        
        ocr_result = ocr.process_receipt(image_bytes)
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)

    return ocr_result

@app.post("/budget/", response_model=schemas.Budget)
def create_or_update_budget(budget: schemas.BudgetCreate, db: Session = Depends(database.get_db)):
    # Check if a budget already exists (assuming single user/global budget for simplicity)
    db_budget = db.query(models.Budget).first()
    if db_budget:
        db_budget.limit_amount = budget.limit_amount
        db_budget.period = budget.period
    else:
        db_budget = models.Budget(**budget.dict())
        db.add(db_budget)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

@app.get("/budget/", response_model=schemas.Budget)
def get_budget(db: Session = Depends(database.get_db)):
    db_budget = db.query(models.Budget).first()
    if not db_budget:
        # Return a default budget or 404? 
        # Let's return a default "0" budget so frontend doesn't crash
        return models.Budget(limit_amount=0, period="monthly")
    return db_budget

# --- Categories Endpoints ---

@app.get("/categories/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(database.get_db)):
    categories = db.query(models.Category).all()
    # Seed default categories if empty
    if not categories:
        defaults = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Housing", "Education"]
        for name in defaults:
            db.add(models.Category(name=name))
        db.commit()
        categories = db.query(models.Category).all()
    return categories

@app.post("/categories/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    db_category = models.Category(name=category.name, color=category.color)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"ok": True}

# --- Expense Edit/Delete Endpoints ---

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(database.get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(db_expense)
    db.commit()
    return {"ok": True}

@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not db_expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for key, value in expense.dict().items():
        setattr(db_expense, key, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense
