import React, { useState } from 'react';
import { uploadReceipt } from '../api';
import { Upload, Loader2 } from 'lucide-react';

const ReceiptUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await uploadReceipt(file);
            if (onUploadSuccess) onUploadSuccess(data);
        } catch (error) {
            console.error('Error uploading receipt:', error);
            alert('Failed to upload receipt');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5" />
                Upload Receipt
            </h3>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                        ) : (
                            <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        )}
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={uploading} />
                </label>
            </div>
        </div>
    );
};

export default ReceiptUpload;
