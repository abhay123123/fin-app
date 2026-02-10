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

        # --- Greetings & Small Talk ---
        if query_lower in ["hi", "hello", "hey", "hola"]:
            return "Hello! I'm your financial assistant. Ask me about your spending, budget, or recent transactions."
        
        if "monitor" in query_lower or "who are you" in query_lower:
            return "I am FinTrack AI, a rule-based financial analyst here to help you track your expenses."

        # --- Intent: Help / Capabilities ---
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

        # --- Intent: Total Spent ---
        if re.search(r"total.*spent|how much.*spent.*total", query_lower):
            return self._get_total_spent()

        # --- Intent: Budget Analysis ---
        if "budget" in query_lower or "limit" in query_lower or "how much left" in query_lower:
            return self._get_budget_status()

        # --- Intent: Insights (Highest/Top) ---
        if "highest" in query_lower or "biggest" in query_lower or "most expensive" in query_lower:
            return self._get_highest_expense()
        
        if "top category" in query_lower or "most spent on" in query_lower:
            return self._get_top_category()

        # --- Intent: Spent by Category ---
        category_match = re.search(r"(?:on|in|for)\s+(\w+)", query_lower)
        if category_match:
            category_candidate = category_match.group(1)
            # Filter out common false positives
            if category_candidate not in ["total", "budget", "this", "recent"]:
                result = self._get_spent_by_category(category_candidate)
                if "couldn't find" not in result: 
                    return result

        # --- Intent: Spent by Store ---
        store_match = re.search(r"(?:at|at the)\s+(\w+)", query_lower)
        if store_match:
             store_name = store_match.group(1)
             result = self._get_spent_by_store(store_name)
             if "couldn't find" not in result:
                 return result

        # --- Intent: Recent Transactions ---
        if "recent" in query_lower or "last transaction" in query_lower or "latest" in query_lower:
            return self._get_recent_transactions()

        return "I didn't quite catch that. Try asking 'Total spent', 'Budget status', or 'Recent transactions'."

    def _get_total_spent(self) -> str:
        total = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        return f"You have spent a total of ${total:.2f} across all transactions."

    def _get_budget_status(self) -> str:
        budget = self.db.query(Budget).first()
        if not budget:
             return "You haven't set a budget yet. Go to the dashboard to set one!"
        
        total_spent = self.db.query(func.sum(Expense.amount)).scalar() or 0.0
        # Simple Logic: Assuming monthly budget vs total spent (naive)
        # In a real app, we'd filter spent by current month.
        
        remaining = budget.limit_amount - total_spent
        status = "under" if remaining >= 0 else "over"
        return f"Your budget is ${budget.limit_amount:.2f}. You've spent ${total_spent:.2f}, so you are ${abs(remaining):.2f} {status} budget."

    def _get_highest_expense(self) -> str:
        expense = self.db.query(Expense).order_by(Expense.amount.desc()).first()
        if not expense:
            return "You don't have any expenses yet."
        return f"Your biggest expense was ${expense.amount:.2f} at {expense.store_name} ({expense.category}) on {expense.created_at.strftime('%Y-%m-%d')}."

    def _get_top_category(self) -> str:
        # SELECT category, SUM(amount) FROM expenses GROUP BY category ORDER BY SUM(amount) DESC LIMIT 1
        result = self.db.query(
            Expense.category, func.sum(Expense.amount)
        ).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).first()
        
        if not result:
            return "No spending data available."
            
        category, amount = result
        return f"You spend the most on {category} with a total of ${amount:.2f}."

    def _get_spent_by_category(self, category_name: str) -> str:
        # Semantic matching could go here, but for now exact/ilike match
        total = self.db.query(func.sum(Expense.amount)).filter(func.lower(Expense.category) == category_name.lower()).scalar() or 0.0
        if total == 0:
             # Try partial match
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
