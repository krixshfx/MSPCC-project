
import React, { useState } from 'react';
import Input from './shared/Input';
import Button from './Button';
import { XIcon } from './Icons';

interface SetGoalModalProps {
    currentGoal: number;
    onSave: (newGoal: number) => void;
    onClose: () => void;
}

const SetGoalModal: React.FC<SetGoalModalProps> = ({ currentGoal, onSave, onClose }) => {
    const [goal, setGoal] = useState(currentGoal.toString());
    const [error, setError] = useState('');

    const handleSave = () => {
        const newGoal = parseFloat(goal);
        if (isNaN(newGoal) || newGoal <= 0) {
            setError('Please enter a valid, positive number for your goal.');
            return;
        }
        onSave(newGoal);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-fade-in-fast"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                 <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold font-display text-brand-primary dark:text-gray-200">Set Weekly Profit Goal</h2>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                     {error && <div className="p-3 bg-brand-accent-warning/10 text-brand-accent-warning rounded-md text-sm font-medium">{error}</div>}
                    <Input
                        label="Profit Goal ($)"
                        id="profitGoal"
                        type="number"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        placeholder="e.g., 2000"
                        step="100"
                    />
                     <div className="pt-2 flex justify-end space-x-3">
                        <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                        <Button type="button" onClick={handleSave}>Set Goal</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetGoalModal;