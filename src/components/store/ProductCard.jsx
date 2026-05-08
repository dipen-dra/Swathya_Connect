import React from 'react';
import { ShoppingCart, Plus, Star } from 'lucide-react';
import Logo from '@/assets/swasthyalogo.png';

export default function ProductCard({ product, onAddToCart, onViewDetails }) {
    const {
        _id,
        medicineName,
        genericName,
        manufacturer,
        price,
        image,
        category,
        quantity,
        createdAt
    } = product;

    const outOfStock = quantity <= 0;
    
    // Check if product is "new" (e.g., created in the last 7 days)
    const isNew = createdAt ? (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24) < 7 : false;

    return (
        <div 
            className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full border border-gray-50 cursor-pointer"
            onClick={() => onViewDetails(_id)}
        >
            {/* Image Section - Compact & Immersive */}
            <div className="relative h-32 sm:h-40 bg-gray-50 overflow-hidden">
                {image ? (
                    <img
                        src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${image}`}
                        alt={medicineName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ShoppingCart className="w-12 h-12 text-gray-200" />
                    </div>
                )}

                {/* "New" Badge - Top Right */}
                {(isNew || true) && ( // Forced true for demo as per image style
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white/50">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-[10px] font-bold text-gray-700">New</span>
                    </div>
                )}

                {outOfStock && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white/90 text-red-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter shadow-xl">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 font-serif tracking-tight">
                        {medicineName}
                    </h3>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.1em]">
                        {manufacturer || 'Pharmacy Special'}
                    </p>
                </div>

                {/* Price & Add Button Row */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">Rs.</span>
                        <span className="text-lg font-black text-gray-900">
                            {price.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!outOfStock) onAddToCart(product);
                        }}
                        disabled={outOfStock}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            outOfStock
                                ? 'bg-gray-100 text-gray-300'
                                : 'bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white shadow-sm hover:shadow-teal-200 active:scale-90'
                        }`}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
