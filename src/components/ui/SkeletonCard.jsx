import React from 'react';

export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-4 animate-pulse ${className}`}>
            <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between gap-2">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
        </div>
    );
};

export const SkeletonStat = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 animate-pulse ${className}`}>
            <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                <div className="space-y-2 text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 ml-auto"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonRow = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-lg p-4 animate-pulse flex items-center justify-between ${className}`}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
    );
};
