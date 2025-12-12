import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MetricCard from './MetricCard';
import {
    DollarSign,
    Activity,
    Users,
    UserCheck,
    MessageSquare,
    Phone,
    Video,
    TrendingUp,
    Building2,
    Stethoscope,
    Loader2
} from 'lucide-react';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';

export default function AnalyticsOverview() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAnalytics();
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="p-12">
                    <div className="text-center">
                        <p className="text-gray-600">No analytics data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
                <p className="text-gray-600">Comprehensive platform metrics and insights</p>
            </div>

            {/* Revenue Metrics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                    Revenue Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Total Revenue"
                        value={analytics.revenue.total}
                        icon={DollarSign}
                        color="green"
                        format="currency"
                    />
                    <MetricCard
                        title="Monthly Revenue"
                        value={analytics.revenue.monthly}
                        icon={TrendingUp}
                        color="blue"
                        format="currency"
                    />
                    <MetricCard
                        title="Average Fee"
                        value={analytics.revenue.average}
                        icon={Activity}
                        color="purple"
                        format="currency"
                    />
                </div>
            </div>

            {/* Consultation Metrics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Consultation Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Consultations"
                        value={analytics.consultations.total}
                        icon={Activity}
                        color="blue"
                    />
                    <MetricCard
                        title="Active"
                        value={analytics.consultations.active}
                        icon={UserCheck}
                        color="orange"
                    />
                    <MetricCard
                        title="Completed"
                        value={analytics.consultations.completed}
                        icon={TrendingUp}
                        color="green"
                    />
                    <MetricCard
                        title="Rejected"
                        value={analytics.consultations.rejected}
                        icon={Activity}
                        color="red"
                    />
                </div>
            </div>

            {/* Consultation Types */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Chat Consultations"
                        value={analytics.consultations.byType.chat}
                        icon={MessageSquare}
                        color="blue"
                    />
                    <MetricCard
                        title="Audio Consultations"
                        value={analytics.consultations.byType.audio}
                        icon={Phone}
                        color="purple"
                    />
                    <MetricCard
                        title="Video Consultations"
                        value={analytics.consultations.byType.video}
                        icon={Video}
                        color="teal"
                    />
                </div>
            </div>

            {/* User Metrics */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                    User Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                        title="Total Users"
                        value={analytics.users.total}
                        icon={Users}
                        color="purple"
                    />
                    <MetricCard
                        title="New Users This Month"
                        value={analytics.users.newThisMonth}
                        icon={TrendingUp}
                        color="green"
                    />
                </div>
            </div>

            {/* User Distribution */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="Patients"
                        value={analytics.users.byRole.patients}
                        icon={Users}
                        color="blue"
                    />
                    <MetricCard
                        title="Doctors"
                        value={analytics.users.byRole.doctors}
                        icon={Stethoscope}
                        color="green"
                    />
                    <MetricCard
                        title="Pharmacies"
                        value={analytics.users.byRole.pharmacies}
                        icon={Building2}
                        color="orange"
                    />
                </div>
            </div>

            {/* Verification Status */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                        title="Verified Doctors"
                        value={analytics.doctors.verified}
                        icon={UserCheck}
                        color="green"
                    />
                    <MetricCard
                        title="Verified Pharmacies"
                        value={analytics.pharmacies.verified}
                        icon={UserCheck}
                        color="teal"
                    />
                </div>
            </div>
        </div>
    );
}
