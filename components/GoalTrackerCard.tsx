
import React from 'react';
import { TargetIcon, PencilIcon } from './Icons';

interface GoalTrackerCardProps {
    currentProfit: number;
    profitGoal: number;
    onSetGoal: () => void;
}

const GoalTrackerCard: React.FC<GoalTrackerCardProps> = ({ currentProfit, profitGoal, onSetGoal }) => {
    const progress = profitGoal > 0 ? Math.min((currentProfit / profitGoal) * 100, 100) : 0;
    const isGoalMet = progress >= 100;

    return (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg p-5">
            <div className="flex justify-between items-start">
                 <div className="flex items-start space-x-4">
                     <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full bg-brand-primary text-white">
                        <TargetIcon />
                    </div>
                    <div>
                        <p className="text-sm text-brand-text-secondary dark:text-gray-400 font-medium">Weekly Profit Goal</p>
                        <p className="text-2xl font-bold font-display text-brand-primary dark:text-white truncate">
                            ${profitGoal.toLocaleString()}
                        </p>
                    </div>
                 </div>
                 <button onClick={onSetGoal} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Set new profit goal">
                     <PencilIcon className="w-4 h-4" />
                 </button>
            </div>
            <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold text-brand-text-secondary dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className={isGoalMet ? 'text-brand-accent-profit' : 'text-brand-primary dark:text-white'}>
                        {progress.toFixed(0)}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                        className={`rounded-full h-2.5 transition-all duration-500 ease-out ${isGoalMet ? 'bg-brand-accent-profit' : 'bg-brand-primary'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default GoalTrackerCard;