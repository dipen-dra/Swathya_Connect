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
        <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Image Area */}
            <div className="relative h-40 bg-white p-3 flex items-center justify-center overflow-hidden border-b border-gray-100">
                {image ? (
                    <img
                        src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                        alt={medicineName}
                        className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <ShoppingCart className="w-10 h-10 text-gray-200" />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge variant={category === 'prescription' ? "destructive" : "secondary"} className="uppercase text-[9px] px-1.5 py-0.5 tracking-wider font-semibold shadow-none rounded-md">
                        {category}
                    </Badge>
                </div>

                {outOfStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Badge variant="outline" className="bg-white text-red-600 border-red-200 shadow-sm px-2 py-0.5 text-[10px] font-semibold">
                            Out of Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="mb-2">
                    <p className="text-[10px] font-bold text-teal-600 mb-0.5 uppercase tracking-wide truncate">{manufacturer}</p>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-teal-700 transition-colors line-clamp-2 cursor-pointer h-9" onClick={() => onViewDetails(_id)}>
                        {medicineName}
                    </h3>
                    {genericName && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 truncate">
                            {genericName}
                        </p>
                    )}
                </div>

                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-sm font-bold text-gray-900 tracking-tight">
                            NPR {price.toLocaleString()}
                        </p>
                        {/* Unit/Type text if available could go here */}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs rounded-md border-gray-200 text-gray-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 shadow-none"
                            onClick={() => onViewDetails(_id)}
                        >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        <Button
                            size="sm"
                            className={`h-7 px-3 text-xs rounded-md transition-colors ${outOfStock
                                ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-none'
                                }`}
                            onClick={() => onAddToCart(product)}
                            disabled={outOfStock}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
