import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    gradient = 'blue',
    format = 'number'
}) {
    const gradientClasses = {
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
        green: 'bg-gradient-to-br from-emerald-500 to-green-600',
        purple: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        orange: 'bg-gradient-to-br from-orange-500 to-amber-600',
        red: 'bg-gradient-to-br from-red-500 to-rose-600',
        teal: 'bg-gradient-to-br from-teal-500 to-cyan-600',
        pink: 'bg-gradient-to-br from-pink-500 to-rose-600',
        indigo: 'bg-gradient-to-br from-indigo-500 to-purple-600'
    };

    const formatValue = (val) => {
        if (format === 'currency') {
            return `NPR ${val.toLocaleString()}`;
        }
        return val.toLocaleString();
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-emerald-400 bg-emerald-500/10';
        if (trend === 'down') return 'text-red-400 bg-red-500/10';
        return 'text-gray-400 bg-gray-500/10';
    };

    return (
        <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-105 transition-all duration-300">
            {/* Gradient Background Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradientClasses[gradient]}`}
                style={{ filter: 'blur(100px)', transform: 'scale(1.5)' }} />

            <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                    {/* Icon with Gradient Background */}
                    <div className={`p-3 rounded-xl ${gradientClasses[gradient]} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Trend Badge */}
                    {trendValue && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendColor()} backdrop-blur-sm`}>
                            {getTrendIcon()}
                            <span className="text-xs font-semibold">{trendValue}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                        {title}
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-gray-800 group-hover:to-gray-600 transition-all">
                        {formatValue(value)}
                    </p>
                </div>

                {/* Decorative Corner */}
                <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${gradientClasses[gradient]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            </CardContent>
        </Card>
    );
}
