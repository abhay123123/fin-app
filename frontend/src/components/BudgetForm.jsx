import React, { useState, useEffect } from 'react';
import { getBudget, updateBudget } from '../api';
import { Save } from 'lucide-react';

const BudgetForm = ({ onBudgetUpdated }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const data = await getBudget();
                if (data.limit_amount > 0) {
                    setAmount(data.limit_amount);
                }
            } catch (error) {
                console.error('Error fetching budget:', error);
            }
        };
        fetchBudget();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateBudget({ limit_amount: parseFloat(amount), period: 'monthly' });
            if (onBudgetUpdated) onBudgetUpdated();
            alert('Budget updated successfully!');
        } catch (error) {
            console.error('Error updating budget:', error);
            alert('Failed to update budget');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Budget Limit ($)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter amount"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Set Budget'}
            </button>
        </form>
    );
};

export default BudgetForm;
