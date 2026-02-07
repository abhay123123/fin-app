import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../api';
import { Plus, Trash2, Tag } from 'lucide-react';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newColor, setNewColor] = useState('blue');
    const [loading, setLoading] = useState(false);

    const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'indigo', 'pink', 'gray'];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setLoading(true);
        try {
            await createCategory({ name: newCategory, color: newColor });
            setNewCategory('');
            fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteCategory(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Manage Categories
            </h3>

            <form onSubmit={handleAdd} className="flex gap-2">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                />
                <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 dark:bg-gray-700 dark:text-white"
                >
                    {colors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </form>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {categories.map((cat) => (
                    <div key={cat.id} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${cat.color}-100 text-${cat.color}-800 dark:bg-${cat.color}-900 dark:text-${cat.color}-200 border border-${cat.color}-200 dark:border-${cat.color}-700`}>
                        {cat.name}
                        <button onClick={() => handleDelete(cat.id)} className="ml-1 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryManager;
