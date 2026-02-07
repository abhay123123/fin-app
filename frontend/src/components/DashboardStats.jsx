import React, { useMemo } from 'react';
import { Wallet, Activity, TrendingUp } from 'lucide-react';
import { getBudget } from '../api';

const DashboardStats = ({ expenses, refreshTrigger }) => {
    const stats = useMemo(() => {
        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        // ... (rest of stats logic)
        const count = expenses.length;

        // Find top category
        const categoryCounts = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        let topCategory = '-';
        let maxAmount = 0;

        Object.entries(categoryCounts).forEach(([cat, amount]) => {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCategory = cat;
            }
        });

        return { total, count, topCategory };
    }, [expenses]);

    const [budget, setBudget] = React.useState(null);

    React.useEffect(() => {
        const fetchBudget = async () => {
            try {
                const data = await getBudget();
                setBudget(data);
            } catch (error) {
                console.error('Error fetching budget:', error);
            }
        };
        fetchBudget();
    }, [refreshTrigger]); // Fetch when trigger changes

    const budgetProgress = useMemo(() => {
        if (!budget || budget.limit_amount <= 0) return 0;
        return Math.min((stats.total / budget.limit_amount) * 100, 100);
    }, [budget, stats.total]);

    const progressColor = budgetProgress > 100 ? 'bg-red-500' : budgetProgress > 75 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.total.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full">
                        <Wallet className="h-6 w-6 text-indigo-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.count}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <Activity className="h-6 w-6 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.topCategory}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-full">
                        <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                </div>
            </div>

            {/* Budget Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Budget</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {budget && budget.limit_amount > 0 ? `${budgetProgress.toFixed(0)}%` : 'N/A'}
                            </p>
                            {budget && budget.limit_amount > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">of ${budget.limit_amount}</p>
                            )}
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div
                            className={`h-2.5 rounded-full ${progressColor}`}
                            style={{ width: `${budgetProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
