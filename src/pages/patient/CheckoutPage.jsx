import React, { useState, useEffect } from 'react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { medicineOrderAPI, profileAPI, storeAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PharmacyPaymentDialog } from '@/components/ui/pharmacy-payment-dialog';
import { toast } from 'sonner';
import { Truck, Banknote, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Payment Dialog State
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

    // Form State
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isPromoApplied, setIsPromoApplied] = useState(false);

    useEffect(() => {
        // Load cart
        const savedCart = localStorage.getItem('swasthya_cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        } else if (!orderSuccess) {
            // Only redirect if not in success state
            toast.error('Your cart is empty');
            navigate('/store');
        }
    }, [navigate, orderSuccess]);

    // Fetch latest user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                // Try to get detailed profile
                const response = await profileAPI.getProfile();
                if (response.data.success) {
                    const userData = response.data.data;
                    if (userData.firstName) setFullName(`${userData.firstName} ${userData.lastName || ''}`.trim());
                    else if (user.name) setFullName(user.name);

                    if (userData.address) setAddress(userData.address);
                    if (userData.city) setCity(userData.city);
                    if (userData.phoneNumber) setPhoneNumber(userData.phoneNumber);
                }
            } catch (error) {
                console.error("Failed to fetch profile for checkout autofill:", error);
                // Fallback to auth context
                setFullName(user.name || '');
                setAddress(user.address || '');
                setCity(user.city || '');
                setPhoneNumber(user.phoneNumber || '');
            }
        };

        fetchUserProfile();
    }, [user]);

    // Mock distance for demonstration (User requested: First 2km free, then 20 NPR/km)
    // In a real app, this would use the Haversine formula with coordinates
    // const [distance, setDistance] = useState(3.5); // Default mock distance

    // const deliveryCharge = useMemo(() => {
    //     if (distance <= 2) return 0;
    //     return Math.ceil(distance - 2) * 20;
    // }, [distance]);

    const deliveryCharge = 50; // Fixed delivery charge as per user request

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    const total = subtotal + deliveryCharge - discount;

    const handleApplyPromo = async () => {
        if (!promoCode) return;

        try {
            const response = await storeAPI.validatePromo(promoCode);
            if (response.data.success) {
                const { discountType, discountValue } = response.data.data;

                let calculatedDiscount = 0;
                if (discountType === 'percentage') {
                    calculatedDiscount = subtotal * (discountValue / 100);
                } else {
                    calculatedDiscount = discountValue;
                }

                setDiscount(calculatedDiscount);
                setIsPromoApplied(true);
                toast.success(`Promo code applied! ${discountValue}${discountType === 'percentage' ? '%' : ' NPR'} discount added.`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid promo code');
            setDiscount(0);
            setIsPromoApplied(false);
        }
    };

    const handleRemovePromo = () => {
        setDiscount(0);
        setIsPromoApplied(false);
        setPromoCode('');
        toast.info('Promo code removed');
    };

    const handleProceedToPayment = async () => {
        if (!fullName || !address || !city || !phoneNumber) {
            toast.error('Please fill in all delivery details');
            return;
        }

        try {
            setLoading(true);

            // Format items for backend
            const items = cartItems.map(item => ({
                inventoryId: item._id,
                medicineName: item.medicineName,
                quantity: item.cartQuantity,
                price: item.price
            }));

            // Assume single pharmacy for now based on first item
            const pharmacyId = cartItems[0].pharmacyId._id || cartItems[0].pharmacyId;
            const pharmacyName = cartItems[0].pharmacyId.name || "Pharmacy"; // Try to get name if available

            const orderData = {
                pharmacyId,
                items,
                deliveryAddress: `${address}, ${city}`,
                contactNumber: phoneNumber,
                patientName: fullName, // Add patient name to order data
                totalAmount: total,
                deliveryCharge: deliveryCharge, // Pass calculated charge
                type: 'ecommerce', // New type for direct orders
                prescriptionImage: 'ecommerce_order', // Placeholder
                promoCode: isPromoApplied ? promoCode : null // Send promo code if applied
            };

            // STORE DATA FOR LATER (Post-Payment Creation)
            sessionStorage.setItem('swasthya_checkout_temp', JSON.stringify(orderData));

            // Generate Temporary Order ID for Payment Gateways
            const tempOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Prepare details for payment dialog
            setOrderDetails({
                orderId: tempOrderId,
                amount: total,
                pharmacyName: pharmacyName,
                medicineCount: items.length
            });

            setOrderSuccess(true); // Switch view to "Order Placed" (actually "Ready to Pay")
            setShowPaymentDialog(true);
        } catch (error) {
            console.error('Checkout preparation error:', error);
            toast.error('Failed to prepare checkout');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentData) => {
        try {
            // paymentData comes from Khalti success
            const savedOrderData = sessionStorage.getItem('swasthya_checkout_temp');
            if (!savedOrderData) {
                toast.error('Session expired. Please try again.');
                return;
            }

            const orderData = JSON.parse(savedOrderData);

            // Add Payment Info
            orderData.paymentMethod = 'khalti'; // Assuming Khalti if coming here directly via callback
            orderData.paymentStatus = 'paid';
            orderData.paymentTransactionId = paymentData?.token || paymentData?.idx || 'khalti_tx';

            // Create Order NOW
            const response = await medicineOrderAPI.createOrder(orderData);

            if (response.data.success) {
                localStorage.removeItem('swasthya_cart'); // Clear cart
                sessionStorage.removeItem('swasthya_checkout_temp'); // Clear temp data
                toast.success('Payment successful! Order created.');
                navigate('/dashboard/medicine-orders');
            }
        } catch (error) {
            console.error('Final order creation failed:', error);
            toast.error('Payment succeeded but order creation failed. Please contact support.');
        }
    };

    const handlePaymentError = (errorMessage) => {
        toast.error(errorMessage || 'Payment failed');
        // Even if payment failed, the order is created. 
        // We might want to redirect to order history where they can retry payment.
        navigate('/dashboard/medicine-orders');
    };

    if (!orderSuccess && cartItems.length === 0) return null;

    if (orderSuccess) {
        return (
            <>
                <StoreHeader cartCount={0} />
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-3xl p-10 shadow-xl border border-teal-100">
                        <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="w-12 h-12 text-teal-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Almost There!</h1>
                        <p className="text-gray-600 mb-8 text-lg">
                            Your order details are ready.
                            <br />Please complete the payment to place your order.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                variant="outline"
                                className="h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() => navigate('/store')}
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 border-teal-200 text-teal-700 hover:bg-teal-50"
                                onClick={() => navigate('/dashboard/medicine-orders')}
                            >
                                Go to My Orders
                            </Button>
                            <Button
                                className="h-12 bg-teal-600 hover:bg-teal-700 text-white min-w-[200px]"
                                onClick={() => setShowPaymentDialog(true)}
                            >
                                Pay Now (NPR {orderDetails?.amount?.toLocaleString()})
                            </Button>
                        </div>
                    </div>
                </div>

                <PharmacyPaymentDialog
                    open={showPaymentDialog}
                    onOpenChange={setShowPaymentDialog}
                    orderDetails={orderDetails}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            </>
        );
    }

    return (

        <>
            {/* Unified Store Header */}
            <StoreHeader
                cartCount={cartItems.length}
                // Search props not strictly needed for checkout but good for consistency
                searchValue=""
                onSearchChange={() => { }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-teal-600 font-medium mb-6 transition-colors w-fit"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Delivery Form (Full Width / Left) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <MapPin className="w-5 h-5 mr-3 text-teal-600" />
                                Delivery Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                                    <Input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="h-11 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                                    <Input
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Contact number"
                                        className="h-11 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">City</Label>
                                    <Input
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="City"
                                        className="h-11 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                                    />
                                </div>
                                <div className="space-y-2"> {/* Changed from md:col-span-2 to ensure consistent grid */}
                                    <Label className="text-sm font-medium text-gray-700">Street Address</Label>
                                    <Input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Street Address, Area, Landmark"
                                        className="h-11 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Note about payment */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                                <Banknote className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 text-sm">Payment Information</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    You will be asked to complete your payment securely via eSewa or Khalti on the next step.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <Truck className="w-5 h-5 mr-3 text-teal-600" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map(item => (
                                    <div key={item._id} className="flex gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300"><Banknote className="w-4 h-4" /></div>
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
                                {/* Promo Code Input */}
                                <div className="flex gap-2">
                                    <Input
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Enter Promo Code"
                                        className="h-10 text-sm rounded-lg"
                                        disabled={isPromoApplied}
                                    />
                                    {isPromoApplied ? (
                                        <Button
                                            onClick={handleRemovePromo}
                                            variant="outline"
                                            className="h-10 text-red-500 border-red-200 hover:bg-red-50"
                                        >
                                            Remove
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleApplyPromo}
                                            className="h-10 bg-teal-600 hover:bg-teal-700 text-white"
                                        >
                                            Apply
                                        </Button>
                                    )}
                                </div>
                                <Separator className="my-2" />

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">NPR {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery Charge</span>
                                    <span className="font-medium text-gray-900">NPR {deliveryCharge.toLocaleString()}</span>
                                </div>
                                {isPromoApplied && (
                                    <div className="flex justify-between text-sm text-teal-600 font-medium bg-teal-50 p-2 rounded-lg">
                                        <span>Discount (10%)</span>
                                        <span>- NPR {discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-50">
                                    <span>Total Amount</span>
                                    <span className="text-teal-600">NPR {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-teal-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleProceedToPayment}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                            </Button>

                            <p className="mt-4 text-center text-xs text-gray-400">
                                Use code <span className="font-mono font-bold text-gray-500">SWASTHYA10</span> for 10% off
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Dialog */}
                <PharmacyPaymentDialog
                    open={showPaymentDialog}
                    onOpenChange={setShowPaymentDialog}
                    orderDetails={orderDetails}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                />
            </div>
        </>
    );
}
