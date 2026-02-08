from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ai_analyst import AIAnalyst
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_analyst(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        analyst = AIAnalyst(db)
        response_text = analyst.analyze(request.message)
        return ChatResponse(response=response_text)
    except Exception as e:
        print(f"AI Analyst Info: {str(e)}") # Keep internal log
        # Return the error to the user for debugging purposes during dev
        return ChatResponse(response=f"I encountered an error: {str(e)}")
