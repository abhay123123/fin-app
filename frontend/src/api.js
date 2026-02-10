import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getExpenses = async (skip = 0, limit = 100, startDate = null, endDate = null) => {
    let url = `${API_URL}/expenses/?skip=${skip}&limit=${limit}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    const response = await axios.get(url);
    return response.data;
};

export const exportExpenses = (startDate, endDate) => {
    let url = `${API_URL}/expenses/export`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    window.open(url, '_blank');
};

export const createExpense = async (expenseData) => {
    const response = await axios.post(`${API_URL}/expenses/`, expenseData);
    return response.data;
};

export const uploadReceipt = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_URL}/upload-receipt/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getBudget = async () => {
    const response = await axios.get(`${API_URL}/budget/`);
    return response.data;
};

export const updateBudget = async (budgetData) => {
    const response = await axios.post(`${API_URL}/budget/`, budgetData);
    return response.data;
};

export const chatWithAnalyst = async (message) => {
    const response = await axios.post(`${API_URL}/api/chat`, { message });
    return response.data;
};

// --- Categories ---

export const getCategories = async () => {
    const response = await axios.get(`${API_URL}/categories/`);
    return response.data;
};

export const createCategory = async (categoryData) => {
    const response = await axios.post(`${API_URL}/categories/`, categoryData);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`);
    return response.data;
};

// --- Expense Actions ---

export const clearExpenses = async () => {
    const response = await axios.delete(`${API_URL}/expenses/`);
    return response.data;
};

export const deleteExpense = async (id) => {
    const response = await axios.delete(`${API_URL}/expenses/${id}`);
    return response.data;
};

export const updateExpense = async (id, expenseData) => {
    const response = await axios.put(`${API_URL}/expenses/${id}`, expenseData);
    return response.data;
};
