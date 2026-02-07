import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteExpense } from '../api';
import { Trash2, Edit } from 'lucide-react';

const ExpenseList = ({ refreshTrigger, expenses: propExpenses, onEdit, onDelete }) => {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        if (propExpenses) {
            setExpenses(propExpenses);
        } else {
            const fetchExpenses = async () => {
                try {
                    const data = await getExpenses();
                    setExpenses(data);
                } catch (error) {
                    console.error('Error fetching expenses:', error);
                }
            };
            fetchExpenses();
        }
    }, [refreshTrigger, propExpenses]);

    return (
        <div>
            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700 backdrop-blur-sm">
                        <AnimatePresence>
                            {expenses.map((expense, index) => (
                                <motion.tr
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                                    className="hover:bg-indigo-50/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(expense.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">{expense.store_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={expense.description}>{expense.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-bold">${expense.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <motion.button whileHover={{ scale: 1.2 }} onClick={() => onEdit(expense)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 p-1 rounded-full">
                                            <Edit className="h-4 w-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                            onClick={async () => {
                                                if (window.confirm('Delete this expense?')) {
                                                    await deleteExpense(expense.id);
                                                    if (onDelete) onDelete();
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{expense.store_name || 'Unknown Store'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{new Date(expense.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg">
                                ${expense.amount.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                {expense.category}
                            </span>
                            {expense.description && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                                    {expense.description}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                            <button
                                onClick={() => onEdit(expense)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            >
                                <Edit className="h-4 w-4" /> Edit
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm('Delete this expense?')) {
                                        await deleteExpense(expense.id);
                                        if (onDelete) onDelete();
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseList;
