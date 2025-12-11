import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';

export default function AdminStats({ stats }) {
    const statCards = [
        {
            label: 'Pending',
            value: stats.pending || 0,
            icon: Clock,
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            iconColor: 'text-yellow-600'
        },
        {
            label: 'Approved',
            value: stats.approved || 0,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            iconColor: 'text-green-600'
        },
        {
            label: 'Rejected',
            value: stats.rejected || 0,
            icon: XCircle,
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            iconColor: 'text-red-600'
        },
        {
            label: 'Total',
            value: stats.total || 0,
            icon: Users,
            color: 'blue',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconColor: 'text-blue-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-full`}>
                                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
