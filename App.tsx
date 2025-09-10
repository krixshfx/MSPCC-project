


import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Product, CalculatedProduct, WidgetConfig, WidgetId, ForecastedProduct } from './types';
import { initialProducts, DEFAULT_WIDGET_CONFIG } from './constants';
import { generateFullPdfReportContent, getSalesForecastAndSuggestions, getBusinessOverviewStream } from './services/geminiService';
import { generatePdfReport } from './services/reportGenerator';
import Header from './components/Header';
import ProductInputForm from './components/ProductInputForm';
import ProductDataTable from './components/ProductDataTable';
import ProfitabilityCharts from './components/ProfitabilityCharts';
import GeminiInsights from './components/GeminiInsights';
import ComplianceChecklist from './components/ComplianceChecklist';
import MarketingSimulator from './components/MarketingSimulator';
import Card from './components/shared/Card';
import DataUpload from './components/DataUpload';
import EditProductModal from './components/EditProductModal';
import Footer from './components/Footer';
import CustomizeDashboardModal from './components/CustomizeDashboardModal';
import ExportDropdown from './components/ExportDropdown';
import Spinner from './components/shared/Spinner';
import AIOverview from './components/AIOverview';
import SalesForecastModal from './components/SalesForecastModal';
import SetGoalModal from './components/SetGoalModal';
import GoalTrackerCard from './components/GoalTrackerCard';
import { ChartBarIcon, SparklesIcon, TrendingUpIcon, CurrencyDollarIcon, CubeIcon, BanknotesIcon, ArrowUpIcon, ArrowDownIcon } from './components/Icons';


type Tab = 'dashboard' | 'ai_analysis';

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(() => {
        try {
            const savedProducts = localStorage.getItem('products');
            if (savedProducts) {
                const parsed = JSON.parse(savedProducts);
                return parsed.length > 0 ? parsed : initialProducts;
            }
        } catch (error) {
            console.error("Failed to parse products from localStorage", error);
        }
        return initialProducts;
    });
    
    const [profitGoal, setProfitGoal] = useState<number>(() => {
        try {
            const savedGoal = localStorage.getItem('profitGoal');
            return savedGoal ? parseFloat(savedGoal) : 1500;
        } catch {
            return 1500;
        }
    });

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<CalculatedProduct | null>(null);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
    const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
    const [forecastData, setForecastData] = useState<ForecastedProduct[]>([]);
    const [isSetGoalModalOpen, setIsSetGoalModalOpen] = useState(false);
    const [aiOverviewContent, setAiOverviewContent] = useState('');

    const searchContainerRef = useRef<HTMLDivElement>(null);

    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(() => {
         try {
            const savedConfig = localStorage.getItem('widgetConfig');
             if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                const mergedConfig: WidgetConfig = JSON.parse(JSON.stringify(DEFAULT_WIDGET_CONFIG)); // Deep copy

                for (const key in mergedConfig) {
                    const widgetId = key as WidgetId;
                    if (parsedConfig[widgetId]) {
                        mergedConfig[widgetId] = { ...mergedConfig[widgetId], ...parsedConfig[widgetId] };
                    }
                }
                return mergedConfig;
            }
        } catch (error) {
            console.error("Failed to parse widget config from localStorage", error);
        }
        return DEFAULT_WIDGET_CONFIG;
    });

     useEffect(() => {
        localStorage.setItem('products', JSON.stringify(products));
    }, [products]);

    useEffect(() => {
        localStorage.setItem('profitGoal', profitGoal.toString());
    }, [profitGoal]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('widgetConfig', JSON.stringify(widgetConfig));
    }, [widgetConfig]);

    // Effect to handle clicks outside the search suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const calculatedProducts: CalculatedProduct[] = useMemo(() => {
        return products.map(p => {
            const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100 : 0;
            const weeklyProfit = (p.sellingPrice - p.purchasePrice) * p.unitsSoldWeek;
            const weeklyRevenue = p.sellingPrice * p.unitsSoldWeek;
            const inventoryTurnover = p.stockLevel && p.stockLevel > 0 ? p.unitsSoldWeek / p.stockLevel : 0;
            
            const unitsInStock = p.stockLevel || 0;
            const beginningInventory = p.unitsSoldWeek + unitsInStock;
            const sellThroughRate = beginningInventory > 0 ? (p.unitsSoldWeek / beginningInventory) * 100 : 0;
            
            return {
                ...p,
                margin,
                weeklyProfit,
                weeklyRevenue,
                inventoryTurnover,
                sellThroughRate,
            };
        });
    }, [products]);

    const filteredProducts = useMemo(() => {
        return calculatedProducts.filter(p => {
            const searchTermMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = selectedCategory ? p.category === selectedCategory : true;
            return searchTermMatch && categoryMatch;
        });
    }, [calculatedProducts, searchTerm, selectedCategory]);
    
    const dashboardMetrics = useMemo(() => {
        const source = filteredProducts;
        if (source.length === 0) {
            return { totalWeeklyProfit: 0, topProductByProfit: null, averageMargin: 0, totalWeeklyRevenue: 0 };
        }
        const totalWeeklyProfit = source.reduce((sum, p) => sum + p.weeklyProfit, 0);
        const totalWeeklyRevenue = source.reduce((sum, p) => sum + p.weeklyRevenue, 0);
        const averageMargin = source.reduce((sum, p) => sum + p.margin, 0) / source.length;
        const topProductByProfit = [...source].sort((a,b) => b.weeklyProfit - a.weeklyProfit)[0] || null;
        return { totalWeeklyProfit, topProductByProfit, averageMargin, totalWeeklyRevenue };
    }, [filteredProducts]);

     useEffect(() => {
        let isCancelled = false;

        const streamOverview = async () => {
            if (calculatedProducts.length === 0) {
                setAiOverviewContent("<p>Add some products to get started with AI analysis.</p>");
                return;
            }
            
            setAiOverviewContent(''); // Clear previous content
            
            try {
                const stream = await getBusinessOverviewStream(dashboardMetrics, calculatedProducts);
                for await (const chunk of stream) {
                    if (isCancelled) break;
                    setAiOverviewContent(prev => prev + chunk);
                }
            } catch (error) {
                console.error("AI Overview stream error:", error);
                if (!isCancelled) {
                    setAiOverviewContent("<p class='text-brand-accent-warning'>Could not load AI overview.</p>");
                }
            }
        };

        streamOverview();

        return () => {
            isCancelled = true;
        };
    }, [calculatedProducts, dashboardMetrics]); // Re-run when product data changes


    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const addProduct = (product: Omit<Product, 'id'>) => {
        setProducts(prev => [...prev, { ...product, id: Date.now() }]);
    };
    
    const loadProducts = (newProducts: Omit<Product, 'id'>[]) => {
        const productsWithIds = newProducts.map((p, index) => ({...p, id: Date.now() + index}));
        setProducts(productsWithIds);
    }

    const removeProduct = (id: number) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleEditProduct = (product: CalculatedProduct) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setIsEditModalOpen(false);
        setEditingProduct(null);
    };
    
    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            const matches = calculatedProducts
                .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
                .map(p => p.name)
                .filter(name => name.toLowerCase() !== term.toLowerCase()) // Don't suggest the exact match
                .slice(0, 5); // Limit suggestions
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionSelect = (suggestion: string) => {
        setSearchTerm(suggestion);
        setSuggestions([]);
    };

    const handleExportCsv = () => {
        if (filteredProducts.length === 0) {
            alert('No data to export.');
            return;
        }

        if (window.confirm('Are you sure you want to export the current view as a CSV file?')) {
            const dataToExport = filteredProducts.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category || '',
                supplier: p.supplier || '',
                purchasePrice: p.purchasePrice,
                sellingPrice: p.sellingPrice,
                unitsSoldWeek: p.unitsSoldWeek,
                stockLevel: p.stockLevel || 0,
                margin: parseFloat(p.margin.toFixed(2)),
                weeklyProfit: parseFloat(p.weeklyProfit.toFixed(2)),
                weeklyRevenue: parseFloat(p.weeklyRevenue.toFixed(2)),
                inventoryTurnover: parseFloat(p.inventoryTurnover.toFixed(2)),
                sellThroughRate: parseFloat(p.sellThroughRate.toFixed(2)),
            }));

            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `product_data_export_${new Date().toISOString().split('T', 1)[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleExportPdf = async () => {
        if (filteredProducts.length === 0) {
            alert('No data to generate a report from.');
            return;
        }
        setIsGeneratingReport(true);
        try {
            const reportContent = await generateFullPdfReportContent(dashboardMetrics, filteredProducts);
            
            await generatePdfReport({
                reportContent,
                metrics: dashboardMetrics,
                products: filteredProducts,
            });

        } catch (error) {
            console.error("Failed to generate PDF report:", error);
            alert(`Sorry, there was an error creating the PDF report: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleGenerateForecast = async () => {
        setIsGeneratingForecast(true);
        setIsForecastModalOpen(true);
        setForecastData([]);
        try {
            const forecast = await getSalesForecastAndSuggestions(calculatedProducts);
            setForecastData(forecast);
        } catch (error) {
            console.error("Failed to generate forecast", error);
            // We can show an error in the modal itself.
        } finally {
            setIsGeneratingForecast(false);
        }
    };
    
    const renderWidgets = (
        widgetComponents: Array<{ id: WidgetId; component: React.ReactNode }>
    ) => {
        return widgetComponents
            .filter((w) => widgetConfig[w.id]?.visible)
            .sort((a, b) => (widgetConfig[a.id]?.order || 0) - (widgetConfig[b.id]?.order || 0))
            .map((w) => <React.Fragment key={w.id}>{w.component}</React.Fragment>);
    };

    const mainWidgets = [
        { id: 'aiOverview' as WidgetId, component: <AIOverview content={aiOverviewContent} /> },
        { id: 'complianceChecklist' as WidgetId, component: <ComplianceChecklist /> },
    ];

    const dashboardTabWidgets = [
        { id: 'profitabilityCharts' as WidgetId, component: <ProfitabilityCharts products={filteredProducts} allProducts={calculatedProducts} theme={theme} hoveredProductId={hoveredProductId} setHoveredProductId={setHoveredProductId} onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory}/> },
    ];

    const aiAnalysisTabWidgets = [
        { id: 'geminiInsights' as WidgetId, component: <GeminiInsights products={calculatedProducts} /> },
        { id: 'marketingSimulator' as WidgetId, component: <MarketingSimulator products={calculatedProducts} /> },
    ];

    return (
        <div className="min-h-screen text-brand-text-primary dark:text-gray-200 font-sans">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme} 
                onCustomizeClick={() => setIsCustomizeModalOpen(true)}
                onForecastClick={handleGenerateForecast}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                suggestions={suggestions}
                onSuggestionSelect={handleSuggestionSelect}
                searchContainerRef={searchContainerRef}
            />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">

                 {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPI_Card 
                        title="Total Weekly Profit" 
                        value={`$${dashboardMetrics.totalWeeklyProfit.toFixed(2)}`}
                        icon={<CurrencyDollarIcon />}
                    />
                    <GoalTrackerCard 
                        currentProfit={dashboardMetrics.totalWeeklyProfit}
                        profitGoal={profitGoal}
                        onSetGoal={() => setIsSetGoalModalOpen(true)}
                    />
                    <KPI_Card 
                        title="Average Profit Margin" 
                        value={`${dashboardMetrics.averageMargin.toFixed(1)}%`}
                        icon={<TrendingUpIcon />}
                    />
                    <KPI_Card 
                        title="Top Product (by Profit)" 
                        value={dashboardMetrics.topProductByProfit?.name || 'N/A'}
                        icon={<CubeIcon />}
                        description={dashboardMetrics.topProductByProfit ? `$${dashboardMetrics.topProductByProfit.weeklyProfit.toFixed(2)} profit` : 'No products found'}
                    />
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 flex flex-col gap-8">
                        <ProductInputForm addProduct={addProduct} />
                        <DataUpload loadProducts={loadProducts} />
                        {renderWidgets(mainWidgets)}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {products.length > 0 ? (
                            <>
                                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl shadow-md p-2">
                                    <nav className="flex space-x-2" aria-label="Tabs">
                                        <TabButton name="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                                        <TabButton name="AI Analysis" isActive={activeTab === 'ai_analysis'} onClick={() => setActiveTab('ai_analysis')} />
                                    </nav>
                                </div>

                                {activeTab === 'dashboard' && (
                                     <div className="flex flex-col gap-8 animate-fade-in">
                                        <Card 
                                            title="Product Performance" 
                                            icon={<ChartBarIcon />}
                                            actions={
                                                <ExportDropdown 
                                                    onExportCsv={handleExportCsv}
                                                    onExportPdf={handleExportPdf}
                                                />
                                            }
                                        >
                                            <div className="p-1 md:p-2">
                                                <ProductDataTable 
                                                    products={filteredProducts} 
                                                    removeProduct={removeProduct}
                                                    editProduct={handleEditProduct}
                                                    hoveredProductId={hoveredProductId}
                                                    setHoveredProductId={setHoveredProductId}
                                                />
                                            </div>
                                        </Card>
                                        <div>
                                            {renderWidgets(dashboardTabWidgets)}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'ai_analysis' && (
                                    <div className="flex flex-col gap-8 animate-fade-in">
                                        {renderWidgets(aiAnalysisTabWidgets)}
                                    </div>
                                )}
                            </>
                        ) : (
                             <Card title="Welcome to Your Dashboard!" icon={<SparklesIcon/>}>
                                <div className="p-8 text-center">
                                     <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary/10 mb-5">
                                        <SparklesIcon className="h-8 w-8 text-brand-primary" />
                                    </div>
                                    <h3 className="text-xl font-display font-medium text-brand-primary dark:text-white">Your Dashboard is Ready</h3>
                                    <p className="text-brand-text-secondary dark:text-gray-400 mt-2 max-w-sm mx-auto">Add a product manually or upload a file using the forms on the left to begin your analysis.</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
            {isEditModalOpen && editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onSave={handleUpdateProduct}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
            {isCustomizeModalOpen && (
                <CustomizeDashboardModal
                    config={widgetConfig}
                    onSave={(newConfig) => {
                        setWidgetConfig(newConfig);
                        setIsCustomizeModalOpen(false);
                    }}
                    onClose={() => setIsCustomizeModalOpen(false)}
                />
            )}
             {isForecastModalOpen && (
                <SalesForecastModal
                    isOpen={isForecastModalOpen}
                    onClose={() => setIsForecastModalOpen(false)}
                    isLoading={isGeneratingForecast}
                    data={forecastData}
                />
            )}
            {isSetGoalModalOpen && (
                <SetGoalModal
                    currentGoal={profitGoal}
                    onSave={(newGoal) => {
                        setProfitGoal(newGoal);
                        setIsSetGoalModalOpen(false);
                    }}
                    onClose={() => setIsSetGoalModalOpen(false)}
                />
            )}
            {isGeneratingReport && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center text-white">
                    <Spinner />
                    <h3 className="mt-4 text-lg font-semibold font-display">Generating Your Report...</h3>
                    <p className="text-sm">Please wait, the AI is analyzing your data.</p>
                </div>
            )}
            <Footer />
        </div>
    );
};

const TabButton: React.FC<{ name: string; isActive: boolean; onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`${
            isActive ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text-secondary dark:text-gray-400 hover:text-brand-primary dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50'
        } rounded-lg px-4 py-2 text-sm font-bold font-display transition-all duration-200 ease-in-out`}
    >
        {name}
    </button>
);

const KPI_Card: React.FC<{title: string, value: string, icon: React.ReactNode, description?: string}> = ({title, value, icon, description}) => (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5 flex">
        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-brand-primary text-white mr-4">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-sm text-brand-text-secondary dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold font-display text-brand-primary dark:text-white truncate" title={value}>{value}</p>
            {description && <p className="text-xs text-brand-text-secondary dark:text-gray-500 truncate">{description}</p>}
        </div>
    </div>
);

export default App;