import React, { useState, useEffect } from 'react';
import { createExpense, updateExpense, getCategories } from '../api';
import { PlusCircle, Search, X } from 'lucide-react';

const ExpenseForm = ({ onExpenseAdded, initialData, isEditing, onCancelEdit }) => {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        store_name: '',
    });

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                // Set default if available and not set
                if (data.length > 0 && !formData.category) {
                    setFormData(prev => ({ ...prev, category: data[0].name }));
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                amount: initialData.amount || '',
                category: initialData.category || (categories.length > 0 ? categories[0].name : 'Uncategorized'),
                description: initialData.store_name ? `Receipt from ${initialData.store_name}` : '',
                store_name: initialData.store_name || 'Unknown Store',
            });
        }
    }, [initialData, categories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && initialData?.id) {
                await updateExpense(initialData.id, {
                    ...formData,
                    amount: parseFloat(formData.amount),
                });
            } else {
                await createExpense({
                    ...formData,
                    amount: parseFloat(formData.amount),
                });
            }
            setFormData({ amount: '', category: '', description: '', store_name: '' });
            if (onExpenseAdded) onExpenseAdded();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isEditing ? <Search className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                    {isEditing ? 'Edit Expense' : 'Add New Expense'}
                </div>
                {isEditing && (
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({ amount: '', category: '', description: '', store_name: '' });
                            onCancelEdit();
                        }}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                    <input
                        type="number"
                        name="amount"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                    >
                        {categories.length === 0 && <option value="Uncategorized">Uncategorized</option>}
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                    <input
                        type="text"
                        name="store_name"
                        value={formData.store_name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>
            <button
                type="submit"
                className={`w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent py-3 px-4 text-base font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${isEditing
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    }`}
            >
                {isEditing ? 'Update Expense' : (
                    <>
                        <PlusCircle className="h-5 w-5" />
                        Add Expense
                    </>
                )}
            </button>
        </form>
    );
};

export default ExpenseForm;
