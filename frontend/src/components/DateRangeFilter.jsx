import React from 'react';
import { Download, Filter, X } from 'lucide-react';
import { exportExpenses } from '../api';

const DateRangeFilter = ({ startDate, endDate, onDateChange, onClear }) => {

    const handleExport = () => {
        exportExpenses(startDate, endDate);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        value={startDate || ''}
                        onChange={(e) => onDateChange('start', e.target.value)}
                        className="w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:text-white"
                        placeholder="Start Date"
                    />
                    <span className="text-gray-400 hidden sm:inline">-</span>
                    <span className="text-gray-400 sm:hidden">to</span>
                    <input
                        type="date"
                        value={endDate || ''}
                        onChange={(e) => onDateChange('end', e.target.value)}
                        className="w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 dark:bg-gray-700 dark:text-white"
                        placeholder="End Date"
                    />
                </div>
                {(startDate || endDate) && (
                    <button
                        onClick={onClear}
                        className="self-end sm:self-auto p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Clear Filters"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full md:w-auto justify-center"
            >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
            </button>
        </div>
    );
};

export default DateRangeFilter;
