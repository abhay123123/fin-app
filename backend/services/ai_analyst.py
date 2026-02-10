import re
import os
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Expense, Category, Budget
from datetime import datetime
import calendar
from dotenv import load_dotenv

load_dotenv()

class AIAnalyst:
    def __init__(self, db: Session):
        self.db = db
        # Optional: Keep LLM for generic chitchat if key is present, but not required.
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None

    def analyze(self, query: str) -> str:
        query_lower = query.lower().strip()

        # --- 1. Small Talk & Personality ---
        small_talk_response = self._handle_small_talk(query_lower)
        if small_talk_response:
            return small_talk_response

        # --- 2. Capabilities / Help ---
        if "help" in query_lower or "what can you do" in query_lower:
            return (
                "Here are some things you can ask me:\n"
                "- 'Total spent?'\n"
                "- 'How much spent on Food?'\n"
                "- 'Spending at Walmart?'\n"
                "- 'What is my budget?'\n"
                "- 'Biggest expense?'\n"
                "- 'Recent transactions'"
            )

        # --- 3. Structured Financial Intents ---
        
        # Total Spent
        if re.search(r"total.*spent|how much.*spent.*total|overall spent", query_lower):
            return self._get_total_spent()

        # Budget Analysis
        if "budget" in query_lower or "limit" in query_lower or "how much left" in query_lower:
            return self._get_budget_status()

        # Insights (Highest/Top)
        if "highest" in query_lower or "biggest" in query_lower or "most expensive" in query_lower:
            return self._get_highest_expense()
        
        if "top category" in query_lower or "most spent on" in query_lower:
            return self._get_top_category()

        # Recent Transactions
        if "recent" in query_lower or "last transaction" in query_lower or "latest" in query_lower:
            return self._get_recent_transactions()

        # Spent by Category (Regex)
        category_match = re.search(r"(?:on|in|for)\s+(\w+)", query_lower)
        if category_match:
            category_candidate = category_match.group(1)
            if category_candidate not in ["total", "budget", "this", "recent"]:
                result = self._get_spent_by_category(category_candidate)
                if "couldn't find" not in result: 
                    return result

        # Spent by Store (Regex)
        store_match = re.search(r"(?:at|at the)\s+(\w+)", query_lower)
        if store_match:
             store_name = store_match.group(1)
             result = self._get_spent_by_store(store_name)
             if "couldn't find" not in result:
                 return result

        # --- 4. Smart Keyword Fallback ---
        # If no specific sentence structure matched, check if *any* word in the query matches a known Category or Store.
        keyword_response = self._check_keywords_in_db(query_lower)
        if keyword_response:
            return keyword_response
            
        # --- 5. Default / Echo ---
        return "I'm not sure how to answer that yet, but I'm listening! You can ask about your spending, budget, or specific lists."

    def _handle_small_talk(self, query: str) -> str:
        # Greetings
        if query in ["hi", "hello", "hey", "hola", "yo", "morning", "good morning"]:
            return "Hello! Ready to track some expenses? 💰"
        
        # Gratitude
        if "thank" in query or "thx" in query:
            return "You're welcome! Happy to help."
        
        # Status
        if "how are you" in query:
            return "I'm functioning perfectly and ready to crunch numbers!"
        
        # Farewell
        if query in ["bye", "goodbye", "see ya", "exit"]:
            return "Goodbye! Spend wisely! 👋"
            
        # Identity
        if "who are you" in query or "your name" in query:
            return "I am FinTrack AI, your personal financial assistant."
            
        # Praise
        if "good job" in query or "cool" in query or "awesome" in query:
            return "Thanks! I try my best."
            
        return None

    def _check_keywords_in_db(self, query: str) -> str:
        # 1. Get all categories
        categories = [c.name.lower() for c in self.db.query(Category).all()]
        tokens = query.split()
        
        for token in tokens:
            # Check Category
            if token in categories:
                return self._get_spent_by_category(token)
            
            # Check Store (Simple ILIKE check for token)
            # This might be heavy if many stores, but okay for personal app
            store_match = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.store_name).contains(token)).scalar()
            if store_match and store_match > 0:
                 return f"You've spent ${store_match:.2f} at locations matching '{token}'."
                 
        return None

    def _get_total_spent(self) -> str:
        total = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        return f"You have spent a total of ${total:.2f} across all transactions."

    def _get_budget_status(self) -> str:
        budget = self.db.query(Budget).first()
        if not budget:
             return "You haven't set a budget yet. Go to the dashboard to set one!"
        
        total_spent = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        remaining = budget.limit_amount - total_spent
        status = "under" if remaining >= 0 else "over"
        return f"Your budget is ${budget.limit_amount:.2f}. You've spent ${total_spent:.2f}. You are ${abs(remaining):.2f} {status} budget."

    def _get_highest_expense(self) -> str:
        expense = self.db.query(Expense).order_by(Expense.amount.desc()).first()
        if not expense:
            return "You don't have any expenses yet."
        return f"Your biggest expense was ${expense.amount:.2f} at {expense.store_name} ({expense.category}) on {expense.created_at.strftime('%Y-%m-%d')}."

    def _get_top_category(self) -> str:
        result = self.db.query(
            Expense.category, func.sum(Expense.amount)
        ).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).first()
        
        if not result:
            return "No spending data available."
        category, amount = result
        return f"You spend the most on {category} with a total of ${amount:.2f}."

    def _get_spent_by_category(self, category_name: str) -> str:
        total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.category) == category_name.lower()).scalar() or 0.0
        if total == 0:
             total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.category).contains(category_name.lower())).scalar() or 0.0
             
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
