
import React from 'react';
import { ForecastedProduct } from '../types';
import { XIcon, ClipboardListIcon } from './Icons';
import Spinner from './shared/Spinner';

interface SalesForecastModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    data: ForecastedProduct[];
}

const SalesForecastModal: React.FC<SalesForecastModalProps> = ({ isOpen, onClose, isLoading, data }) => {
    if (!isOpen) return null;

    const getRowClass = (suggestion: string) => {
        if (suggestion.startsWith('Reorder')) return 'bg-yellow-50 dark:bg-yellow-500/10';
        if (suggestion.startsWith('Potentially')) return 'bg-red-50 dark:bg-red-500/10';
        return 'bg-green-50 dark:bg-green-500/10';
    };

    const getSuggestionClass = (suggestion: string) => {
        if (suggestion.startsWith('Reorder')) return 'text-yellow-800 dark:text-yellow-300 font-bold';
        if (suggestion.startsWith('Potentially')) return 'text-red-800 dark:text-red-400 font-bold';
        return 'text-green-800 dark:text-green-300 font-bold';
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in-fast"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all flex flex-col h-[80vh]"
                onClick={e => e.stopPropagation()}
            >
                 <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <span className="text-brand-primary dark:text-brand-accent-profit"><ClipboardListIcon /></span>
                        <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200">AI Sales Forecast & Reorder Suggestions</h2>
                    </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary dark:text-gray-300">
                            <Spinner />
                            <p className="mt-4 font-semibold">AI is analyzing sales trends...</p>
                            <p className="text-sm">This may take a moment.</p>
                        </div>
                    ) : data.length > 0 ? (
                        <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Product</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Current Stock</th>
                                        <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Forecasted Sales (7 days)</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">AI Suggestion</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.map((product) => (
                                        <tr key={product.id} className={getRowClass(product.reorderSuggestion)}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-brand-text-primary dark:text-gray-100">{product.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-brand-text-secondary dark:text-gray-300">{product.stockLevel || 0}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-brand-primary dark:text-white">{product.forecastedSales}</td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${getSuggestionClass(product.reorderSuggestion)}`}>{product.reorderSuggestion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary dark:text-gray-300">
                             <p className="font-semibold">No forecast data available.</p>
                             <p className="text-sm">There might have been an error contacting the AI service.</p>
                         </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold">Close</button>
                </div>
            </div>
        </div>
    );
};

export default SalesForecastModal;