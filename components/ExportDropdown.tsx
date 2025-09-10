

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import { ChevronDownIcon, DocumentArrowDownIcon, DocumentTextIcon } from './Icons';

interface ExportDropdownProps {
    onExportCsv: () => void;
    onExportPdf: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExportCsv, onExportPdf }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCsvClick = () => {
        onExportCsv();
        setIsOpen(false);
    };

    const handlePdfClick = () => {
        onExportPdf();
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    variant="secondary"
                    className="!py-1 !px-3 !text-xs !font-semibold inline-flex items-center"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    Export
                    <ChevronDownIcon />
                </Button>
            </div>

            {isOpen && (
                <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        <button
                            onClick={handleCsvClick}
                            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <DocumentArrowDownIcon />
                            <span>Export as CSV</span>
                        </button>
                        <button
                            onClick={handlePdfClick}
                            className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            <DocumentTextIcon />
                            <span>Export as PDF Report</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;