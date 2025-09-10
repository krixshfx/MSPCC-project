import React, { useState } from 'react';
import { WidgetConfig, WidgetId } from '../types';
import Button from './Button';
import { DEFAULT_WIDGET_CONFIG } from '../constants';
import { XIcon, ChevronUpIcon, ChevronDownIcon, EyeIcon, EyeOffIcon } from './Icons';


const WIDGET_DEFINITIONS: Record<string, { id: WidgetId; name: string }[]> = {
    main: [
        { id: 'complianceChecklist', name: 'Compliance Checklist' },
    ],
    dashboardTab: [
        { id: 'profitabilityCharts', name: 'Visual Reports' },
    ],
    aiAnalysisTab: [
        { id: 'geminiInsights', name: 'AI-Powered Insights' },
        { id: 'marketingSimulator', name: 'Marketing ROI Simulator' },
    ],
};

interface CustomizeDashboardModalProps {
    config: WidgetConfig;
    onSave: (newConfig: WidgetConfig) => void;
    onClose: () => void;
}

const CustomizeDashboardModal: React.FC<CustomizeDashboardModalProps> = ({ config, onSave, onClose }) => {
    const [localConfig, setLocalConfig] = useState<WidgetConfig>(JSON.parse(JSON.stringify(config)));

    const handleReset = () => {
        setLocalConfig(DEFAULT_WIDGET_CONFIG);
    };

    const handleToggleVisibility = (widgetId: WidgetId) => {
        setLocalConfig(prev => ({
            ...prev,
            [widgetId]: { ...prev[widgetId], visible: !prev[widgetId].visible },
        }));
    };

    const handleMove = (
        group: { id: WidgetId; name: string }[],
        index: number,
        direction: 'up' | 'down'
    ) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= group.length) return;

        const widgetToMoveId = group[index].id;
        const widgetToSwapId = group[newIndex].id;
        
        const orderToMove = localConfig[widgetToMoveId].order;
        const orderToSwap = localConfig[widgetToSwapId].order;

        setLocalConfig(prev => ({
            ...prev,
            [widgetToMoveId]: { ...prev[widgetToMoveId], order: orderToSwap },
            [widgetToSwapId]: { ...prev[widgetToSwapId], order: orderToMove },
        }));
    };

    const renderGroup = (title: string, widgetIds: { id: WidgetId; name: string }[]) => {
        const sortedWidgets = [...widgetIds].sort((a, b) => (localConfig[a.id]?.order || 0) - (localConfig[b.id]?.order || 0));

        return (
            <div key={title}>
                <h3 className="text-md font-semibold font-display text-brand-primary dark:text-gray-300 mb-2">{title}</h3>
                <ul className="space-y-2 rounded-lg bg-gray-100 dark:bg-gray-900/50 p-3">
                    {sortedWidgets.map((widget, index) => (
                        <li key={widget.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <span className="font-medium text-brand-text-primary dark:text-gray-200">{widget.name}</span>
                            <div className="flex items-center space-x-3">
                                {/* Reorder Controls */}
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleMove(sortedWidgets, index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                                        aria-label={`Move ${widget.name} up`}
                                    >
                                        <ChevronUpIcon />
                                    </button>
                                    <button
                                        onClick={() => handleMove(sortedWidgets, index, 'down')}
                                        disabled={index === sortedWidgets.length - 1}
                                        className="p-1 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                                        aria-label={`Move ${widget.name} down`}
                                    >
                                        <ChevronDownIcon />
                                    </button>
                                </div>
                                {/* Visibility Toggle */}
                                <button onClick={() => handleToggleVisibility(widget.id)} aria-label={`Toggle visibility for ${widget.name}`}>
                                    {localConfig[widget.id]?.visible ? <EyeIcon /> : <EyeOffIcon />}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in-fast"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200">Customize Dashboard</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                    {renderGroup('Main Column Widgets', WIDGET_DEFINITIONS.main)}
                    {renderGroup('Dashboard Tab Widgets', WIDGET_DEFINITIONS.dashboardTab)}
                    {renderGroup('AI Analysis Tab Widgets', WIDGET_DEFINITIONS.aiAnalysisTab)}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center rounded-b-lg">
                    <Button 
                        type="button" 
                        onClick={handleReset} 
                        variant="danger"
                    >
                        Reset Layout
                    </Button>
                    <div className="flex justify-end space-x-3">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="button" onClick={() => onSave(localConfig)}>Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizeDashboardModal;