
export interface Product {
    id: number;
    name: string;
    purchasePrice: number;
    sellingPrice: number;
    unitsSoldWeek: number;
    category?: string;
    stockLevel?: number;
    supplier?: string;
}

export interface CalculatedProduct extends Product {
    margin: number;
    weeklyProfit: number;
    weeklyRevenue: number;
    inventoryTurnover: number;
    sellThroughRate: number;
}

export interface ForecastedProduct extends CalculatedProduct {
    forecastedSales: number;
    reorderSuggestion: string;
}


export interface ComplianceTask {
    task: string;
    details: string;
}

export type WidgetId = 'complianceChecklist' | 'profitabilityCharts' | 'geminiInsights' | 'marketingSimulator' | 'aiOverview' | 'goalTracker' | 'salesForecast';

export interface WidgetState {
    order: number;
    visible: boolean;
}

export type WidgetConfig = Record<WidgetId, WidgetState>;

export interface ReportData {
    reportContent: {
        executiveSummary: string;
        kpiAnalysis: string;
        performanceHighlights: string[];
        areasForImprovement: string[];
        strategicRecommendations: {
            recommendation: string;
            impact: string;
            risk: string;
        }[];
    };
    metrics: {
        totalWeeklyProfit: number;
        totalWeeklyRevenue: number;
        topProductByProfit?: CalculatedProduct | null;
        averageMargin: number;
    };
    products: CalculatedProduct[];
}