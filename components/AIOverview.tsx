
import React, { useEffect, useRef } from 'react';
import Card from './shared/Card';
import { LightBulbIcon } from './Icons';

interface AIOverviewProps {
    content: string;
}

// Simple markdown to HTML parser
const parseMarkdownToHTML = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n/g, '<br />')
        .replace(/<\/li><br \/>/g, '</li>')
        .replace(/<br \/><ul>/g, '<ul>')
        .replace(/<\/ul><br \/>/g, '</ul>');
};

const ShimmerLoader: React.FC = () => (
    <div className="space-y-3 w-full">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
    </div>
);


const AIOverview: React.FC<AIOverviewProps> = ({ content }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to the bottom of the content as it streams in
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [content]);

    return (
        <Card title="Live AI Business Overview" icon={<LightBulbIcon />}>
            <div className="p-4 h-48 flex flex-col">
                <div 
                    ref={contentRef}
                    className="prose prose-sm max-w-none text-brand-text-secondary dark:text-gray-300 prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 flex-grow overflow-y-auto"
                >
                     {content ? (
                        <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(content) }} />
                    ) : (
                        <ShimmerLoader />
                    )}
                </div>
                <div className="flex items-center justify-end text-xs text-gray-400 dark:text-gray-500 mt-2">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-profit opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent-profit"></span>
                    </span>
                    Live Analysis
                </div>
            </div>
        </Card>
    );
};

export default AIOverview;