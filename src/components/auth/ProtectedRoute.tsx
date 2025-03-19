import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/signin');
            } else if (requireAdmin && !isAdmin) {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isLoading, isAdmin, requireAdmin, router]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || (requireAdmin && !isAdmin)) {
        return null;
    }

    return <>{children}</>;
}; 