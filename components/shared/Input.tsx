import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const Input: React.FC<InputProps> = ({ label, id, type = 'text', value, ...props }) => {
    return (
        <div className="relative">
            <input
                id={id}
                type={type}
                value={value}
                {...props}
                placeholder=" " // The space is crucial for the peer selector to work
                className="block px-3.5 pb-2.5 pt-4 w-full text-sm text-brand-text-primary dark:text-white bg-transparent rounded-lg border border-gray-300 dark:border-gray-600 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary peer transition"
            />
            <label
                htmlFor={id}
                className="absolute text-sm text-brand-text-secondary dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/0 dark:bg-transparent px-2 peer-focus:px-2 peer-focus:text-brand-primary peer-focus:dark:text-brand-accent-profit peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                {label}
            </label>
        </div>
    );
};

export default Input;