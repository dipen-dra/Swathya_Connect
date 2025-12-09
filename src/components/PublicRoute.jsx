import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PublicRoute Component
 * Wraps public routes (like landing page) that should redirect authenticated users
 * to their role-specific dashboard
 */
export function PublicRoute({ children }) {
    const { user, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If user is authenticated, redirect to their role-specific dashboard
    if (user) {
        const dashboardPath = user.role === 'doctor'
            ? '/doctor/dashboard'
            : user.role === 'admin'
                ? '/admin/dashboard'
                : user.role === 'pharmacy'
                    ? '/pharmacy-dashboard'
                    : '/dashboard';

        // Use replace to prevent back button navigation to this page
        return <Navigate to={dashboardPath} replace />;
    }

    // User is not authenticated, show the public page
    return children;
}
