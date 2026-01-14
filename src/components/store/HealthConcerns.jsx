import React, { useEffect, useState } from 'react';
import { categoryAPI } from '@/services/api';
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
    Apple,
    Stethoscope
} from 'lucide-react';
import Logo from '@/assets/swasthyalogo.png';

// Static mapping for legacy categories to maintain icons if they exist in DB by name
const iconMapping = {
    'diabetes': { icon: Activity, color: 'bg-blue-100', iconColor: 'text-blue-600' },
    'heart care': { icon: Heart, color: 'bg-red-100', iconColor: 'text-red-600' },
    'stomach care': { icon: Apple, color: 'bg-green-100', iconColor: 'text-green-600' },
    'liver care': { icon: Zap, color: 'bg-yellow-100', iconColor: 'text-yellow-600' },
    'bone, joint': { icon: Activity, color: 'bg-purple-100', iconColor: 'text-purple-600' },
    'kidney care': { icon: Droplets, color: 'bg-cyan-100', iconColor: 'text-cyan-600' },
    'derma care': { icon: Smile, color: 'bg-pink-100', iconColor: 'text-pink-600' },
    'eye care': { icon: Eye, color: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    'respiratory': { icon: Thermometer, color: 'bg-orange-100', iconColor: 'text-orange-600' },
    'baby care': { icon: Baby, color: 'bg-rose-100', iconColor: 'text-rose-600' },
};

const defaultColors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-amber-100', text: 'text-amber-600' },
    { bg: 'bg-rose-100', text: 'text-rose-600' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
];

export function HealthConcerns({ onCategorySelect }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="py-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 px-1">Shop by Health Concerns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (categories.length === 0) return null;

    return (
        <div className="py-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 px-1">Shop by Health Concerns</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((item, index) => {
                    // Determine display props
                    const mapped = iconMapping[item.name.toLowerCase()];
                    const colorSet = defaultColors[index % defaultColors.length];
                    const Icon = mapped ? mapped.icon : Stethoscope; // Default icon
                    const bgColor = mapped ? mapped.color : colorSet.bg;
                    const iconColor = mapped ? mapped.iconColor : colorSet.text;

                    // Handle Image URL or File Path
                    let imageUrl = null;
                    if (item.image) {
                        imageUrl = item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`;
                    }

                    return (
                        <button
                            key={item._id}
                            onClick={() => onCategorySelect && onCategorySelect(item.name)}
                            className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
                        >
                            <div className={`w-16 h-16 rounded-full ${!imageUrl ? bgColor : 'bg-white border border-gray-100'} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                                    />
                                ) : (
                                    <Icon className={`h-8 w-8 ${iconColor}`} />
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 text-center group-hover:text-teal-700 capitalize">
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
