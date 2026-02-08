import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Expense
from datetime import datetime
import calendar

class AIAnalyst:
    def __init__(self, db: Session):
        self.db = db

    def analyze(self, query: str) -> str:
        query = query.lower().strip()

        # Intent: Total Spent
        if re.search(r"total.*spent|how much.*spent.*total", query):
            return self._get_total_spent()

        # Intent: Spent by Category
        # Matches: "how much on food", "spent on travel", "food spending"
        category_match = re.search(r"(?:on|in|for)\s+(\w+)", query)
        if category_match:
            category_candidate = category_match.group(1)
            # Simple heuristic: if it looks like a category query
            if "store" not in query and "shop" not in query:
                 return self._get_spent_by_category(category_candidate)

        # Intent: Spent by Store
        # Matches: "spent at uber", "how much at walmart"
        store_match = re.search(r"(?:at|at the)\s+(\w+)", query)
        if store_match:
             store_name = store_match.group(1)
             return self._get_spent_by_store(store_name)

        # Intent: Recent Transactions
        if "recent" in query or "last transaction" in query:
            return self._get_recent_transactions()

        return "I'm still learning! Try asking 'How much did I spend total?' or 'How much on Food?'"

    def _get_total_spent(self) -> str:
        total = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        return f"You have spent a total of ${total:.2f} across all transactions."

    def _get_spent_by_category(self, category_name: str) -> str:
        # Case insensitive search
        total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.category) == category_name.lower()).scalar() or 0.0
        
        if total == 0:
             return f"I couldn't find any spending for the category '{category_name}'."
        return f"You've spent ${total:.2f} on {category_name.capitalize()}."

    def _get_spent_by_store(self, store_name: str) -> str:
        # Case insensitive search
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
