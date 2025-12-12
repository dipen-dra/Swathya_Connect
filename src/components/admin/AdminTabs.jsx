import React from 'react';
import { Badge } from '@/components/ui/badge';

export default function AdminTabs({ activeTab, onTabChange, counts = {} }) {
    const tabs = [
        { id: 'overview', label: 'Overview', count: null },
        { id: 'pending', label: 'Pending', count: counts.pending || 0, color: 'yellow' },
        { id: 'approved', label: 'Approved', count: counts.approved || 0, color: 'green' },
        { id: 'rejected', label: 'Rejected', count: counts.rejected || 0, color: 'red' },
        { id: 'users', label: 'All Users', count: counts.total || 0, color: 'blue' }
    ];

    const getTabStyles = (tab) => {
        const isActive = activeTab === tab.id;
        return `
            relative px-6 py-3 font-medium text-sm transition-all duration-200
            ${isActive
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300'
            }
        `;
    };

    const getBadgeColor = (color) => {
        const colors = {
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            red: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[color] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm rounded-t-lg">
            <div className="flex justify-center space-x-1 px-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={getTabStyles(tab)}
                    >
                        <div className="flex items-center space-x-2">
                            <span>{tab.label}</span>
                            {tab.count !== null && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${getBadgeColor(tab.color)}`}
                                >
                                    {tab.count}
                                </Badge>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
