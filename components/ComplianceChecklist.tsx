import React, { useState } from 'react';
import { ComplianceTask } from '../types';
import { generateComplianceChecklist } from '../services/geminiService';
import Card from './shared/Card';
import Input from './shared/Input';
import Button from './Button';
import Spinner from './shared/Spinner';
import { ClipboardCheckIcon } from './Icons';

const ComplianceChecklist: React.FC = () => {
    const [location, setLocation] = useState('California, USA');
    const [businessType, setBusinessType] = useState('Grocery Store');
    const [checklist, setChecklist] = useState<ComplianceTask[]>([]);
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateChecklist = async () => {
        if (!location || !businessType) {
            setError('Please enter a location and business type.');
            return;
        }
        setIsLoading(true);
        setError('');
        setChecklist([]);
        setCheckedItems({});
        try {
            const result = await generateComplianceChecklist(location, businessType);
            setChecklist(result);
        } catch (err) {
            setError('Failed to generate checklist. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCheckItem = (task: string) => {
        setCheckedItems(prev => ({...prev, [task]: !prev[task]}));
    };

    return (
        <Card title="Compliance Checklist" icon={<ClipboardCheckIcon />}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <Input
                        label="Business Location"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., New York, USA"
                    />
                    <Input
                        label="Business Type"
                        id="businessType"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        placeholder="e.g., Cafe, Retail"
                    />
                </div>
                <Button onClick={handleGenerateChecklist} disabled={isLoading} fullWidth>
                    {isLoading ? <Spinner /> : 'Generate Checklist'}
                </Button>
                {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                {checklist.length > 0 && (
                    <div className="space-y-3 mt-4 max-h-80 overflow-y-auto pr-2">
                        {checklist.map((item, index) => (
                            <div key={index} className="relative flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id={`task-${index}`}
                                        name={`task-${index}`}
                                        type="checkbox"
                                        checked={!!checkedItems[item.task]}
                                        onChange={() => handleCheckItem(item.task)}
                                        className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor={`task-${index}`} className={`font-medium text-brand-text-primary dark:text-gray-300 ${checkedItems[item.task] ? 'line-through text-brand-text-secondary dark:text-gray-500' : ''}`}>
                                        {item.task}
                                    </label>
                                    <p className="text-brand-text-secondary dark:text-gray-400">{item.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};


export default ComplianceChecklist;