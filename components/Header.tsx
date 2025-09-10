
import React, { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, CogIcon, UserCircleIcon, SearchIcon, ClipboardListIcon } from './Icons';

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    onCustomizeClick: () => void;
    onForecastClick: () => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    suggestions: string[];
    onSuggestionSelect: (suggestion: string) => void;
    searchContainerRef: React.RefObject<HTMLDivElement>;
}

const Header: React.FC<HeaderProps> = ({ 
    theme, 
    toggleTheme, 
    onCustomizeClick,
    onForecastClick,
    searchTerm, 
    onSearchChange, 
    suggestions, 
    onSuggestionSelect, 
    searchContainerRef 
}) => {
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        setActiveIndex(-1);
    }, [suggestions]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter') {
            if (activeIndex > -1) {
                e.preventDefault();
                onSuggestionSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            onSearchChange(''); // Effectively clears suggestions
        }
    };

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
                {/* Left Side */}
                <div className="flex items-center space-x-3">
                     <div className="p-2 bg-brand-primary rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                     </div>
                    <h1 className="text-xl md:text-2xl font-bold font-display text-brand-primary dark:text-gray-200 hidden sm:block">MSPCC Dashboard</h1>
                </div>

                {/* Center Search */}
                <div className="flex-1 flex justify-center px-4">
                    <div ref={searchContainerRef} className="relative w-full max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                            className="block w-full bg-gray-100 dark:bg-gray-800 border-transparent rounded-full py-2 pl-10 pr-4 text-brand-text-primary dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition"
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute mt-2 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-gray-700">
                                {suggestions.map((suggestion, index) => (
                                    <li 
                                        key={suggestion}
                                        className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors ${
                                            index === activeIndex 
                                            ? 'bg-brand-primary text-white' 
                                            : 'text-brand-text-primary dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => onSuggestionSelect(suggestion)}
                                        onMouseEnter={() => setActiveIndex(index)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                 {/* Right Side */}
                 <div className="flex items-center space-x-1">
                     <HeaderButton onClick={onForecastClick} aria-label="Generate sales forecast">
                        <ClipboardListIcon />
                    </HeaderButton>
                     <HeaderButton onClick={onCustomizeClick} aria-label="Customize dashboard layout">
                        <CogIcon />
                    </HeaderButton>
                    <HeaderButton onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </HeaderButton>
                     <HeaderButton onClick={() => {}} aria-label="User profile">
                        <UserCircleIcon />
                    </HeaderButton>
                 </div>
            </div>
        </header>
    );
};

const HeaderButton: React.FC<{onClick: () => void, "aria-label": string, children: React.ReactNode}> = ({ onClick, "aria-label": ariaLabel, children }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full text-brand-text-secondary dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-colors"
        aria-label={ariaLabel}
    >
        {children}
    </button>
);


export default Header;