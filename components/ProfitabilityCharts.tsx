import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, ComposedChart, Scatter, LabelList, LineChart, Line, ScatterChart } from 'recharts';
import { CalculatedProduct } from '../types';
import Card from './shared/Card';
// FIX: Import missing icons and adjust ChartBarIcon import.
import { PresentationChartLineIcon, BriefcaseIcon, DairyIcon, BakeryIcon, PantryIcon, DrinksIcon, ProduceIcon, GenericProductIcon, XCircleIcon, ChartBarIcon, LineChartIcon, ScatterChartIcon } from './Icons';

interface ProfitabilityChartsProps {
    products: CalculatedProduct[];
    allProducts: CalculatedProduct[];
    hoveredProductId: number | null;
    setHoveredProductId: (id: number | null) => void;
    theme: string;
    onCategorySelect: (category: string | null) => void;
    selectedCategory: string | null;
}

type ChartType = 'bar' | 'line' | 'scatter';

const getCategoryIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
        case 'dairy': return <DairyIcon />;
        case 'bakery': return <BakeryIcon />;
        case 'pantry': return <PantryIcon />;
        case 'drinks': return <DrinksIcon />;
        case 'produce': return <ProduceIcon />;
        default: return <GenericProductIcon />;
    }
};

const CustomTooltip = ({ active, payload, label, theme, formatter, unit = '', extraField, extraFieldFormatter }: any) => {
  const tooltipBg = theme === 'dark' ? 'rgba(15, 37, 87, 0.8)' : 'rgba(255, 255, 255, 0.9)';
  const textColor = theme === 'dark' ? '#f3f4f6' : '#0F2557';
  const labelColor = theme === 'dark' ? '#d1d5db' : '#4b5563';

  if (active && payload && payload.length) {
    const data = payload[0];
    const extraData = data.payload[extraField];
    const formattedValue = formatter ? formatter(data.value) : `${data.value}${unit}`;
    const formattedExtra = extraFieldFormatter ? extraFieldFormatter(extraData) : extraData;

    return (
      <div style={{ backgroundColor: tooltipBg, backdropFilter: 'blur(5px)' }} className="p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p style={{ color: labelColor }} className="text-sm font-bold font-display mb-1">{label}</p>
        <p style={{ color: textColor }} className="text-sm font-sans">
          <span className="font-semibold">{data.name}:</span> {formattedValue}
        </p>
        {extraField && extraData !== undefined && (
            <p style={{ color: labelColor }} className="text-xs font-sans mt-1">
                <span className="font-semibold">{extraField.charAt(0).toUpperCase() + extraField.slice(1)}:</span> {formattedExtra}
            </p>
        )}
      </div>
    );
  }
  return null;
};

const HorizontalBarLabel = (props: any) => {
    const { y, width, payload } = props;
    
    // FIX: Add a check for payload to prevent crash on initial render.
    if (!payload || !payload.category) {
        return null;
    }

    const isDark = document.documentElement.classList.contains('dark');
    const iconColor = isDark ? '#F8F9FA' : '#0F2557';

    if (width < 30) {
        return null;
    }

    return (
        <g transform={`translate(${width - 25}, ${y + 2})`}>
           <foreignObject width="20" height="20" color={iconColor}>
                {getCategoryIcon(payload.category)}
           </foreignObject>
        </g>
    );
};


const COLORS_LIGHT = ['#4ECDC4', '#4B8F8C', '#5A6E8C', '#2E4057', '#0F2557', '#93c5fd'];
const COLORS_DARK = ['#4ECDC4', '#58A49E', '#7B8DA8', '#5A6E8C', '#3c5a8e', '#7dd3fc'];

const ProfitabilityCharts: React.FC<ProfitabilityChartsProps> = ({ products, allProducts, hoveredProductId, setHoveredProductId, theme, onCategorySelect, selectedCategory }) => {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const handleMouseMove = (state: any) => {
        if (state.isTooltipActive && state.activePayload && state.activePayload.length > 0) {
            const id = state.activePayload[0].payload.id;
            if (hoveredProductId !== id) {
                setHoveredProductId(id);
            }
        }
    };

    const handleMouseLeave = () => {
        setHoveredProductId(null);
    };

    const revenueByCategory = useMemo(() => {
        const categoryMap = new Map<string, number>();
        allProducts.forEach(p => {
            if (p.category && p.weeklyRevenue) {
                const categoryName = p.category;
                const currentRevenue = categoryMap.get(categoryName) || 0;
                categoryMap.set(categoryName, currentRevenue + p.weeklyRevenue);
            }
        });
         if (categoryMap.size === 0) return [];
        return Array.from(categoryMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [allProducts]);
    
    const totalRevenue = useMemo(() => revenueByCategory.reduce((sum, cat) => sum + cat.value, 0), [revenueByCategory]);


    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const COLORS = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

    const currencyFormatter = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const percentFormatter = (value: number) => `${value.toFixed(1)}%`;

    const filterBadge = selectedCategory ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-gray-200">
            Filter: {selectedCategory}
            <button
                onClick={() => onCategorySelect(null)}
                className="flex-shrink-0 ml-1.5 p-0.5 rounded-full inline-flex items-center justify-center text-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/20 focus:outline-none focus:bg-brand-primary/20 focus:text-brand-primary"
                aria-label={`Remove ${selectedCategory} filter`}
            >
                <XCircleIcon />
            </button>
        </span>
    ) : null;

    const renderWeeklyProfitChart = () => {
        const commonProps = {
            margin: { top: 5, right: 30, left: 20, bottom: 5 },
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave
        };

        const commonTooltip = <Tooltip
            content={<CustomTooltip theme={theme} formatter={currencyFormatter} extraField="margin" extraFieldFormatter={percentFormatter}/>}
            cursor={{ fill: 'rgba(15, 37, 87, 0.05)' }}
        />;

        switch (chartType) {
            case 'line':
                return (
                     <LineChart data={products} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} angle={-25} textAnchor="end" height={70} interval={0}/>
                        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                        {commonTooltip}
                        <Line type="monotone" dataKey="weeklyProfit" name="Weekly Profit" stroke={theme === 'dark' ? COLORS_DARK[0] : COLORS_LIGHT[0]} strokeWidth={2} dot={{ r: 4, fill: theme === 'dark' ? COLORS_DARK[0] : COLORS_LIGHT[0] }} activeDot={{ r: 6, stroke: theme === 'dark' ? '#FF6B6B' : '#0A1A3A', strokeWidth: 2 }} animationDuration={500} animationEasing="ease-in-out"/>
                    </LineChart>
                );
            case 'scatter':
                return (
                    <ScatterChart data={products} {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis type="category" dataKey="name" name="Product" tick={{ fill: tickColor, fontSize: 12 }} angle={-25} textAnchor="end" height={70} interval={0}/>
                        <YAxis type="number" dataKey="weeklyProfit" name="Weekly Profit" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                        {commonTooltip}
                        <Scatter name="Weekly Profit" dataKey="weeklyProfit" animationDuration={500} animationEasing="ease-in-out">
                             {products.map((entry) => (
                                <Cell key={`cell-${entry.id}`} fill={entry.id === hoveredProductId ? (theme === 'dark' ? '#FF6B6B' : '#0A1A3A') : (theme === 'dark' ? '#4ECDC4' : '#0F2557')} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart
                        layout="vertical"
                        data={products}
                        {...commonProps}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                        <XAxis type="number" tickFormatter={(value) => `$${value}`} tick={{ fill: tickColor, fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: tickColor, fontSize: 12 }} />
                        {commonTooltip}
                        <Bar dataKey="weeklyProfit" name="Weekly Profit" barSize={25} animationDuration={500} animationEasing="ease-in-out">
                            {products.map((entry) => (
                                <Cell key={`cell-${entry.id}`} fill={entry.id === hoveredProductId ? (theme === 'dark' ? '#FF6B6B' : '#0A1A3A') : (theme === 'dark' ? '#4ECDC4' : '#0F2557')} />
                            ))}
                            <LabelList dataKey="weeklyProfit" content={<HorizontalBarLabel />} />
                        </Bar>
                    </BarChart>
                );
        }
    };
    
    return (
        <Card title="Visual Reports" icon={<PresentationChartLineIcon />} badge={filterBadge}>
            <div className="p-6 space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className="flex items-center justify-center space-x-4 mb-4">
                             <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300">Weekly Profit by Product</h3>
                             <div className="flex items-center space-x-1 bg-gray-200/50 dark:bg-gray-900/50 p-1 rounded-lg">
                                 <ChartTypeToggle icon={<ChartBarIcon className="w-5 h-5"/>} type="bar" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<LineChartIcon className="w-5 h-5"/>} type="line" activeType={chartType} setType={setChartType} />
                                 <ChartTypeToggle icon={<ScatterChartIcon className="w-5 h-5"/>} type="scatter" activeType={chartType} setType={setChartType} />
                             </div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                           {renderWeeklyProfitChart()}
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold font-display text-brand-primary dark:text-gray-300 mb-4 text-center">Profit Margin by Product</h3>
                        <ResponsiveContainer width="100%" height={350}>
                           <ComposedChart
                                data={products}
                                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} angle={-25} textAnchor="end" height={70} interval={0} />
                                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: tickColor }} />
                                <Tooltip
                                    content={<CustomTooltip theme={theme} unit="%" extraField="weeklyProfit" extraFieldFormatter={currencyFormatter} />}
                                    cursor={{ fill: 'rgba(78, 205, 196, 0.1)' }}
                                />
                                <Bar dataKey="margin" name="Margin" barSize={4} animationDuration={500} animationEasing="ease-in-out">
                                    {products.map((entry) => (
                                        <Cell key={`cell-${entry.id}`} fill={theme === 'dark' ? '#7B8DA8' : '#AAB7CD'} />
                                    ))}
                                </Bar>
                                <Scatter dataKey="margin" name="Margin" animationDuration={500} animationEasing="ease-in-out">
                                    {products.map((entry) => (
                                        <Cell key={`cell-${entry.id}`} fill={entry.id === hoveredProductId ? (theme === 'dark' ? '#FF6B6B' : '#0A1A3A') : (theme === 'dark' ? '#4ECDC4' : '#0F2557')} />
                                    ))}
                                </Scatter>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {revenueByCategory.length > 0 && (
                <div className="mt-6">
                    <div className="p-6 border-t border-gray-200/80 dark:border-gray-700/80">
                         <div className="flex items-center space-x-3 mb-4">
                            <span className="text-brand-primary dark:text-brand-accent-profit"><BriefcaseIcon /></span>
                            <h2 className="text-xl font-semibold font-display text-brand-primary dark:text-gray-200">Category Revenue Analysis</h2>
                        </div>
                         <div className="text-center relative">
                             <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={revenueByCategory} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={110} 
                                        innerRadius={70}
                                        paddingAngle={2}
                                        fill="#8884d8" 
                                        labelLine={false} 
                                        animationDuration={500}
                                        animationEasing="ease-in-out"
                                        onClick={(data) => onCategorySelect(data.name)}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
                                        const RADIAN = Math.PI / 180;
                                        // FIX: Add a check for NaN to prevent crash on initial render.
                                        if (isNaN(midAngle) || isNaN(innerRadius) || isNaN(outerRadius)) return null;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-xs pointer-events-none">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}>
                                        {revenueByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer focus:outline-none" />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={currencyFormatter} content={<CustomTooltip theme={theme}/>} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm text-brand-text-secondary dark:text-gray-400">Total Revenue</span>
                                <span className="text-2xl font-bold font-display text-brand-primary dark:text-white">{currencyFormatter(totalRevenue)}</span>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const ChartTypeToggle: React.FC<{
    icon: React.ReactNode;
    type: ChartType;
    activeType: ChartType;
    setType: (type: ChartType) => void;
}> = ({ icon, type, activeType, setType }) => {
    const isActive = type === activeType;
    return (
        <button
            onClick={() => setType(type)}
            className={`p-1.5 rounded-md transition-colors ${
                isActive
                    ? 'bg-brand-primary text-white shadow'
                    : 'text-brand-text-secondary dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60'
            }`}
            aria-label={`Switch to ${type} chart`}
        >
            {icon}
        </button>
    );
};

export default ProfitabilityCharts;