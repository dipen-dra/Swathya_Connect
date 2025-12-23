import React from 'react';
import {
    Activity,
    Heart,
    Zap,
    Smile,
    Eye,
    Thermometer,
    Droplets,
    Baby,
    Pill,
    Apple
} from 'lucide-react';

const concerns = [
    { id: 1, title: 'Diabetes', icon: Activity, color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { id: 2, title: 'Heart Care', icon: Heart, color: 'bg-red-100', iconColor: 'text-red-600' },
    { id: 3, title: 'Stomach Care', icon: Apple, color: 'bg-green-100', iconColor: 'text-green-600' },
    { id: 4, title: 'Liver Care', icon: Zap, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    { id: 5, title: 'Bone, Joint', icon: Activity, color: 'bg-purple-100', iconColor: 'text-purple-600' },
    { id: 6, title: 'Kidney Care', icon: Droplets, color: 'bg-cyan-100', iconColor: 'text-cyan-600' },
    { id: 7, title: 'Derma Care', icon: Smile, color: 'bg-pink-100', iconColor: 'text-pink-600' },
    { id: 8, title: 'Eye Care', icon: Eye, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { id: 9, title: 'Respiratory', icon: Thermometer, color: 'bg-orange-100', iconColor: 'text-orange-600' },
    { id: 10, title: 'Baby Care', icon: Baby, color: 'bg-rose-100', iconColor: 'text-rose-600' },
];

export function HealthConcerns() {
    return (
        <div className="py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 px-1">Shop by Health Concerns</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {concerns.map((item) => (
                    <button
                        key={item.id}
                        className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
                    >
                        <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`h-8 w-8 ${item.iconColor}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center group-hover:text-teal-700">
                            {item.title}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
