import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Input from './shared/Input';
import Button from './Button';
import { XIcon } from './Icons';

interface EditProductModalProps {
    product: Product;
    onSave: (product: Product) => void;
    onClose: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState(product);
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { name, purchasePrice, sellingPrice, unitsSoldWeek } = formData;

        if (!name.trim() || !purchasePrice || !sellingPrice || !unitsSoldWeek) {
            setError('All fields are required.');
            return;
        }

        const pp = parseFloat(String(purchasePrice));
        const sp = parseFloat(String(sellingPrice));
        const usw = parseInt(String(unitsSoldWeek), 10);

        if (isNaN(pp) || isNaN(sp) || isNaN(usw)) {
            setError('Please enter valid numbers for prices and units.');
            return;
        }

        if (pp <= 0 || sp <= 0 || usw < 0) {
            setError('Prices must be positive. Units sold must be non-negative.');
            return;
        }

        if (sp < pp) {
            setError('Selling price cannot be less than purchase price.');
            return;
        }
        
        onSave({
            ...formData,
            purchasePrice: pp,
            sellingPrice: sp,
            unitsSoldWeek: usw,
            stockLevel: formData.stockLevel ? parseInt(String(formData.stockLevel)) : undefined,
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in-fast"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                 <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200">Edit {product.name}</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                    <Input
                        label="Product Name"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Purchase Price ($)"
                            id="purchasePrice"
                            name="purchasePrice"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={handleChange}
                            step="0.01"
                        />
                        <Input
                            label="Selling Price ($)"
                            id="sellingPrice"
                            name="sellingPrice"
                            type="number"
                            value={formData.sellingPrice}
                            onChange={handleChange}
                            step="0.01"
                        />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Units Sold/Week"
                            id="unitsSoldWeek"
                            name="unitsSoldWeek"
                            type="number"
                            value={formData.unitsSoldWeek}
                            onChange={handleChange}
                        />
                         <Input
                            label="Stock Level"
                            id="stockLevel"
                            name="stockLevel"
                            type="number"
                            value={formData.stockLevel || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;