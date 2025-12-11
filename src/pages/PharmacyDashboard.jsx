import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ShoppingCart, Clock, DollarSign, Users, Search,
    MessageSquare, Package, User, Shield, CheckCircle,
    TrendingUp, Plus, Edit, Trash2, AlertCircle, Settings, LogOut,
    Upload, FileText, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { profileAPI } from '@/services/api';

// Mock data for testing
const MOCK_ORDERS = [
    {
        _id: '1',
        orderId: 'ORD-001',
        patientName: 'Ram Sharma',
        patientId: { fullName: 'Ram Sharma' },
        medicines: [
            { name: 'Paracetamol', dosage: '500mg', quantity: 2 },
            { name: 'Vitamin C', dosage: '25', quantity: 1 }
        ],
        prescriptionRequired: true,
        totalAmount: 450,
        status: 'pending',
        orderDate: new Date().toISOString()
    },
    {
        _id: '2',
        orderId: 'ORD-002',
        patientName: 'Sita Poudel',
        patientId: { fullName: 'Sita Poudel' },
        medicines: [
            { name: 'Amoxicillin', dosage: '250mg', quantity: 3 },
            { name: 'Cough Syrup', quantity: 1 }
        ],
        prescriptionRequired: true,
        totalAmount: 680,
        status: 'processing',
        orderDate: new Date(Date.now() - 86400000).toISOString()
    },
    {
        _id: '3',
        orderId: 'ORD-003',
        patientName: 'Hari Thapa',
        patientId: { fullName: 'Hari Thapa' },
        medicines: [
            { name: 'Aspirin', dosage: '75mg', quantity: 1 }
        ],
        prescriptionRequired: false,
        totalAmount: 120,
        status: 'completed',
        orderDate: new Date(Date.now() - 172800000).toISOString(),
        completedDate: new Date(Date.now() - 86400000).toISOString()
    }
];

export default function PharmacyDashboard() {
    const { user, logout } = useAuth();
    const { profile, refreshProfile } = useProfile();
    const navigate = useNavigate();
    const { tab } = useParams();

    const [activeTab, setActiveTab] = useState(tab || 'orders');
    const [orders, setOrders] = useState(MOCK_ORDERS); // Use mock data
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 156,
        pendingOrders: 8,
        thisMonthRevenue: 45000,
        activeCustomers: 89
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Inventory dialog states
    const [showInventoryDialog, setShowInventoryDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [inventoryForm, setInventoryForm] = useState({
        medicineName: '',
        genericName: '',
        manufacturer: '',
        dosage: '',
        quantity: '',
        price: '',
        expiryDate: '',
        category: 'otc',
        lowStockThreshold: '10'
    });

    // Sign out dialog state
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    // Verification state
    const [verificationDocument, setVerificationDocument] = useState(null);
    const [verificationDocPreview, setVerificationDocPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pharmacyLicenseNumber, setPharmacyLicenseNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');

    // Update active tab when URL changes
    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        } else {
            setActiveTab('orders');
        }
    }, [tab]);

    // Handle tab change with navigation
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        navigate(`/pharmacy-dashboard/${newTab}`);
    };

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventory();
        }
    }, [activeTab]);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/pharmacies/dashboard/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setInventory(data.data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to fetch inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const reduceInventoryStock = (medicines) => {
        setInventory(prevInventory => {
            return prevInventory.map(item => {
                // Find if this medicine is in the order
                const orderedMedicine = medicines.find(
                    med => med.name.toLowerCase() === item.medicineName?.toLowerCase()
                );

                if (orderedMedicine) {
                    const newStock = Math.max(0, item.quantity - orderedMedicine.quantity);

                    // Show warning if stock is low
                    if (newStock <= (item.lowStockThreshold || 10)) {
                        toast.warning(`${item.medicineName} stock is low! Current: ${newStock}`);
                    }

                    return {
                        ...item,
                        quantity: newStock
                    };
                }
                return item;
            });
        });
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        // Find the order before updating
        const order = orders.find(o => o._id === orderId);

        // Update order status
        setOrders(orders.map(o =>
            o._id === orderId ? { ...o, status: newStatus } : o
        ));

        // If status is changed to 'delivered', reduce inventory stock
        if (newStatus === 'delivered' && order && order.status !== 'delivered') {
            reduceInventoryStock(order.medicines);
            toast.success(`Order ${order.orderId} delivered! Inventory updated.`);
        } else {
            toast.success(`Order ${newStatus}!`);
        }
    };

    const handleAddInventory = () => {
        setEditingItem(null);
        setInventoryForm({
            medicineName: '',
            genericName: '',
            manufacturer: '',
            dosage: '',
            quantity: '',
            price: '',
            expiryDate: '',
            category: 'otc',
            lowStockThreshold: '10'
        });
        setShowInventoryDialog(true);
    };

    const handleEditInventory = (item) => {
        setEditingItem(item);
        setInventoryForm({
            medicineName: item.medicineName,
            genericName: item.genericName || '',
            manufacturer: item.manufacturer || '',
            dosage: item.dosage,
            quantity: item.quantity.toString(),
            price: item.price.toString(),
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
            category: item.category,
            lowStockThreshold: item.lowStockThreshold?.toString() || '10'
        });
        setShowInventoryDialog(true);
    };

    const handleSaveInventory = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = editingItem
                ? `http://localhost:5000/api/pharmacies/dashboard/inventory/${editingItem._id}`
                : 'http://localhost:5000/api/pharmacies/dashboard/inventory';

            const response = await fetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...inventoryForm,
                    quantity: parseInt(inventoryForm.quantity),
                    price: parseFloat(inventoryForm.price),
                    lowStockThreshold: parseInt(inventoryForm.lowStockThreshold)
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success(editingItem ? 'Medicine updated!' : 'Medicine added!');
                setShowInventoryDialog(false);
                fetchInventory();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error saving inventory:', error);
            toast.error('Failed to save medicine');
        }
    };

    const handleDeleteInventory = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/pharmacies/dashboard/inventory/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Medicine deleted successfully!');
                fetchInventory();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting inventory:', error);
            toast.error('Failed to delete medicine');
        } finally {
            setShowDeleteDialog(false);
            setItemToDelete(null);
        }
    };

    const handleDeleteClick = (item) => {
        console.log('Delete clicked for item:', item);
        setItemToDelete(item);
        setShowDeleteDialog(true);
        console.log('Dialog should open now');
    };

    const filteredOrders = orders.filter(order =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredInventory = inventory.filter(item =>
        item.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.genericName && item.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Verification handlers
    const handleVerificationDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size should be less than 10MB');
                return;
            }
            setVerificationDocument(file);
            setVerificationDocPreview(file.name);
        }
    };

    const handleUploadVerificationDocument = async () => {
        if (!verificationDocument) {
            toast.error('Please select a document to upload');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('verificationDocument', verificationDocument);
            formData.append('documentType', 'license');

            const response = await profileAPI.uploadVerificationDocument(formData);

            if (response.data.success) {
                toast.success('Verification document uploaded successfully!');
                setVerificationDocument(null);
                setVerificationDocPreview(null);
                // Refresh profile to show updated document
                await refreshProfile();
            }
        } catch (error) {
            console.error('Error uploading verification document:', error);
            toast.error('Failed to upload verification document');
        }
    };

    const handleSubmitForReview = async () => {
        if (!profile?.verificationDocument) {
            toast.error('Please upload a verification document first');
            return;
        }

        const finalLicenseNumber = pharmacyLicenseNumber || profile?.pharmacyLicenseNumber;
        const finalPanNumber = panNumber || profile?.panNumber;

        if (!finalLicenseNumber || !finalPanNumber) {
            toast.error('Please fill in pharmacy license number and PAN number');
            return;
        }

        setIsSubmitting(true);
        try {
            // First update profile with license and PAN if they were changed
            if (pharmacyLicenseNumber || panNumber) {
                const updateData = {};
                if (pharmacyLicenseNumber) updateData.pharmacyLicenseNumber = pharmacyLicenseNumber;
                if (panNumber) updateData.panNumber = panNumber;

                await profileAPI.updateProfile(updateData);
            }

            // Then submit for review
            const response = await profileAPI.submitForReview();

            if (response.data.success) {
                toast.success('Profile submitted for review successfully!');
                // Refresh profile to show updated status
                await refreshProfile();
            }
        } catch (error) {
            console.error('Error submitting for review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit for review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'prescription': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'otc': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'supplement': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto p-6 space-y-8">
                {/* Welcome Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        Welcome back, {profile?.firstName || user?.fullName || 'Pharmacy'}!
                                    </h1>
                                    <p className="text-white/90 text-base">
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

                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16 border-4 border-white/30 shadow-lg">
                                <AvatarImage src={profile?.profileImage} />
                                <AvatarFallback className="text-blue-600 font-semibold text-xl bg-white">
                                    {(profile?.firstName?.[0] || user?.fullName?.[0] || 'P')}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Orders */}
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>+12% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Orders */}
                    <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
                                    <div className="flex items-center space-x-1 mt-2 text-xs text-amber-600">
                                        <Clock className="h-3 w-3" />
                                        <span>Needs attention</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* This Month Revenue */}
                    <Card className="border-0 shadow-md">
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
                    <Card className="border-0 shadow-md">
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
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <div className="flex space-x-8 border-b border-gray-200">
                            <button
                                onClick={() => handleTabChange('orders')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
                                    ? 'border-deep-blue text-deep-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => handleTabChange('inventory')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory'
                                    ? 'border-deep-blue text-deep-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Inventory
                            </button>
                            <button
                                onClick={() => handleTabChange('chat')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'chat'
                                    ? 'border-deep-blue text-deep-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Customer Chat
                            </button>
                            <button
                                onClick={() => handleTabChange('verification')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification'
                                    ? 'border-deep-blue text-deep-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Verification
                            </button>
                            <button
                                onClick={() => handleTabChange('profile')}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                    ? 'border-deep-blue text-deep-blue'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                                        className="pl-10 border-gray-200"
                                    />
                                </div>

                                {/* Order Cards */}
                                <div className="space-y-4">
                                    {filteredOrders.length === 0 ? (
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
                                                                        <span className="ml-2 text-teal-600 font-semibold">NPR {order.totalAmount}</span>
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

                        {/* Inventory Tab */}
                        {activeTab === 'inventory' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Inventory Management</h3>
                                        <p className="text-sm text-gray-600">Manage your medicine stock and inventory</p>
                                    </div>
                                    <Button
                                        onClick={handleAddInventory}
                                        className="bg-teal-600 hover:bg-teal-700 text-white"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Medicine
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Search medicines..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 border-gray-200"
                                    />
                                </div>

                                {/* Inventory Table */}
                                {isLoading ? (
                                    <p className="text-center text-gray-500 py-8">Loading inventory...</p>
                                ) : filteredInventory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600 font-medium">No medicines in inventory</p>
                                        <p className="text-sm text-gray-500 mt-1">Add medicines to start managing your inventory</p>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredInventory.map((item) => (
                                                    <tr key={item._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                                                                {item.genericName && (
                                                                    <p className="text-xs text-gray-500">{item.genericName}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">{item.dosage}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-sm font-medium ${item.quantity <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {item.quantity}
                                                                {item.quantity <= item.lowStockThreshold && (
                                                                    <AlertCircle className="inline h-4 w-4 ml-1" />
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">NPR {item.price}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={getCategoryColor(item.category)}>
                                                                {item.category.toUpperCase()}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {new Date(item.expiryDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right space-x-2">
                                                            <Button
                                                                onClick={() => handleEditInventory(item)}
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(item)}
                                                                className="text-red-600 hover:text-white hover:bg-red-600 border-red-200 hover:border-red-600 transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile Header Card */}
                                <Card className="border-0 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-20 w-20">
                                                <AvatarImage src={profile?.profileImage ? `http://localhost:5000${profile.profileImage}` : undefined} />
                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-teal-500 text-white text-2xl">
                                                    {profile?.firstName?.[0] || user?.fullName?.[0] || 'P'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {profile?.firstName || user?.fullName || 'Pharmacy'}
                                                </h3>
                                                <p className="text-sm text-gray-600">Pharmacy Partner</p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                            </div>
                                            <Badge className="bg-teal-100 text-teal-800 border-teal-200">
                                                Licensed Pharmacy
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card
                                        className="border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => navigate('/pharmacy/profile')}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <User className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Edit Profile</h4>
                                                    <p className="text-sm text-gray-600">Update your information</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className="border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Settings className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">Settings</h4>
                                                    <p className="text-sm text-gray-600">Preferences & privacy</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sign Out */}
                                <Card
                                    className="border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setShowSignOutDialog(true)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-center space-x-2 text-red-600">
                                            <LogOut className="h-5 w-5" />
                                            <span className="font-medium">Sign Out</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Verification Tab */}
                        {activeTab === 'verification' && (
                            <div className="space-y-6">
                                <Card className="border-gray-200 shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-gray-900">Pharmacy Verification</h2>
                                                {profile?.verificationStatus === 'approved' && (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Verification Status Banners */}
                                            {profile?.accountSuspended && (
                                                <Card className="border-2 border-red-200 bg-red-50">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                                            <div>
                                                                <h3 className="font-semibold text-red-900">Account Suspended</h3>
                                                                <p className="text-sm text-red-800 mt-1">
                                                                    Your account has been suspended due to multiple rejections ({profile.rejectionCount || 0} times).
                                                                    {profile.suspensionExpiresAt && (
                                                                        <> Suspension will be lifted on {new Date(profile.suspensionExpiresAt).toLocaleDateString()}.</>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {!profile?.accountSuspended && profile?.verificationStatus === 'pending' && !profile?.submittedForReview && (
                                                <Card className="border-2 border-yellow-200 bg-yellow-50">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                            <div>
                                                                <h3 className="font-semibold text-yellow-900">Complete Verification</h3>
                                                                <p className="text-sm text-yellow-800 mt-1">
                                                                    Upload your pharmacy license document and submit for admin review to start serving customers.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {profile?.submittedForReview && profile?.verificationStatus === 'pending' && (
                                                <Card className="border-2 border-blue-200 bg-blue-50">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                                            <div>
                                                                <h3 className="font-semibold text-blue-900">Under Review</h3>
                                                                <p className="text-sm text-blue-800 mt-1">
                                                                    Your profile is currently being reviewed by our admin team. You'll be notified once approved.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {!profile?.accountSuspended && profile?.verificationStatus === 'rejected' && (
                                                <Card className="border-2 border-red-200 bg-red-50">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                                            <div>
                                                                <h3 className="font-semibold text-red-900">Verification Rejected</h3>
                                                                <p className="text-sm text-red-800 mt-1">
                                                                    {profile?.rejectionReason || 'Your verification was rejected. Please update your documents and resubmit.'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {profile?.verificationStatus === 'approved' && (
                                                <Card className="border-2 border-green-200 bg-green-50">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start space-x-3">
                                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                            <div>
                                                                <h3 className="font-semibold text-green-900">Pharmacy Verified!</h3>
                                                                <p className="text-sm text-green-800 mt-1">
                                                                    Your pharmacy is verified and can now serve customers on the platform.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {/* Pharmacy License Number */}
                                            <div>
                                                <Label htmlFor="pharmacyLicenseNumber" className="text-sm font-medium text-gray-700">
                                                    Pharmacy License Number *
                                                </Label>
                                                <Input
                                                    id="pharmacyLicenseNumber"
                                                    value={pharmacyLicenseNumber || profile?.pharmacyLicenseNumber || ''}
                                                    onChange={(e) => setPharmacyLicenseNumber(e.target.value)}
                                                    placeholder="Enter pharmacy license number"
                                                    className="mt-1 border-gray-200"
                                                />
                                            </div>

                                            {/* PAN Number */}
                                            <div>
                                                <Label htmlFor="panNumber" className="text-sm font-medium text-gray-700">
                                                    PAN Number *
                                                </Label>
                                                <Input
                                                    id="panNumber"
                                                    value={panNumber || profile?.panNumber || ''}
                                                    onChange={(e) => setPanNumber(e.target.value)}
                                                    placeholder="Enter PAN number"
                                                    className="mt-1 border-gray-200"
                                                />
                                            </div>

                                            {/* Verification Document Upload */}
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Verification Document *
                                                </Label>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Upload your pharmacy license or registration certificate (PDF, JPG, PNG - Max 10MB)
                                                </p>

                                                {profile?.verificationDocument ? (
                                                    <div className="space-y-3">
                                                        {/* Current Document Display */}
                                                        <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                                    <FileText className="h-5 w-5 text-green-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-green-900">Document uploaded</p>
                                                                    <p className="text-xs text-green-700">
                                                                        {profile.verificationDocument.split('/').pop()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={`http://localhost:5000${profile.verificationDocument}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                View Document
                                                            </a>
                                                        </div>

                                                        {/* Replace Document Option (only for rejected) */}
                                                        {profile?.verificationStatus === 'rejected' && !profile?.accountSuspended && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs text-gray-600 font-medium">Want to upload a different document?</p>
                                                                <div className="relative">
                                                                    <input
                                                                        type="file"
                                                                        id="verificationDocReplace"
                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                        onChange={handleVerificationDocumentChange}
                                                                        className="hidden"
                                                                    />
                                                                    <label
                                                                        htmlFor="verificationDocReplace"
                                                                        className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                                                    >
                                                                        <Upload className="h-8 w-8 text-gray-400 mb-1" />
                                                                        <p className="text-xs font-medium text-gray-700">
                                                                            {verificationDocPreview || 'Click to replace document'}
                                                                        </p>
                                                                    </label>
                                                                </div>
                                                                {verificationDocPreview && (
                                                                    <Button
                                                                        onClick={handleUploadVerificationDocument}
                                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                                    >
                                                                        <Upload className="h-4 w-4 mr-2" />
                                                                        Upload New Document
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id="verificationDoc"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={handleVerificationDocumentChange}
                                                                className="hidden"
                                                            />
                                                            <label
                                                                htmlFor="verificationDoc"
                                                                className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                                            >
                                                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                                                <p className="text-sm font-medium text-gray-700">
                                                                    {verificationDocPreview || 'Click to upload or drag and drop'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                                                            </label>
                                                        </div>
                                                        {verificationDocPreview && (
                                                            <Button
                                                                onClick={handleUploadVerificationDocument}
                                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                Upload Document
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Submit Button */}
                                            {!profile?.accountSuspended && (!profile?.submittedForReview || profile?.verificationStatus === 'rejected') && profile?.verificationDocument && (
                                                <Button
                                                    onClick={handleSubmitForReview}
                                                    disabled={isSubmitting}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
                                                >
                                                    <Shield className="h-5 w-5 mr-2" />
                                                    {isSubmitting ? 'Submitting...' : (profile?.verificationStatus === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification')}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                </Card >
            </div >

            {/* Inventory Dialog */}
            < Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog} >
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update medicine details' : 'Add a new medicine to your inventory'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div>
                            <Label htmlFor="medicineName">Medicine Name *</Label>
                            <Input
                                id="medicineName"
                                value={inventoryForm.medicineName}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, medicineName: e.target.value })}
                                placeholder="e.g., Paracetamol"
                            />
                        </div>
                        <div>
                            <Label htmlFor="genericName">Generic Name</Label>
                            <Input
                                id="genericName"
                                value={inventoryForm.genericName}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, genericName: e.target.value })}
                                placeholder="e.g., Acetaminophen"
                            />
                        </div>
                        <div>
                            <Label htmlFor="manufacturer">Manufacturer</Label>
                            <Input
                                id="manufacturer"
                                value={inventoryForm.manufacturer}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, manufacturer: e.target.value })}
                                placeholder="e.g., ABC Pharma"
                            />
                        </div>
                        <div>
                            <Label htmlFor="dosage">Dosage *</Label>
                            <Input
                                id="dosage"
                                value={inventoryForm.dosage}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, dosage: e.target.value })}
                                placeholder="e.g., 500mg"
                            />
                        </div>
                        <div>
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={inventoryForm.quantity}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                                placeholder="e.g., 100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="price">Price (NPR) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={inventoryForm.price}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, price: e.target.value })}
                                placeholder="e.g., 50"
                            />
                        </div>
                        <div>
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                value={inventoryForm.expiryDate}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, expiryDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={inventoryForm.category}
                                onValueChange={(value) => setInventoryForm({ ...inventoryForm, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="prescription">Prescription</SelectItem>
                                    <SelectItem value="otc">Over-the-Counter</SelectItem>
                                    <SelectItem value="supplement">Supplement</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                            <Input
                                id="lowStockThreshold"
                                type="number"
                                value={inventoryForm.lowStockThreshold}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, lowStockThreshold: e.target.value })}
                                placeholder="e.g., 10"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInventoryDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveInventory}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {editingItem ? 'Update' : 'Add'} Medicine
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center">Delete Medicine?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Are you sure you want to delete <span className="font-semibold">{itemToDelete?.medicineName}</span>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeleteInventory(itemToDelete?._id)}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Sign Out Confirmation Dialog */}
            < AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog} >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="h-6 w-6 text-red-600" />
                            </div>
                            <AlertDialogTitle>Sign out?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Are you sure you want to sign out? You'll need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setShowSignOutDialog(false);
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog >
        </div >
    );
}
