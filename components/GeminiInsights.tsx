import React, { useState } from 'react';
import { CalculatedProduct } from '../types';
import { getAiInsight } from '../services/geminiService';
import Card from './shared/Card';
import Button from './Button';
import { SparklesIcon } from './Icons';

// Simple markdown to HTML parser
const parseMarkdownToHTML = (text: string) => {
    let html = text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-brand-primary dark:text-white">$1</strong>')
        // Bullets
        .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
        // Wrap bullet groups in <ul>
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        // Newlines
        .replace(/\n/g, '<br />');
    
    // Clean up adjacent <br> tags from list conversion
    html = html.replace(/<\/li><br \/>/g, '</li>');
    html = html.replace(/<br \/><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br \/>/g, '</ul>');

    return html;
};

const ShimmerLoader: React.FC = () => (
    <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-shimmer"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-shimmer"></div>
        </div>
         <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-shimmer"></div>
    </div>
);

// FIX: Define the props interface for the component.
interface GeminiInsightsProps {
    products: CalculatedProduct[];
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ products }) => {
    const [question, setQuestion] = useState('Which product has the worst margin and why? What should I do?');
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGetInsight = async () => {
        if (!question) {
            setError('Please enter a question.');
            return;
        }
        setIsLoading(true);
        setError('');
        setInsight('');
        try {
            const result = await getAiInsight(products, question);
            setInsight(result);
        } catch (err) {
            setError('Failed to get insights from AI. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI-Powered Insights" icon={<SparklesIcon />}>
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="ai-question" className="block text-sm font-medium text-brand-text-secondary dark:text-gray-300 mb-2">
                        Ask Gemini about your data:
                    </label>
                    <textarea
                        id="ai-question"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary dark:bg-gray-900/50 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., How can I improve profitability?"
                    />
                </div>
                <Button onClick={handleGetInsight} disabled={isLoading || products.length === 0} fullWidth>
                    Get AI Insight
                </Button>
                {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                
                <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg min-h-[100px] flex items-center">
                    {isLoading ? (
                        <ShimmerLoader />
                    ) : insight ? (
                        <div 
                            className="prose prose-sm max-w-none text-brand-text-secondary dark:text-gray-300 prose-p:my-1 prose-ul:my-2 prose-li:my-0.5"
                            dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(insight) }} 
                        />
                    ) : (
                        <p className="text-center w-full text-brand-text-secondary dark:text-gray-400 text-sm">Your AI-generated insight will appear here.</p>
                    )}
                </div>

            </div>
        </Card>
    );
};

export default GeminiInsights;