import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and/or specific roles
 * Redirects to login if user is not authenticated
 * Redirects to dashboard if authenticated user tries to access auth pages
 * Redirects to appropriate dashboard if user doesn't have required role
 */
export function ProtectedRoute({ children, requireAuth = true, allowedRoles = null }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

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

    // If route requires authentication
    if (requireAuth) {
        if (!user) {
            // Save the location they were trying to access
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // Check if user has the required role
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to user's role-specific dashboard
            const dashboardPath = user.role === 'doctor'
                ? '/doctor/dashboard'
                : user.role === 'admin'
                    ? '/admin/dashboard'
                    : user.role === 'pharmacy'
                        ? '/pharmacy-dashboard'
                        : '/dashboard';
            return <Navigate to={dashboardPath} replace />;
        }

        return children;
    }

    // If route is for non-authenticated users (login, register)
    if (!requireAuth && user) {
        // Redirect authenticated users to their role-specific dashboard
        const dashboardPath = user.role === 'doctor'
            ? '/doctor/dashboard'
            : user.role === 'admin'
                ? '/admin/dashboard'
                : user.role === 'pharmacy'
                    ? '/pharmacy-dashboard'
                    : '/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
}
