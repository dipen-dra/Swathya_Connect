import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Search, Users as UsersIcon, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import Pagination from './Pagination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AllUsers({ onFetchUsers, loading }) {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        search: ''
    });

    const [isDeactivating, setIsDeactivating] = useState(false);
    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [userToDeactivate, setUserToDeactivate] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, filters]);

    const fetchUsers = async () => {
        const result = await onFetchUsers({
            page: pagination.page,
            limit: pagination.limit,
            ...filters
        });

        if (result) {
            setUsers(result.users || []);
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || 0,
                pages: result.pagination?.pages || 1
            }));
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleItemsPerPageChange = (newLimit) => {
        setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const confirmDeactivate = async () => {
        if (!userToDeactivate) return;
        
        setIsDeactivating(true);
        try {
            const response = await adminAPI.deactivateUser(userToDeactivate.userId?._id);
            if (response.data.success) {
                toast.success(`Account for ${userToDeactivate.firstName} ${userToDeactivate.lastName} deactivated for 24 hours`);
                setDeactivateDialogOpen(false);
                setUserToDeactivate(null);
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            toast.error(error.response?.data?.message || 'Failed to deactivate account');
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleActivate = async (userId) => {
        try {
            const response = await adminAPI.activateUser(userId);
            if (response.data.success) {
                toast.success('Account activated successfully');
                fetchUsers(); // Refresh list
            }
        } catch (error) {
            console.error('Error activating user:', error);
            toast.error(error.response?.data?.message || 'Failed to activate account');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            patient: 'bg-blue-100 text-blue-700 border-blue-200',
            doctor: 'bg-green-100 text-green-700 border-green-200',
            pharmacy: 'bg-purple-100 text-purple-700 border-purple-200',
            admin: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:8080"}${imagePath}`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading users...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UsersIcon className="h-5 w-5" />
                        <span>All Users ({pagination.total})</span>
                    </CardTitle>
                    <CardDescription>
                        Manage all patients, doctors, and pharmacies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="patient">Patients</SelectItem>
                                <SelectItem value="doctor">Doctors</SelectItem>
                                <SelectItem value="pharmacy">Pharmacies</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* User List */}
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <UsersIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                            <p className="text-gray-600">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {users.map((user) => {
                                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
                                    return (
                                        <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={getImageUrl(user.profileImage)} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className="font-semibold text-gray-900">
                                                                {user.firstName} {user.lastName}
                                                            </h4>
                                                            <Badge variant="outline" className={getRoleBadgeColor(user.userId?.role)}>
                                                                {user.userId?.role || 'Unknown'}
                                                            </Badge>
                                                            {user.userId?.isActive === false && (
                                                                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                                                                    Deactivated
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span>{user.userId?.email || 'No email'}</span>
                                                            <span>•</span>
                                                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                                            {user.userId?.isActive === false && user.userId?.deactivationExpiresAt && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-red-500 font-medium">
                                                                        Unlocks {new Date(user.userId.deactivationExpiresAt).toLocaleString()}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center space-x-2">
                                                    {user.userId?.role !== 'admin' && (
                                                        <>
                                                            {user.userId?.isActive !== false ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        setUserToDeactivate(user);
                                                                        setDeactivateDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <UserX className="h-4 w-4 mr-1" />
                                                                    Deactivate
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={() => handleActivate(user.userId?._id)}
                                                                >
                                                                    <UserCheck className="h-4 w-4 mr-1" />
                                                                    Activate
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.limit}
                                    onPageChange={handlePageChange}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Deactivate Confirmation Dialog */}
            <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
                <AlertDialogContent className="sm:max-w-[450px]">
                    <AlertDialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl">Deactivate User Account?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base py-2">
                            Are you sure you want to deactivate <span className="font-bold text-gray-900">{userToDeactivate?.firstName} {userToDeactivate?.lastName}</span>? 
                            <br />
                            This will log them out and block access for <span className="font-semibold text-red-600">24 hours</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
                        <AlertDialogCancel className="w-full sm:w-auto border-gray-200 hover:bg-gray-50">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDeactivate();
                            }}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeactivating}
                        >
                            {isDeactivating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deactivating...
                                </>
                            ) : (
                                "Yes, Deactivate"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
