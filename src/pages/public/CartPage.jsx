import React, { useState, useEffect } from 'react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { storeAPI } from '@/services/api';
import ProductCard from '@/components/store/ProductCard';

export default function CartPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('swasthya_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [similarProducts, setSimilarProducts] = useState([]);

    // Fetch similar products based on cart categories
    useEffect(() => {
        const fetchSimilar = async () => {
            if (cartItems.length === 0) return;

            try {
                const categories = [...new Set(cartItems.map(item => item.category))];
                if (categories.length === 0) return;

                console.log('🛒 Cart Items:', cartItems);

                // 1. Try fetching by Category
                let response = await storeAPI.getProducts({
                    category: categories[0],
                    limit: 8
                });

                let recommendations = [];
                const cartIds = new Set(cartItems.map(item => item._id));

                if (response.data && response.data.data) {
                    recommendations = response.data.data.filter(p => !cartIds.has(p._id));
                }

                console.log('🎯 Category Matches (after filter):', recommendations.length);

                // 2. Fallback: If not enough related products, fetch generic "New Arrivals"
                // This handles the "Seeded Data" issue where a category might only have 1 item
                if (recommendations.length < 2) {
                    console.log('⚠️ Not enough matches, fetching generic products...');
                    const fallbackResponse = await storeAPI.getProducts({
                        limit: 8,
                        sort: 'newest'
                    });

                    if (fallbackResponse.data && fallbackResponse.data.data) {
                        const fallbackItems = fallbackResponse.data.data.filter(p =>
                            !cartIds.has(p._id) &&
                            !recommendations.find(r => r._id === p._id) // Avoid duplicates from existing recommendations
                        );

                        // Combine logic: Keep distinct category matches, fill rest with generic
                        recommendations = [...recommendations, ...fallbackItems];
                    }
                }

                setSimilarProducts(recommendations.slice(0, 4));

            } catch (error) {
                console.error("Failed to fetch similar products", error);
            }
        };

        fetchSimilar();
    }, [cartItems.length]); // Re-run when cart size changes (e.g. added new item type, or cleared)

    // Update localStorage when cart changes
    useEffect(() => {
        localStorage.setItem('swasthya_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const updateQuantity = (productId, newQuantity, maxQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > maxQuantity) {
            toast.error(`Only ${maxQuantity} items available in stock`);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item._id === productId
                    ? { ...item, cartQuantity: newQuantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item._id !== productId));
        toast.success('Item removed from cart');
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const deliveryCharge = 50;
    const total = subtotal + deliveryCharge;

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (!user) {
            localStorage.setItem('redirect_after_login', '/patient/checkout');
            navigate('/login');
            toast.info('Please log in to complete your purchase');
        } else {
            navigate('/patient/checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm max-w-lg w-full text-center border border-gray-100">
                    <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-teal-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">
                        Looks like you haven't added any medicines or products to your cart yet.
                    </p>
                    <Button
                        onClick={() => navigate('/store')}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl text-lg font-medium"
                    >
                        Start Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Unified Store Header */}
            <StoreHeader
                cartCount={cartItems.length}
                // No search on cart page, but keep props for consistency
                searchValue=""
                onSearchChange={() => { }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-teal-600 font-medium mb-6 transition-colors w-fit"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 group transition-all hover:shadow-md">
                                {/* Product Image */}
                                <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-4 border border-gray-50">
                                    {item.image ? (
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                                            alt={item.medicineName}
                                            className="w-full h-full object-contain mix-blend-multiply"
                                            onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                                        />
                                    ) : (
                                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
                                                {item.manufacturer}
                                            </p>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                                                {item.medicineName}
                                            </h3>
                                            {item.genericName && (
                                                <p className="text-sm text-gray-500 line-clamp-1">{item.genericName}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                NPR {(item.price * item.cartQuantity).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                NPR {item.price.toLocaleString()} / unit
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-gray-200 rounded-lg bg-white h-9">
                                                <button
                                                    className="px-3 h-full hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors rounded-l-lg border-r border-gray-100"
                                                    onClick={() => updateQuantity(item._id, item.cartQuantity - 1, item.quantity)}
                                                    disabled={item.cartQuantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm text-gray-900">
                                                    {item.cartQuantity}
                                                </span>
                                                <button
                                                    className="px-3 h-full hover:bg-gray-50 disabled:opacity-50 text-gray-600 transition-colors rounded-r-lg border-l border-gray-100"
                                                    onClick={() => updateQuantity(item._id, item.cartQuantity + 1, item.quantity)}
                                                    disabled={item.cartQuantity >= item.quantity}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                                                In Stock
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                                                    alt=""
                                                    className="h-full w-full object-contain mix-blend-multiply"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = Logo; }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300"><ShoppingBag className="w-4 h-4" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.medicineName}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.cartQuantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            NPR {(item.price * item.cartQuantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className="font-medium text-gray-900">NPR {deliveryCharge.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-50">
                                    <span>Total Amount</span>
                                    <span className="text-teal-600">NPR {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] mb-4 group"
                            >
                                Proceed to Checkout
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-3 rounded-xl border border-gray-100 font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                Secure Checkout & Payment
                            </div>
                        </div>
                    </div>

                    {/* Similar Products Section */}
                    {/* Only show if we have similar products */}
                </div>
            </div>

            {/* Recommendations Section - Placed Below Cart & Summary for better flow on mobile, or bottom of page */}
            {/* Actually, let's put it below the main flex container so it spans full width */}


            {/* You Might Also Like Section */}
            {
                similarProducts.length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-8 w-1 bg-teal-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(product => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={(p) => {
                                        // Add to cart logic reusing existing state setter
                                        setCartItems(prev => {
                                            const existing = prev.find(item => item._id === p._id);
                                            if (existing) {
                                                if (existing.cartQuantity >= existing.quantity) {
                                                    toast.error('Max quantity reached');
                                                    return prev;
                                                }
                                                toast.success('Quantity updated in cart');
                                                return prev.map(item => item._id === p._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
                                            }
                                            toast.success('Added to cart');
                                            return [...prev, { ...p, cartQuantity: 1 }];
                                        });
                                    }}
                                    onViewDetails={(id) => navigate('/store')} // Simple redirect for now
                                />
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
