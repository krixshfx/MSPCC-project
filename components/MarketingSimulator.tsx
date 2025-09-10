import React, { useState, useMemo, useEffect } from 'react';
import { CalculatedProduct } from '../types';
import { getMarketingAdvice } from '../services/geminiService';
import Card from './shared/Card';
import Button from './Button';
import Spinner from './shared/Spinner';
import { CalculatorIcon } from './Icons';

interface MarketingSimulatorProps {
    products: CalculatedProduct[];
}

const MarketingSimulator: React.FC<MarketingSimulatorProps> = ({ products }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id.toString() || '');
    const [discount, setDiscount] = useState('10');
    const [salesLift, setSalesLift] = useState('20');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Reset selection if products change to avoid invalid state
        if (products.length > 0) {
            const selectedProductExists = products.some(p => p.id.toString() === selectedProductId);
            if (!selectedProductExists) {
                 setSelectedProductId(products[0].id.toString());
            }
        } else {
            setSelectedProductId('');
        }
        setAdvice('');
    }, [products, selectedProductId]);


    const simulation = useMemo(() => {
        const product = products.find(p => p.id.toString() === selectedProductId);
        if (!product) return null;

        const discountPercent = parseFloat(discount) || 0;
        const liftPercent = parseFloat(salesLift) || 0;
        
        const newPrice = product.sellingPrice * (1 - discountPercent / 100);
        const newUnits = product.unitsSoldWeek * (1 + liftPercent / 100);
        const newProfit = (newPrice - product.purchasePrice) * newUnits;
        const profitChange = newProfit - product.weeklyProfit;

        return { product, newPrice, newUnits, newProfit, profitChange };
    }, [products, selectedProductId, discount, salesLift]);

    const handleGetAdvice = async () => {
        if (!simulation) return;
        setIsLoading(true);
        setError('');
        setAdvice('');
        try {
            const result = await getMarketingAdvice(simulation.product, parseFloat(discount), parseFloat(salesLift), simulation.newPrice, simulation.newProfit);
            setAdvice(result);
        } catch (err) {
            setError('Failed to get marketing advice. Please check your API key.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (products.length === 0) return null;

    return (
        <Card title="Marketing ROI Simulator" icon={<CalculatorIcon />}>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="product-select" className="block text-sm font-medium text-brand-text-secondary dark:text-gray-300">Select Product</label>
                            <select
                                id="product-select"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                value={selectedProductId}
                                onChange={(e) => {
                                    setSelectedProductId(e.target.value);
                                    setAdvice('');
                                }}
                            >
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="discount" className="flex justify-between text-sm font-medium text-brand-text-secondary dark:text-gray-300">
                                <span>Discount</span>
                                <span className="font-bold text-brand-primary dark:text-white">{discount}%</span>
                            </label>
                             <input type="range" id="discount" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-primary" />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="salesLift" className="flex justify-between text-sm font-medium text-brand-text-secondary dark:text-gray-300">
                                <span>Estimated Sales Lift</span>
                                <span className="font-bold text-brand-primary dark:text-white">{salesLift}%</span>
                            </label>
                             <input type="range" id="salesLift" min="0" max="200" value={salesLift} onChange={e => setSalesLift(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-brand-accent-profit" />
                        </div>
                    </div>

                    {/* Simulation Results */}
                    {simulation && (
                        <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg space-y-3">
                            <h4 className="font-semibold font-display text-lg text-brand-primary dark:text-gray-200">Simulation Results</h4>
                            <div className="text-sm space-y-2 text-brand-text-secondary dark:text-gray-300">
                                <ResultRow label="New Price" value={simulation.newPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                                <ResultRow label="New Weekly Units" value={Math.round(simulation.newUnits).toString()} />
                                <ResultRow label="Original Weekly Profit" value={simulation.product.weeklyProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                                <ResultRow label="Simulated Weekly Profit" value={simulation.newProfit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                                <ResultRow label="Profit Change" value={
                                    <span className={simulation.profitChange >= 0 ? 'text-brand-accent-profit font-bold' : 'text-brand-accent-warning font-bold'}>
                                    {simulation.profitChange.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </span>
                                } />
                            </div>
                            <Button onClick={handleGetAdvice} disabled={isLoading} fullWidth className="mt-4">
                                {isLoading ? <Spinner/> : 'Get AI Advice on this Promotion'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
             {error && <div className="p-3 mx-6 mb-6 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
             {advice && (
                 <div className="p-4 mx-6 mb-4 bg-brand-primary/5 dark:bg-brand-primary/20 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                     <h4 className="font-semibold font-display text-brand-primary dark:text-white">Gemini's Advice:</h4>
                     <div className="whitespace-pre-wrap font-sans text-brand-text-secondary dark:text-gray-300" dangerouslySetInnerHTML={{ __html: advice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                 </div>
             )}
        </Card>
    );
};

const ResultRow: React.FC<{label: string, value: string | React.ReactNode}> = ({label, value}) => (
    <div className="flex justify-between items-center">
        <span>{label}:</span>
        <span className="font-bold text-brand-text-primary dark:text-white">{value}</span>
    </div>
)

export default MarketingSimulator;