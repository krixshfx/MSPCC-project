import React, { useState, useCallback, useRef } from 'react';
import Card from './shared/Card';
import Button from './Button';
import { Product } from '../types';
import { parseUnstructuredData } from '../services/geminiService';
import Spinner from './shared/Spinner';
import { DocumentArrowUpIcon, CheckCircleIcon } from './Icons';

interface DataUploadProps {
    loadProducts: (products: Omit<Product, 'id'>[]) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ loadProducts }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setSuccess('');
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = useCallback(async (fileToUpload: File) => {
        if (!fileToUpload) {
            setError('Please select a file to upload.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const fileContent = await fileToUpload.text();
            if (!fileContent.trim()) {
                throw new Error("File is empty or could not be read.");
            }
            const newProducts = await parseUnstructuredData(fileContent);

            if (!newProducts || newProducts.length === 0) {
                throw new Error("AI could not find any valid product data in the file.");
            }

            loadProducts(newProducts);
            setSuccess(`${newProducts.length} products loaded successfully!`);
            setFile(null);
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred during AI parsing.');
        } finally {
            setIsLoading(false);
        }
    }, [loadProducts]);
    
    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            handleUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };


    return (
        <Card title="Upload Product Data" icon={<DocumentArrowUpIcon />}>
            <div className="p-6 space-y-4">
                <div 
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragging ? 'border-brand-primary bg-brand-primary/10' : 'border-gray-300 dark:border-gray-600 hover:border-brand-primary/50'}`}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center space-y-2 text-brand-text-secondary dark:text-gray-400">
                        <DocumentArrowUpIcon className="w-10 h-10"/>
                         <p className="font-semibold">Drag & drop your file here</p>
                         <p className="text-sm">or <span className="font-bold text-brand-primary">click to browse</span></p>
                         <p className="text-xs mt-2">Supports .csv, .txt, .json</p>
                    </div>
                     <input ref={fileInputRef} id="file-upload" type="file" onChange={handleFileChange} accept=".csv,.txt,.json,text/*" className="sr-only" />
                </div>
                
                {file && !isLoading && !error && !success && (
                    <div className="text-center">
                        <p className="text-sm font-medium">Selected file: {file.name}</p>
                        <Button onClick={() => handleUpload(file)} disabled={isLoading} className="mt-2">
                             {isLoading ? <Spinner /> : 'Upload and Replace Data'}
                        </Button>
                    </div>
                )}
                
                {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                {success && <div className="p-3 flex items-center space-x-2 bg-brand-accent-profit/10 text-brand-accent-profit rounded-md text-sm font-medium"><CheckCircleIcon /> <span>{success}</span></div>}
                 {isLoading && (
                    <div className="flex items-center justify-center space-x-2 text-brand-primary dark:text-white">
                        <Spinner />
                        <span className="font-semibold">AI is Processing...</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default DataUpload;