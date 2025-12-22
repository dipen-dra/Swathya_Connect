import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        isPublic
    } = product;

    const outOfStock = quantity <= 0;

    return (
        <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Area */}
            <div className="relative aspect-[4/3] bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                        alt={medicineName}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge variant={category === 'prescription' ? "destructive" : "secondary"} className="uppercase text-[10px] tracking-wider font-semibold shadow-none">
                        {category}
                    </Badge>
                </div>

                {outOfStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Badge variant="outline" className="bg-white text-red-600 border-red-200 shadow-sm px-3 py-1 text-xs font-semibold">
                            Out of Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-3">
                    <p className="text-xs font-medium text-teal-600 mb-1 uppercase tracking-wide truncate">{manufacturer}</p>
                    <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-teal-700 transition-colors line-clamp-2 cursor-pointer h-10" onClick={() => onViewDetails(_id)}>
                        {medicineName}
                    </h3>
                    {genericName && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1 truncate">
                            {genericName}
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-lg font-bold text-gray-900 tracking-tight">
                            NPR {price.toLocaleString()}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className={`h-9 px-3 rounded-lg transition-colors ${outOfStock
                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-none'
                            }`}
                        onClick={() => onAddToCart(product)}
                        disabled={outOfStock}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
