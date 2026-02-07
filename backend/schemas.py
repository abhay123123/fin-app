from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    store_name: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    limit_amount: float
    period: str

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "blue"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True
