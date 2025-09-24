
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 sm:p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-blue-400" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        AI Banner Factory
                    </h1>
                </div>
            </div>
        </header>
    );
};
