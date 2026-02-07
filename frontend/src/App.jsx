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
  };

  const handleUploadSuccess = (data) => {
    setOcrData(data);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-6">
                <ReceiptUpload onUploadSuccess={handleUploadSuccess} />
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <BudgetForm onBudgetUpdated={() => setRefreshBudget(prev => prev + 1)} />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <CategoryManager />
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <ExpenseForm
                    onExpenseAdded={handleExpenseAdded}
                    initialData={ocrData || editingExpense}
                    isEditing={!!editingExpense}
                    onCancelEdit={() => setEditingExpense(null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: List & Details */}
          <div className="lg:col-span-2">
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
                  onEdit={(expense) => setEditingExpense(expense)}
                  onDelete={() => setRefreshList(prev => prev + 1)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
