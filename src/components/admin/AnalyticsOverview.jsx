import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    Loader2,
    Sparkles
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
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <div className="absolute inset-0 h-12 w-12 animate-ping text-blue-400 opacity-20">
                                <Loader2 className="h-12 w-12" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-medium">Loading premium analytics...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!analytics) {
        return (
            <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                <CardContent className="p-12">
                    <div className="text-center">
                        <p className="text-gray-600">No analytics data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const SectionHeader = ({ icon: Icon, title, subtitle, gradient }) => (
        <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
            <div className={`h-1 w-20 bg-gradient-to-r ${gradient} rounded-full`} />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white">Premium Analytics</h2>
                    </div>
                    <p className="text-white/90 text-lg">Comprehensive platform insights at your fingertips</p>
                </div>
            </div>

            {/* Revenue Metrics */}
            <div>
                <SectionHeader
                    icon={DollarSign}
                    title="Revenue Performance"
                    subtitle="Track your earnings and growth"
                    gradient="from-emerald-500 to-green-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={analytics.revenue.total}
                        icon={DollarSign}
                        gradient="green"
                        format="currency"
                        trend="up"
                        trendValue="+12%"
                    />
                    <MetricCard
                        title="Monthly Revenue"
                        value={analytics.revenue.monthly}
                        icon={TrendingUp}
                        gradient="blue"
                        format="currency"
                        trend="up"
                        trendValue="+8%"
                    />
                    <MetricCard
                        title="Average Fee"
                        value={analytics.revenue.average}
                        icon={Activity}
                        gradient="purple"
                        format="currency"
                    />
                </div>
            </div>

            {/* Consultation Metrics */}
            <div>
                <SectionHeader
                    icon={Activity}
                    title="Consultation Analytics"
                    subtitle="Monitor consultation activity and status"
                    gradient="from-blue-500 to-indigo-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Consultations"
                        value={analytics.consultations.total}
                        icon={Activity}
                        gradient="blue"
                        trend="up"
                        trendValue="+15%"
                    />
                    <MetricCard
                        title="Active Now"
                        value={analytics.consultations.active}
                        icon={UserCheck}
                        gradient="orange"
                    />
                    <MetricCard
                        title="Completed"
                        value={analytics.consultations.completed}
                        icon={TrendingUp}
                        gradient="green"
                        trend="up"
                        trendValue="+20%"
                    />
                    <MetricCard
                        title="Rejected"
                        value={analytics.consultations.rejected}
                        icon={Activity}
                        gradient="red"
                    />
                </div>
            </div>

            {/* Consultation Types */}
            <div>
                <SectionHeader
                    icon={MessageSquare}
                    title="Consultation Channels"
                    subtitle="Distribution across communication types"
                    gradient="from-teal-500 to-cyan-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Chat Consultations"
                        value={analytics.consultations.byType.chat}
                        icon={MessageSquare}
                        gradient="blue"
                    />
                    <MetricCard
                        title="Audio Consultations"
                        value={analytics.consultations.byType.audio}
                        icon={Phone}
                        gradient="purple"
                    />
                    <MetricCard
                        title="Video Consultations"
                        value={analytics.consultations.byType.video}
                        icon={Video}
                        gradient="teal"
                    />
                </div>
            </div>

            {/* User Metrics */}
            <div>
                <SectionHeader
                    icon={Users}
                    title="User Growth"
                    subtitle="Platform user statistics and trends"
                    gradient="from-purple-500 to-pink-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={analytics.users.total}
                        icon={Users}
                        gradient="purple"
                        trend="up"
                        trendValue="+25%"
                    />
                    <MetricCard
                        title="New Users This Month"
                        value={analytics.users.newThisMonth}
                        icon={TrendingUp}
                        gradient="pink"
                        trend="up"
                        trendValue="+18%"
                    />
                </div>
            </div>

            {/* User Distribution */}
            <div>
                <SectionHeader
                    icon={Users}
                    title="User Distribution"
                    subtitle="Breakdown by user roles"
                    gradient="from-indigo-500 to-purple-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Patients"
                        value={analytics.users.byRole.patients}
                        icon={Users}
                        gradient="blue"
                    />
                    <MetricCard
                        title="Doctors"
                        value={analytics.users.byRole.doctors}
                        icon={Stethoscope}
                        gradient="green"
                    />
                    <MetricCard
                        title="Pharmacies"
                        value={analytics.users.byRole.pharmacies}
                        icon={Building2}
                        gradient="orange"
                    />
                </div>
            </div>

            {/* Verification Status */}
            <div>
                <SectionHeader
                    icon={UserCheck}
                    title="Verification Status"
                    subtitle="Approved healthcare providers"
                    gradient="from-emerald-500 to-teal-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard
                        title="Verified Doctors"
                        value={analytics.doctors.verified}
                        icon={UserCheck}
                        gradient="green"
                        trend="up"
                        trendValue="+5"
                    />
                    <MetricCard
                        title="Verified Pharmacies"
                        value={analytics.pharmacies.verified}
                        icon={UserCheck}
                        gradient="teal"
                        trend="up"
                        trendValue="+2"
                    />
                </div>
            </div>
        </div>
    );
}
