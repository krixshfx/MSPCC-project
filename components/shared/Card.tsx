import React from 'react';

interface CardProps {
    title: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    badge?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, actions, children, className = '', badge }) => {
    return (
        <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg ${className}`}>
            <div className="p-5 border-b border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                    {icon && <span className="text-brand-primary dark:text-brand-accent-profit">{icon}</span>}
                    <div className="flex items-center space-x-2 min-w-0">
                        <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200 truncate">{title}</h2>
                        {badge && <div>{badge}</div>}
                    </div>
                </div>
                {actions && <div className="flex-shrink-0 ml-4">{actions}</div>}
            </div>
            {children}
        </div>
    );
};

export default Card;
