import re
import os
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Expense, Category, Budget
from datetime import datetime
import calendar
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIAnalyst:
    def __init__(self, db: Session):
        self.db = db
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None

    def analyze(self, query: str) -> str:
        query_lower = query.lower().strip()

        # Intent: Total Spent
        if re.search(r"total.*spent|how much.*spent.*total", query_lower):
            return self._get_total_spent()

        # Intent: Spent by Category
        category_match = re.search(r"(?:on|in|for)\s+(\w+)", query_lower)
        if category_match:
            category_candidate = category_match.group(1)
            if "store" not in query_lower and "shop" not in query_lower:
                 result = self._get_spent_by_category(category_candidate)
                 if "couldn't find" not in result: # Only return if we found something, else fallback to LLM
                     return result

        # Intent: Spent by Store
        store_match = re.search(r"(?:at|at the)\s+(\w+)", query_lower)
        if store_match:
             store_name = store_match.group(1)
             result = self._get_spent_by_store(store_name)
             if "couldn't find" not in result:
                 return result

        # Intent: Recent Transactions
        if "recent" in query_lower or "last transaction" in query_lower:
            return self._get_recent_transactions()

        # Fallback to LLM (Gemini)
        if self.model:
            return self._ask_llm(query)

        return "I'm still learning! Configure GEMINI_API_KEY to unlock my full potential, or ask: 'Total spent?', 'How much on Food?'"

    def _get_total_spent(self) -> str:
        total = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        return f"You have spent a total of ${total:.2f} across all transactions."

    def _get_spent_by_category(self, category_name: str) -> str:
        total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.category) == category_name.lower()).scalar() or 0.0
        if total == 0:
             return f"I couldn't find any spending for the category '{category_name}'."
        return f"You've spent ${total:.2f} on {category_name.capitalize()}."

    def _get_spent_by_store(self, store_name: str) -> str:
        total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.store_name).contains(store_name.lower())).scalar() or 0.0
        if total == 0:
             return f"I couldn't find any spending at '{store_name}'."
        return f"You've spent ${total:.2f} at {store_name.capitalize()}."

    def _get_recent_transactions(self) -> str:
        expenses = self.db.query(Expense).order_by(Expense.created_at.desc()).limit(3).all()
        if not expenses:
            return "No recent transactions found."
        
        response = "Here are your latest 3 transactions:\n"
        for ex in expenses:
            store = ex.store_name or "Unknown Store"
            date_str = ex.created_at.strftime("%b %d")
            response += f"- {date_str}: ${ex.amount:.2f} at {store}\n"
        return response

    def _ask_llm(self, query: str) -> str:
        try:
            # 1. Gather Context (Schema & Recent Data)
            # Fetch some summary stats to give the LLM "vision"
            total_spent = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
            categories = [c.name for c in self.db.query(Category).all()]
            
            # Simple context prompt
            context_prompt = f"""
            You are a financial assistant for a personal expense tracker app.
            Database Context:
            - Total Spent All Time: ${total_spent:.2f}
            - Active Categories: {', '.join(categories)}
            - Schema: Expenses have amount, category, store_name, description, date.
            
            User Question: {query}
            
            Instructions:
            - If it needs specific data you don't have, ask them to query more specifically (e.g. 'How much on [Category]?').
            - If it's general advice or based on the summary above, answer directly.
            - Keep answers short, friendly, and helpful.
            """

            response = self.model.generate_content(context_prompt)
            return response.text.strip()
        except Exception as e:
            return f"I tried to think hard, but my brain hurt: {str(e)}"
