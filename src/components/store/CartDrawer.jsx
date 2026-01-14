import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartDrawer({ open, onOpenChange, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) {

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full border-l-0 shadow-2xl p-0 bg-white">
                <SheetHeader className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <SheetTitle className="flex items-center text-xl font-bold text-gray-900">
                        <ShoppingBag className="w-5 h-5 mr-3 text-blue-600" />
                        Your Cart
                        <span className="ml-2 text-sm font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                            {cartItems.length} items
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden relative">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-6 p-8 text-center animate-in fade-in duration-500">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                <ShoppingBag className="w-10 h-10 text-blue-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Your cart is empty</h3>
                                <p className="text-sm text-gray-400 max-w-[200px] mx-auto">Looks like you haven't added any medicines yet.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-full px-6 py-6">
                            <div className="space-y-6 pb-6">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-4 group bg-white rounded-xl p-2 transition-colors hover:bg-gray-50/80">
                                        {/* Image */}
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-2">
                                            {item.image ? (
                                                <img
                                                    src={`http://localhost:5000${item.image}`}
                                                    alt={item.medicineName}
                                                    className="h-full w-full object-contain mix-blend-multiply"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gray-50 flex items-center justify-center rounded-lg">
                                                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{item.medicineName}</h3>
                                                    <p className="font-bold text-gray-900 whitespace-nowrap">NPR {(item.price * item.cartQuantity).toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{item.manufacturer}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden h-8">
                                                    <button
                                                        className="px-2.5 h-full hover:bg-gray-100 disabled:opacity-50 text-gray-600 transition-colors"
                                                        onClick={() => onUpdateQuantity(item._id, item.cartQuantity - 1)}
                                                        disabled={item.cartQuantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="px-2 font-medium text-sm w-8 text-center">{item.cartQuantity}</span>
                                                    <button
                                                        className="px-2.5 h-full hover:bg-gray-100 disabled:opacity-50 text-gray-600 transition-colors"
                                                        onClick={() => onUpdateQuantity(item._id, item.cartQuantity + 1)}
                                                        disabled={item.cartQuantity >= item.quantity}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveItem(item._id)}
                                                    className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between text-base mb-2 text-gray-500">
                            <p>Subtotal</p>
                            <p>NPR {subtotal.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                            <p>Total</p>
                            <p className="text-blue-600">NPR {subtotal.toLocaleString()}</p>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white h-12 text-lg font-bold shadow-lg shadow-blue-200 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={onCheckout}
                        >
                            Proceed to Checkout
                        </Button>
                        <p className="mt-4 text-center text-xs text-gray-400">
                            Secure Checkout powered by SwasthyaConnect
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
