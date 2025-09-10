import React, { useState } from 'react';
import Card from './shared/Card';
import Input from './shared/Input';
import Button from './Button';
import { Product } from '../types';
import { PlusCircleIcon } from './Icons';

interface ProductInputFormProps {
    addProduct: (product: Omit<Product, 'id'>) => void;
}

const ProductInputForm: React.FC<ProductInputFormProps> = ({ addProduct }) => {
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [unitsSoldWeek, setUnitsSoldWeek] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); // Clear previous errors on a new submission attempt

        const trimmedName = name.trim();
        if (!trimmedName || !purchasePrice || !sellingPrice || !unitsSoldWeek) {
            setError('All fields are required.');
            return;
        }
        
        const pp = parseFloat(purchasePrice);
        const sp = parseFloat(sellingPrice);
        const usw = parseInt(unitsSoldWeek, 10);

        if (isNaN(pp) || isNaN(sp) || isNaN(usw)) {
            setError('Please enter valid numbers for prices and units.');
            return;
        }
        
        if (pp <= 0 || sp <= 0 || usw < 0) { // Allow 0 units sold
            setError('Prices must be positive. Units sold must be non-negative.');
            return;
        }

        if (sp < pp) {
            setError('Selling price cannot be less than purchase price.');
            return;
        }

        addProduct({
            name: trimmedName,
            purchasePrice: pp,
            sellingPrice: sp,
            unitsSoldWeek: usw,
        });

        // Reset form
        setName('');
        setPurchasePrice('');
        setSellingPrice('');
        setUnitsSoldWeek('');
    };

    return (
        <Card title="Add New Product" icon={<PlusCircleIcon />}>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                <Input
                    label="Product Name"
                    id="productName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Organic Milk"
                />
                <Input
                    label="Purchase Price ($)"
                    id="purchasePrice"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g., 2.50"
                    step="0.01"
                />
                <Input
                    label="Selling Price ($)"
                    id="sellingPrice"
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g., 4.50"
                    step="0.01"
                />
                <Input
                    label="Units Sold per Week"
                    id="unitsSold"
                    type="number"
                    value={unitsSoldWeek}
                    onChange={(e) => setUnitsSoldWeek(e.target.value)}
                    placeholder="e.g., 100"
                />
                <Button type="submit" fullWidth>Add Product</Button>
            </form>
        </Card>
    );
};

export default ProductInputForm;