import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    format = 'number'
}) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        teal: 'bg-teal-100 text-teal-600'
    };

    const formatValue = (val) => {
        if (format === 'currency') {
            return `NPR ${val.toLocaleString()}`;
        }
        return val.toLocaleString();
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-400';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trendValue && (
                        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span className="text-sm font-medium">{trendValue}</span>
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
