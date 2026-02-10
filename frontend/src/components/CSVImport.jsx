import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CSVImport = ({ onImportSuccess }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Adjust API URL if needed, assuming relative proxy or full path
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/expenses/import`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Import failed');
            }

            const result = await response.json();
            alert(result.message);
            if (onImportSuccess) onImportSuccess();

        } catch (error) {
            console.error('Error importing CSV:', error);
            alert('Failed to import CSV. Please check the file format.');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
            />
            <button
                onClick={handleButtonClick}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
            >
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import CSV
            </button>
        </>
    );
};

export default CSVImport;
