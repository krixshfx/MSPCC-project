import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, variant = 'primary', className = '', ...props }) => {
    
    const baseClasses = "inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold font-display rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg";
    
    const variantClasses = {
        primary: 'text-white bg-brand-primary hover:bg-brand-primary-dark focus:ring-brand-primary',
        secondary: 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 focus:ring-brand-primary dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600',
        danger: 'text-white bg-brand-accent-warning hover:bg-red-700 focus:ring-brand-accent-warning',
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            {...props}
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;