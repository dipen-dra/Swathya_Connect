import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    Upload, FileText, XCircle, Download, Link, Image as ImageIcon, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { profileAPI, medicineOrderAPI, pharmacyAPI, categoryAPI } from '@/services/api';
import { PharmacyChatList } from '@/components/pharmacy/PharmacyChatList';
import { VerifyPrescriptionDialog } from '@/components/pharmacy/VerifyPrescriptionDialog';
import { RejectPrescriptionDialog } from '@/components/pharmacy/RejectPrescriptionDialog';
import { CategoryManager } from '@/components/pharmacy/CategoryManager';


export default function PharmacyDashboard() {
    const { user, logout } = useAuth();
    const { profile, refreshProfile } = useProfile();
    const navigate = useNavigate();
    const { tab } = useParams();

    const [activeTab, setActiveTab] = useState(tab || 'orders');
    const [orders, setOrders] = useState([]); // Empty - no backend integration yet
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]); // Dynamic Categories
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        thisMonthRevenue: 0,
        activeCustomers: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Inventory dialog states
    const [showInventoryDialog, setShowInventoryDialog] = useState(false);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false); // New Category Dialog
    const [newCategoryForm, setNewCategoryForm] = useState({ name: '', description: '', image: '', imageFile: null, uploadMode: 'url' }); // New Category Form
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [inventoryForm, setInventoryForm] = useState({
        medicineName: '',
        genericName: '',
        manufacturer: '',
        dosage: '',
        quantity: '',
        reservedStock: 0,
        price: '',
        expiryDate: '',
        category: 'otc',
        lowStockThreshold: 10,
        image: '',
        description: '',
        isPublic: true,
        imageFile: null,
        uploadMode: 'url' // 'url' or 'file'
    });

    // Sign out dialog state
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);

    // Verification state
    const [verificationDocument, setVerificationDocument] = useState(null);
    const [verificationDocPreview, setVerificationDocPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pharmacyLicenseNumber, setPharmacyLicenseNumber] = useState('');
    const [panNumber, setPanNumber] = useState('');

    // Medicine Orders state
    const [medicineOrders, setMedicineOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [verifyDialog, setVerifyDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [orderFilterTab, setOrderFilterTab] = useState('all'); // all, pending, awaiting, paid, delivered
    const [viewDetailsDialog, setViewDetailsDialog] = useState(false);


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

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);


    // Fetch medicine orders on mount (needed for analytics which are always visible)
    useEffect(() => {
        fetchMedicineOrders();
    }, []);

    // Fetch inventory when switching to inventory tab
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

    const fetchMedicineOrders = async (status = null) => {
        try {
            setLoadingOrders(true);
            const response = await pharmacyAPI.getPharmacyOrders(status);
            if (response.data.success) {
                setMedicineOrders(response.data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching medicine orders:', error);
            toast.error('Failed to load medicine orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Calculate stats from medicine orders
    useEffect(() => {
        if (medicineOrders.length > 0) {
            // Total orders (all orders)
            const totalOrders = medicineOrders.length;

            // Pending orders (pending_verification status)
            const pendingOrders = medicineOrders.filter(
                order => order.status === 'pending_verification'
            ).length;

            // This month revenue (sum of paid orders from this month)
            const now = new Date();
            const thisMonthRevenue = medicineOrders
                .filter(order => {
                    const orderDate = new Date(order.paidAt || order.createdAt);
                    return (
                        order.paymentStatus === 'paid' &&
                        orderDate.getMonth() === now.getMonth() &&
                        orderDate.getFullYear() === now.getFullYear()
                    );
                })
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Active customers (unique patients who have placed orders)
            const uniquePatients = new Set(
                medicineOrders.map(order => order.patientId?._id || order.patientId)
            );
            const activeCustomers = uniquePatients.size;

            setStats({
                totalOrders,
                pendingOrders,
                thisMonthRevenue,
                activeCustomers
            });
        } else {
            // Reset stats if no orders
            setStats({
                totalOrders: 0,
                pendingOrders: 0,
                thisMonthRevenue: 0,
                activeCustomers: 0
            });
        }
    }, [medicineOrders]);

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
        try {
            const response = await pharmacyAPI.updateOrderStatus(orderId, newStatus);
            if (response.data.success) {
                setMedicineOrders(medicineOrders.map(o =>
                    o._id === orderId ? { ...o, status: newStatus } : o
                ));
                toast.success(`Order ${newStatus}!`);

                // Refresh orders to ensure inventory/stats are synced if needed
                fetchMedicineOrders(orderFilterTab === 'all' ? null : orderFilterTab);
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
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
            lowStockThreshold: '10',
            image: '',
            description: '',
            isPublic: true,
            imageFile: null,
            uploadMode: 'url'
        });
        setShowInventoryDialog(true);
    };

    const handleEditInventory = (item) => {
        setEditingItem(item._id);
        setInventoryForm({
            medicineName: item.medicineName,
            genericName: item.genericName,
            manufacturer: item.manufacturer,
            dosage: item.dosage,
            quantity: item.quantity,
            price: item.price,
            expiryDate: item.expiryDate?.split('T')[0],
            category: item.category,
            lowStockThreshold: item.lowStockThreshold || 10,
            image: item.image || '',
            description: item.description || '',
            isPublic: item.isPublic,
            imageFile: null,
            uploadMode: item.image && !item.image.startsWith('/uploads') ? 'url' : 'file' // Default to file mode if it looks like an uploaded path or empty, url mode if http
        });

        // Better logic: if it has an image and it starts with http, it's a URL mode. 
        // If it starts with /uploads, it's a file on server, so maybe show 'file' mode but we can't pre-fill the file input. 
        // Actually, if it's a server file, we might want to just show it's there. 
        // For simplicity, if it's a URL string, set mode 'url'. If it's a path, maybe default to 'url' too so they see the path?
        // Or better:
        // If image exists:
        //   - If starts with http/https -> mode 'url', value = image
        //   - If starts with /uploads -> mode 'file' (so they can replace it), but we can't show the file object. 
        //     We can perhaps show a "Current image" preview in the file mode.

        let initialUploadMode = 'url';
        if (item.image && item.image.startsWith('/uploads')) {
            initialUploadMode = 'file';
        } else if (item.image) {
            initialUploadMode = 'url';
        }

        setInventoryForm(prev => ({
            ...prev,
            uploadMode: initialUploadMode
        }));

        setShowInventoryDialog(true);
    };

    const handleSaveInventory = async () => {
        try {
            // Validate required fields
            if (!inventoryForm.medicineName || !inventoryForm.quantity || !inventoryForm.price || !inventoryForm.expiryDate || !inventoryForm.category || !inventoryForm.dosage) {
                toast.error('Please fill in all required fields');
                return;
            }

            const formData = new FormData();
            formData.append('medicineName', inventoryForm.medicineName);
            formData.append('genericName', inventoryForm.genericName);
            formData.append('manufacturer', inventoryForm.manufacturer);
            formData.append('dosage', inventoryForm.dosage);
            formData.append('quantity', inventoryForm.quantity);
            formData.append('reservedStock', inventoryForm.reservedStock || 0);
            formData.append('price', inventoryForm.price);
            formData.append('expiryDate', inventoryForm.expiryDate);
            formData.append('category', inventoryForm.category);
            formData.append('lowStockThreshold', inventoryForm.lowStockThreshold);
            formData.append('description', inventoryForm.description || '');
            formData.append('isPublic', inventoryForm.isPublic !== undefined ? inventoryForm.isPublic : true);

            // Handle Image - either File or URL
            if (inventoryForm.imageFile) {
                formData.append('image', inventoryForm.imageFile);
            } else {
                formData.append('image', inventoryForm.image || '');
            }

            if (editingItem) {
                const response = await pharmacyAPI.updateInventory(editingItem, formData);
                if (response.data.success) {
                    toast.success('Medicine updated successfully');
                    setInventory(inventory.map(item => item._id === editingItem ? response.data.data : item));
                    setShowInventoryDialog(false);
                    setEditingItem(null);
                }
            } else {
                const response = await pharmacyAPI.addInventory(formData);
                if (response.data.success) {
                    toast.success('Medicine added to inventory');
                    setInventory([...inventory, response.data.data]);
                    setShowInventoryDialog(false);
                    // Reset form
                    setInventoryForm({
                        medicineName: '',
                        genericName: '',
                        manufacturer: '',
                        dosage: '',
                        quantity: '',
                        reservedStock: 0,
                        price: '',
                        expiryDate: '',
                        category: 'otc',
                        lowStockThreshold: 10,
                        image: '',
                        description: '',
                        isPublic: true,
                        imageFile: null
                    });
                }
            }
        } catch (error) {
            console.error('Error saving inventory:', error);
            toast.error(error.response?.data?.message || 'Failed to save inventory item');
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

    // Filter medicine orders based on selected tab
    const filteredMedicineOrders = medicineOrders.filter(order => {
        switch (orderFilterTab) {
            case 'all':
                return true;
            case 'pending':
                return order.status === 'pending_verification';
            case 'awaiting':
                return order.status === 'awaiting_payment';
            case 'paid':
                return order.status === 'paid' || order.status === 'preparing';
            case 'delivered':
                return order.status === 'delivered' || order.status === 'out_for_delivery';
            default:
                return true;
        }
    });

    const handleAddCategory = async () => {
        if (!newCategoryForm.name) {
            toast.error('Category name is required');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', newCategoryForm.name);
            formData.append('description', newCategoryForm.description);
            if (newCategoryForm.imageFile) {
                formData.append('image', newCategoryForm.imageFile);
            } else if (newCategoryForm.image) {
                formData.append('image', newCategoryForm.image);
            }

            const response = await categoryAPI.create(formData);
            if (response.data.success) {
                toast.success('Category created successfully');
                setShowCategoryDialog(false);
                setNewCategoryForm({ name: '', description: '', image: '', imageFile: null, uploadMode: 'url' });
                fetchCategories();
                // Auto-select the new category
                setInventoryForm(prev => ({ ...prev, category: response.data.data.name }));
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.error || 'Failed to create category');
        }
    };

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
                        <div className="flex space-x-8 border-b border-gray-200 overflow-x-auto pb-2 scrollbar-none">
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
                            {/* Verification Tab - Only show if not verified */}
                            {profile?.verificationStatus !== 'approved' && (
                                <button
                                    onClick={() => handleTabChange('verification')}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } transition-colors`}
                                >
                                    <Shield className="inline h-4 w-4 mr-1" />
                                    Verification
                                </button>
                            )}
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
                        {/* Orders Tab - Medicine Orders */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">Medicine Orders</h3>
                                    <p className="text-sm text-gray-600">Manage prescription orders from patients</p>
                                </div>

                                {/* Order Status Tabs */}
                                <div className="border-b border-gray-200">
                                    <div className="flex space-x-8">
                                        <button
                                            onClick={() => setOrderFilterTab('all')}
                                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${orderFilterTab === 'all'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            All Orders
                                        </button>
                                        <button
                                            onClick={() => setOrderFilterTab('pending')}
                                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${orderFilterTab === 'pending'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Pending Verification
                                        </button>
                                        <button
                                            onClick={() => setOrderFilterTab('awaiting')}
                                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${orderFilterTab === 'awaiting'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Awaiting Payment
                                        </button>
                                        <button
                                            onClick={() => setOrderFilterTab('paid')}
                                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${orderFilterTab === 'paid'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Paid
                                        </button>
                                        <button
                                            onClick={() => setOrderFilterTab('delivered')}
                                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${orderFilterTab === 'delivered'
                                                ? 'border-purple-600 text-purple-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            Delivered
                                        </button>
                                    </div>
                                </div>

                                {/* Orders List */}
                                {loadingOrders ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <span className="ml-3 text-gray-600">Loading orders...</span>
                                    </div>
                                ) : filteredMedicineOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredMedicineOrders.map((order) => (
                                            <Card key={order._id} className="border border-gray-200 hover:shadow-md transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <h4 className="font-semibold text-gray-900">
                                                                    Order #{order._id.slice(-6)}
                                                                </h4>
                                                                <Badge className={
                                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                        order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                            order.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-700' :
                                                                                order.status === 'paid' || order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                                                    'bg-yellow-100 text-yellow-700'
                                                                }>
                                                                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </Badge>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mb-1">
                                                                Patient: <span className="font-medium">{order.patientId?.fullName || 'Unknown'}</span>
                                                            </p>

                                                            <p className="text-sm text-gray-600 mb-2">
                                                                Delivery: {order.deliveryAddress}
                                                            </p>

                                                            <div className="mb-2">
                                                                <Badge variant="outline" className={`${order.type === 'ecommerce' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                                    {order.type === 'ecommerce' ? 'Store Order' : 'Prescription'}
                                                                </Badge>
                                                            </div>

                                                            {order.medicines && order.medicines.length > 0 && (
                                                                <div className="mb-2">
                                                                    <p className="text-xs text-gray-500 mb-1">Medicines:</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {order.medicines.slice(0, 3).map((med, idx) => (
                                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                                {med.name} {med.dosage}
                                                                            </Badge>
                                                                        ))}
                                                                        {order.medicines.length > 3 && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                +{order.medicines.length - 3} more
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                                {order.totalAmount > 0 && (
                                                                    <span className="font-semibold text-purple-600">
                                                                        NPR {order.totalAmount}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col space-y-2 ml-4">
                                                            {order.status === 'pending_verification' && (
                                                                <>
                                                                    {order.type === 'ecommerce' ? (
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all"
                                                                            onClick={() => handleUpdateOrderStatus(order._id, 'awaiting_payment')}
                                                                        >
                                                                            Accept Order
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all"
                                                                            onClick={() => {
                                                                                setSelectedOrder(order);
                                                                                setVerifyDialog(true);
                                                                            }}
                                                                        >
                                                                            Verify & Bill
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm hover:shadow-md transition-all"
                                                                        onClick={() => {
                                                                            setSelectedOrder(order);
                                                                            setRejectDialog(true);
                                                                        }}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {(order.status === 'paid' || order.status === 'preparing' || order.status === 'ready_for_delivery') && (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                                                                    onClick={() => {
                                                                        const nextStatus =
                                                                            order.status === 'paid' ? 'preparing' :
                                                                                order.status === 'preparing' ? 'ready_for_delivery' :
                                                                                    'out_for_delivery';
                                                                        handleUpdateOrderStatus(order._id, nextStatus);
                                                                    }}
                                                                >
                                                                    {order.status === 'paid' ? 'Start Preparing' :
                                                                        order.status === 'preparing' ? 'Ready for Delivery' :
                                                                            'Out for Delivery'}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md transition-all"
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setViewDetailsDialog(true);
                                                                }}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="border border-gray-200">
                                        <CardContent className="p-12 text-center">
                                            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Medicine Orders Yet</h3>
                                            <p className="text-gray-600">
                                                Orders from patients will appear here
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
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
                            <PharmacyChatList />
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



                        {activeTab === 'chat' && (
                            <PharmacyChatList />
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
                                onValueChange={(value) => {
                                    if (value === 'new_category') {
                                        setNewCategoryForm({ name: '', description: '', image: '', imageFile: null, uploadMode: 'url' });
                                        setShowCategoryDialog(true);
                                    } else {
                                        setInventoryForm({ ...inventoryForm, category: value });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new_category" className="text-teal-600 font-semibold cursor-pointer">
                                        + Create New Category
                                    </SelectItem>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}

                                    {/* Keep legacy options if categories load fails or are empty initially */}
                                    {categories.length === 0 && (
                                        <>
                                            <SelectItem value="otc">OTC Medicines</SelectItem>
                                            <SelectItem value="prescription">Prescription</SelectItem>
                                            <SelectItem value="supplement">Supplements</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </>
                                    )}

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
                        <div className="col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={inventoryForm.description}
                                onChange={(e) => setInventoryForm({ ...inventoryForm, description: e.target.value })}
                                placeholder="Product description, usage, etc."
                            />
                        </div>
                        <div className="col-span-2 space-y-3">
                            <Label>Product Image</Label>

                            {/* Toggle Switch */}
                            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setInventoryForm({ ...inventoryForm, uploadMode: 'url', imageFile: null })}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${inventoryForm.uploadMode === 'url'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Link className="w-4 h-4" />
                                    <span>Image URL</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setInventoryForm({ ...inventoryForm, uploadMode: 'file', image: '' })}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${inventoryForm.uploadMode === 'file'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload File</span>
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="mt-2">
                                {inventoryForm.uploadMode === 'url' ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Link className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                value={inventoryForm.image}
                                                onChange={(e) => setInventoryForm({ ...inventoryForm, image: e.target.value })}
                                                placeholder="https://example.com/image.png"
                                                className="pl-9"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Enter a direct URL to an image hosted online.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {!inventoryForm.imageFile ? (
                                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setInventoryForm({ ...inventoryForm, imageFile: file, image: '' });
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                                                        <ImageIcon className="w-6 h-6 text-teal-600" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-teal-600">Click to upload</span>
                                                        <span className="text-gray-500"> or drag and drop</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        SVG, PNG, JPG or GIF (max. 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-teal-50 border-teal-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-white rounded-md border border-teal-100">
                                                        <ImageIcon className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                            {inventoryForm.imageFile.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(inventoryForm.imageFile.size / 1024).toFixed(0)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setInventoryForm({ ...inventoryForm, imageFile: null })}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
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
            </AlertDialog>

            {/* Medicine Order Dialogs */}
            <VerifyPrescriptionDialog
                open={verifyDialog}
                onOpenChange={setVerifyDialog}
                order={selectedOrder}
                onVerified={() => {
                    fetchMedicineOrders();
                    setSelectedOrder(null);
                }}
            />

            <RejectPrescriptionDialog
                open={rejectDialog}
                onOpenChange={setRejectDialog}
                order={selectedOrder}
                onRejected={() => {
                    fetchMedicineOrders();
                    setSelectedOrder(null);
                }}
            />

            {/* Add Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent className="bg-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>Add a new category for your medicines.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Category Name *</Label>
                            <Input
                                value={newCategoryForm.name}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                                placeholder="e.g. Skin Care"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Input
                                value={newCategoryForm.description}
                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                                placeholder="Brief description..."
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Category Image</Label>

                            {/* Toggle Switch */}
                            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setNewCategoryForm({ ...newCategoryForm, uploadMode: 'url', imageFile: null })}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${newCategoryForm.uploadMode === 'url'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Link className="w-4 h-4" />
                                    <span>Image URL</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewCategoryForm({ ...newCategoryForm, uploadMode: 'file', image: '' })}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${newCategoryForm.uploadMode === 'file'
                                        ? 'bg-white text-teal-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload File</span>
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="mt-2">
                                {newCategoryForm.uploadMode === 'url' ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Link className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                value={newCategoryForm.image}
                                                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, image: e.target.value })}
                                                placeholder="https://example.com/category-image.png"
                                                className="pl-9"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Enter a direct URL to an image hosted online.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {!newCategoryForm.imageFile ? (
                                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setNewCategoryForm({ ...newCategoryForm, imageFile: file, image: '' });
                                                        }
                                                    }}
                                                />
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="p-3 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors">
                                                        <ImageIcon className="w-6 h-6 text-teal-600" />
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-semibold text-teal-600">Click to upload</span>
                                                        <span className="text-gray-500"> or drag and drop</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">
                                                        SVG, PNG, JPG or GIF (max. 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-teal-50 border-teal-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-white rounded-md border border-teal-100">
                                                        <ImageIcon className="w-5 h-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                            {newCategoryForm.imageFile.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(newCategoryForm.imageFile.size / 1024).toFixed(0)} KB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setNewCategoryForm({ ...newCategoryForm, imageFile: null })}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddCategory} className="bg-teal-600 text-white">Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Details Dialog */}
            <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Order ID</p>
                                    <p className="font-semibold">{selectedOrder._id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedOrder.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800' :
                                            selectedOrder.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                                                selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Patient Name</p>
                                    <p className="font-semibold">{selectedOrder.patientId?.fullName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Patient Phone</p>
                                    <p className="font-semibold">{selectedOrder.patientId?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Prescription */}
                            {selectedOrder.prescriptionImage && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Prescription</h4>
                                    {selectedOrder.prescriptionImage.toLowerCase().endsWith('.pdf') ? (
                                        // PDF file - show download link
                                        <div className="border rounded-lg p-6 bg-gray-50 text-center">
                                            <FileText className="h-16 w-16 mx-auto text-purple-600 mb-3" />
                                            <p className="text-sm text-gray-600 mb-3">PDF Prescription Document</p>
                                            <a
                                                href={selectedOrder.prescriptionImage.startsWith('http') ? selectedOrder.prescriptionImage : `http://localhost:5000${selectedOrder.prescriptionImage}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Prescription
                                            </a>
                                        </div>
                                    ) : (
                                        // Image file - display inline
                                        <img
                                            src={selectedOrder.prescriptionImage.startsWith('http') ? selectedOrder.prescriptionImage : `http://localhost:5000${selectedOrder.prescriptionImage}`}
                                            alt="Prescription"
                                            className="max-w-full h-auto rounded-lg border"
                                            onError={(e) => {
                                                console.error('Failed to load prescription image:', selectedOrder.prescriptionImage);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Medicines */}
                            {selectedOrder.medicines && selectedOrder.medicines.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Medicines</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medicine</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dosage</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedOrder.medicines.map((med, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-sm">{med.name}</td>
                                                        <td className="px-4 py-2 text-sm">{med.dosage}</td>
                                                        <td className="px-4 py-2 text-sm">{med.quantity}</td>
                                                        <td className="px-4 py-2 text-sm">NPR {med.pricePerUnit}</td>
                                                        <td className="px-4 py-2 text-sm font-semibold">NPR {med.pricePerUnit * med.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Bill Summary */}
                            {selectedOrder.totalAmount > 0 && (
                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold">NPR {selectedOrder.subtotal || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Charges</span>
                                            <span className="font-semibold">NPR {selectedOrder.deliveryCharges || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                                            <span>Total Amount</span>
                                            <span className="text-purple-600">NPR {selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Address */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.deliveryAddress}</p>
                            </div>

                            {/* Delivery Notes */}
                            {selectedOrder.deliveryNotes && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Delivery Notes</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOrder.deliveryNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
}
