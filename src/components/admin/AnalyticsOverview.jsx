import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Sparkles,
    BarChart3,
    PieChart,
    LineChart
} from 'lucide-react';
import { adminAPI } from '@/services/api';
import { toast } from 'sonner';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RePieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

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
                        <p className="text-gray-600 font-medium">Loading analytics...</p>
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

    // Prepare chart data
    const consultationTypeData = [
        { name: 'Chat', value: analytics.consultations.byType.chat, color: '#3b82f6' },
        { name: 'Audio', value: analytics.consultations.byType.audio, color: '#8b5cf6' },
        { name: 'Video', value: analytics.consultations.byType.video, color: '#14b8a6' }
    ];

    const userDistributionData = [
        { name: 'Patients', value: analytics.users.byRole.patients, color: '#3b82f6' },
        { name: 'Doctors', value: analytics.users.byRole.doctors, color: '#10b981' },
        { name: 'Pharmacies', value: analytics.users.byRole.pharmacies, color: '#a855f7' }
    ];

    const consultationStatusData = [
        { name: 'Active', value: analytics.consultations.active },
        { name: 'Completed', value: analytics.consultations.completed },
        { name: 'Rejected', value: analytics.consultations.rejected }
    ];

    return (
        <div className="space-y-6">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
                        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
                    </div>
                    <p className="text-white/90 text-lg">Comprehensive insights organized for clarity</p>
                </div>
            </div>

            {/* Tabbed Analytics */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="revenue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-600 data-[state=active]:text-white">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Revenue
                    </TabsTrigger>
                    <TabsTrigger value="consultations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                        <Activity className="h-4 w-4 mr-2" />
                        Consultations
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                        <Users className="h-4 w-4 mr-2" />
                        Users
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total Revenue"
                            value={analytics.revenue.total}
                            icon={DollarSign}
                            gradient="green"
                            format="currency"
                        />
                        <MetricCard
                            title="Total Consultations"
                            value={analytics.consultations.total}
                            icon={Activity}
                            gradient="blue"
                        />
                        <MetricCard
                            title="Total Users"
                            value={analytics.users.total}
                            icon={Users}
                            gradient="purple"
                        />
                        <MetricCard
                            title="Active Now"
                            value={analytics.consultations.active}
                            icon={UserCheck}
                            gradient="orange"
                        />
                    </div>

                    {/* Quick Stats Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                                    Consultation Types
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RePieChart>
                                        <Pie
                                            data={consultationTypeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {consultationTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                                    User Distribution
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={userDistributionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                            {userDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <MetricCard
                            title="Total Revenue"
                            value={analytics.revenue.total}
                            icon={DollarSign}
                            gradient="green"
                            format="currency"
                        />
                        <MetricCard
                            title="Monthly Revenue"
                            value={analytics.revenue.monthly}
                            icon={TrendingUp}
                            gradient="blue"
                            format="currency"
                        />
                        <MetricCard
                            title="Average Fee"
                            value={analytics.revenue.average}
                            icon={Activity}
                            gradient="purple"
                            format="currency"
                        />
                    </div>

                    {/* Monthly Revenue Trend Chart */}
                    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                                Monthly Revenue Trend (Last 6 Months)
                            </h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={analytics.revenue.monthlyTrend}>
                                    <defs>
                                        <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPharmacies" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="doctors"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorDoctors)"
                                        name="Doctor Consultations"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pharmacies"
                                        stroke="#a855f7"
                                        fillOpacity={1}
                                        fill="url(#colorPharmacies)"
                                        name="Pharmacy Sales"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Revenue Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor Revenue */}
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                        <Stethoscope className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Doctor Consultations</h3>
                                        <p className="text-sm text-gray-600">Revenue from medical consultations</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                                        <span className="text-lg font-bold text-green-600">
                                            NPR {analytics.revenue.doctors.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">This Month</span>
                                        <span className="text-lg font-bold text-green-600">
                                            NPR {analytics.revenue.doctors.monthly.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Consultations</span>
                                        <span className="text-lg font-bold text-green-600">
                                            {analytics.consultations.completed}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pharmacy Revenue */}
                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Pharmacy Sales</h3>
                                        <p className="text-sm text-gray-600">Revenue from medicine orders</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            NPR {analytics.revenue.pharmacies.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">This Month</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            NPR {analytics.revenue.pharmacies.monthly.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Medicines Sold</span>
                                        <span className="text-lg font-bold text-purple-600">
                                            {analytics.revenue.pharmacies.medicinesSold}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Consultations Tab */}
                <TabsContent value="consultations" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <MetricCard
                            title="Total"
                            value={analytics.consultations.total}
                            icon={Activity}
                            gradient="blue"
                        />
                        <MetricCard
                            title="Active"
                            value={analytics.consultations.active}
                            icon={UserCheck}
                            gradient="orange"
                        />
                        <MetricCard
                            title="Completed"
                            value={analytics.consultations.completed}
                            icon={TrendingUp}
                            gradient="green"
                        />
                        <MetricCard
                            title="Rejected"
                            value={analytics.consultations.rejected}
                            icon={Activity}
                            gradient="red"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Consultation Status</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={consultationStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 gap-6">
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
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard
                            title="Total Users"
                            value={analytics.users.total}
                            icon={Users}
                            gradient="purple"
                        />
                        <MetricCard
                            title="New This Month"
                            value={analytics.users.newThisMonth}
                            icon={TrendingUp}
                            gradient="pink"
                        />
                    </div>

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
                            gradient="purple"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard
                            title="Verified Doctors"
                            value={analytics.doctors.verified}
                            icon={UserCheck}
                            gradient="green"
                        />
                        <MetricCard
                            title="Verified Pharmacies"
                            value={analytics.pharmacies.verified}
                            icon={UserCheck}
                            gradient="purple"
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
