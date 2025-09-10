import React, { useMemo } from 'react';
import { CalculatedProduct } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface ProductDataTableProps {
    products: CalculatedProduct[];
    removeProduct: (id: number) => void;
    editProduct: (product: CalculatedProduct) => void;
    hoveredProductId: number | null;
    setHoveredProductId: (id: number | null) => void;
}

const ProductDataTable: React.FC<ProductDataTableProps> = ({ products, removeProduct, editProduct, hoveredProductId, setHoveredProductId }) => {
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const totals = useMemo(() => {
        return products.reduce((acc, p) => {
            acc.unitsSoldWeek += p.unitsSoldWeek;
            acc.weeklyProfit += p.weeklyProfit;
            return acc;
        }, { unitsSoldWeek: 0, weeklyProfit: 0 });
    }, [products]);

    const handleRemoveClick = (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            removeProduct(id);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Purchase Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Selling Price</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Units/Week</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Margin</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">Weekly Profit</th>
                        <th scope="col" className="relative px-6 py-3 text-left text-xs font-bold text-brand-text-secondary dark:text-gray-400 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {products.map((product, index) => (
                        <tr 
                            key={product.id} 
                            className={`transition-colors duration-200 ${product.id === hoveredProductId ? 'bg-brand-primary/10' : ''} ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}
                            onMouseEnter={() => setHoveredProductId(product.id)}
                            onMouseLeave={() => setHoveredProductId(null)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-text-primary dark:text-gray-100">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-gray-400">{formatCurrency(product.purchasePrice)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-gray-400">{formatCurrency(product.sellingPrice)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-gray-400">{product.unitsSoldWeek}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${product.margin >= 40 ? 'bg-brand-accent-profit/20 text-green-800 dark:text-brand-accent-profit' : product.margin >= 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' : 'bg-brand-accent-warning/20 text-red-800 dark:text-brand-accent-warning'}`}>
                                    {product.margin.toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-primary dark:text-gray-300 font-bold">{formatCurrency(product.weeklyProfit)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => editProduct(product)} className="text-brand-text-secondary dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors" aria-label={`Edit ${product.name}`}>
                                      <PencilIcon/>
                                    </button>
                                    <button onClick={() => handleRemoveClick(product.id, product.name)} className="text-brand-text-secondary dark:text-gray-400 hover:text-brand-accent-warning dark:hover:text-brand-accent-warning transition-colors" aria-label={`Delete ${product.name}`}>
                                      <TrashIcon/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-gray-100 dark:bg-gray-900">
                    <tr>
                        <th scope="row" colSpan={4} className="px-6 py-3 text-left text-sm font-bold text-brand-primary dark:text-gray-100">
                            Totals
                        </th>
                        <td className="px-6 py-3 text-sm font-bold text-brand-text-primary dark:text-gray-300">{totals.unitsSoldWeek}</td>
                        <td className="px-6 py-3"></td>
                        <td className="px-6 py-3 text-sm font-extrabold text-brand-primary dark:text-gray-100">{formatCurrency(totals.weeklyProfit)}</td>
                        <td className="px-6 py-3"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ProductDataTable;