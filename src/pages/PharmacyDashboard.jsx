import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ShoppingCart, Clock, DollarSign, Users, Search,
    MessageSquare, Package, User, Shield, CheckCircle,
    TrendingUp, TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

export default function PharmacyDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        thisMonthRevenue: 0,
        activeCustomers: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchStats();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/pharmacies/dashboard/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/pharmacies/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/pharmacies/dashboard/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Order ${newStatus === 'processing' ? 'processing' : 'completed'}!`);
                fetchOrders();
                fetchStats();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-14 h-14 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Package className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    Welcome back, pharmacy!
                                </h1>
                                <p className="text-white/90 text-base mt-1">
                                    Manage your pharmacy operations and customer orders
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-white/90">
                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                <Shield className="h-4 w-4" />
                                <span className="font-medium">Licensed Pharmacy</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Verified Partner</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-lg">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">500+ Customers</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Orders */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+2% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Orders */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-amber-600">
                                        <Clock className="h-3 w-3" />
                                        <span>+3 from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* This Month Revenue */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">This Month Revenue</p>
                                    <h3 className="text-3xl font-bold text-gray-900">NPR {stats.thisMonthRevenue.toLocaleString()}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+18% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Customers */}
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.activeCustomers}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+5% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'orders'
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'inventory'
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'chat'
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Customer Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`pb-3 px-1 border-b-2 transition-colors ${activeTab === 'profile'
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Profile
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Medicine Orders</h3>
                                    <p className="text-sm text-gray-600">Manage prescription and over-the-counter medicine orders</p>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Order Cards */}
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <p className="text-center text-gray-500 py-8">Loading orders...</p>
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 font-medium">No orders found</p>
                                            <p className="text-sm text-gray-500 mt-1">Orders from patients will appear here</p>
                                        </div>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <Card key={order._id} className="border border-gray-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start space-x-4 flex-1">
                                                            <Avatar className="h-12 w-12">
                                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                                                                    {order.patientName?.[0] || 'P'}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h4 className="font-semibold text-gray-900">{order.patientName}</h4>
                                                                    <span className="text-sm text-gray-500">Order ID: {order.orderId}</span>
                                                                    {order.prescriptionRequired && (
                                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                                            Prescription
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                <div className="mb-3">
                                                                    <p className="text-sm text-gray-600 font-medium mb-1">Medicines:</p>
                                                                    <ul className="space-y-1">
                                                                        {order.medicines.map((med, idx) => (
                                                                            <li key={idx} className="text-sm text-gray-700">
                                                                                • {med.name} {med.dosage && `${med.dosage}`} {med.quantity > 1 && `x${med.quantity}`}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                <div className="flex items-center space-x-6 text-sm text-gray-600">
                                                                    <div>
                                                                        <span className="font-medium text-gray-700">Order Date:</span>
                                                                        <span className="ml-2">{new Date(order.orderDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-medium text-gray-700">Total Amount:</span>
                                                                        <span className="ml-2 text-blue-600 font-semibold">NPR {order.totalAmount}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end space-y-3">
                                                            <Badge className={getStatusColor(order.status)}>
                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                            </Badge>

                                                            <div className="flex items-center space-x-2">
                                                                {order.status === 'pending' && (
                                                                    <Button
                                                                        onClick={() => handleUpdateOrderStatus(order._id, 'processing')}
                                                                        className="bg-teal-600 hover:bg-teal-700 text-white"
                                                                        size="sm"
                                                                    >
                                                                        Process Order
                                                                    </Button>
                                                                )}
                                                                {order.status === 'processing' && (
                                                                    <Button
                                                                        onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                        size="sm"
                                                                    >
                                                                        Complete
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-gray-300"
                                                                >
                                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                                    Chat
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Inventory Tab - Placeholder */}
                        {activeTab === 'inventory' && (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">Inventory Management</p>
                                <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
                            </div>
                        )}

                        {/* Customer Chat Tab - Placeholder */}
                        {activeTab === 'chat' && (
                            <div className="text-center py-12">
                                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">Customer Chat</p>
                                <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
                            </div>
                        )}

                        {/* Profile Tab - Placeholder */}
                        {activeTab === 'profile' && (
                            <div className="text-center py-12">
                                <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 font-medium">Pharmacy Profile</p>
                                <p className="text-sm text-gray-500 mt-1">Coming soon...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
