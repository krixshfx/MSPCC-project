import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-transparent mt-16">
            <div className="container mx-auto px-4 md:px-6 py-6 text-center text-sm text-brand-text-secondary dark:text-gray-500">
                <p>&copy; {new Date().getFullYear()} MSPCC Analytical Dashboard. All Rights Reserved.</p>
                <p className="mt-1">Powered by <a href="https://deepmind.google/technologies/gemini/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary dark:text-brand-accent-profit hover:underline">Gemini AI</a></p>
            </div>
        </footer>
    );
};

export default Footer;