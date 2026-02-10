import React, { useState, useEffect } from 'react';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ReceiptUpload from './components/ReceiptUpload';
import BudgetForm from './components/BudgetForm';
import DashboardStats from './components/DashboardStats';
import SpendingChart from './components/SpendingChart';
import { getExpenses } from './api';
import { LayoutDashboard } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import CategoryManager from './components/CategoryManager';
import DateRangeFilter from './components/DateRangeFilter';
import AIChat from './components/AIChat';

import Modal from './components/Modal';
import { Plus, Tag } from 'lucide-react';

function App() {
  const [refreshList, setRefreshList] = useState(0);
  const [refreshBudget, setRefreshBudget] = useState(0);
  const [ocrData, setOcrData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Fetch expenses at App level to share with Stats and List
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses(0, 100, startDate, endDate);
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, [refreshList, startDate, endDate]);

  const handleDateChange = (type, value) => {
    if (type === 'start') setStartDate(value);
    else setEndDate(value);
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const handleExpenseAdded = () => {
    setRefreshList((prev) => prev + 1);
    setOcrData(null); // Clear OCR data after adding
    setEditingExpense(null); // Clear editing state
    setShowExpenseModal(false); // Close modal
  };

  const handleUploadSuccess = (data) => {
    setOcrData(data);
    setShowExpenseModal(true); // Open modal to review/edit OCR data
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseModal(true);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'dark text-white' : 'text-gray-900'}`}>
      <nav className="glass sticky top-0 z-50 border-b border-gray-200/20 dark:border-gray-700/20 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">FinTrack AI</span>
              </div>
            </div>
            <div className="flex items-center">
              <ThemeToggle isDark={darkMode} toggleTheme={toggleTheme} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your financial activity</p>
        </div>



        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          onClear={handleClearFilters}
        />

        <DashboardStats expenses={expenses} refreshTrigger={refreshBudget} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <SpendingChart expenses={expenses} />

            <div className="glass rounded-xl shadow-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-6">
                <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <BudgetForm onBudgetUpdated={() => setRefreshBudget(prev => prev + 1)} />
                </div>
                {/* Removed CategoryManager and ExpenseForm from here */}
              </div>
            </div>
          </div>

          {/* Right Column: List & Details */}
          <div className="lg:col-span-2 space-y-4">

            {/* Action Buttons Row */}
            <div className="flex justify-between items-center gap-4">
              {/* Left Button: Add Category */}
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Tag className="h-5 w-5 text-indigo-500" />
                Add New Category
              </button>

              {/* Right Button: Add Expense */}
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md text-sm font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add New Expense
              </button>
            </div>


            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                <button
                  onClick={() => setRefreshList(prev => prev + 1)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  Refresh
                </button>
              </div>
              <div className="p-0">
                <ExpenseList
                  refreshTrigger={refreshList}
                  expenses={expenses}
                  onEdit={handleEditExpense}
                  onDelete={() => setRefreshList(prev => prev + 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Manage Categories"
      >
        <CategoryManager />
      </Modal>

      <Modal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
          setOcrData(null);
        }}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
      >
        <ExpenseForm
          onExpenseAdded={handleExpenseAdded}
          initialData={ocrData || editingExpense}
          isEditing={!!editingExpense}
          onCancelEdit={() => {
            setEditingExpense(null);
            setShowExpenseModal(false);
          }}
        />
      </Modal>

      <AIChat />
    </div>
  );
}

// Helper to fix the variable name created in the return above
// I used ShowModalCategory instead of ShowCategoryModal in one place, let me correct it in the file writing.
// Wait, I can just write the correct code.
// Correct variable is showCategoryModal


export default App;
