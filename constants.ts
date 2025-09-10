
import { Product, WidgetConfig } from './types';

export const initialProducts: Product[] = [
    { id: 1, name: 'Organic Milk', purchasePrice: 2.50, sellingPrice: 4.50, unitsSoldWeek: 100, category: 'Dairy', stockLevel: 50, supplier: 'Farm Fresh Inc.' },
    { id: 2, name: 'Artisan Bread', purchasePrice: 1.80, sellingPrice: 3.99, unitsSoldWeek: 80, category: 'Bakery', stockLevel: 40, supplier: 'Local Breads Co.' },
    { id: 3, name: 'Gourmet Coffee', purchasePrice: 8.00, sellingPrice: 15.00, unitsSoldWeek: 50, category: 'Pantry', stockLevel: 60, supplier: 'Global Beans' },
    { id: 4, name: 'Imported Cheese', purchasePrice: 5.50, sellingPrice: 9.75, unitsSoldWeek: 40, category: 'Dairy', stockLevel: 25, supplier: 'Cheese Masters' },
    { id: 5, name: 'Craft Soda', purchasePrice: 1.00, sellingPrice: 2.25, unitsSoldWeek: 150, category: 'Drinks', stockLevel: 120, supplier: 'Fizz Pop Beverages' },
];

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
    aiOverview: { order: 1, visible: true },
    complianceChecklist: { order: 2, visible: true },
    salesForecast: { order: 3, visible: true }, // Not a visual widget, but good to have in config
    profitabilityCharts: { order: 1, visible: true },
    geminiInsights: { order: 1, visible: true },
    marketingSimulator: { order: 2, visible: true },
    goalTracker: { order: 1, visible: true },
};