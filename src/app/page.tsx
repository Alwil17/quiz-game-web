'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';

export default function HomePage() {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && isAdmin) {
                router.push('/admin-dashboard');
            } else {
                router.push('/auth/signin');
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                        <span className="block">Administration</span>
                        <span className="block text-primary">Quiz Game</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Interface d'administration pour gérer les quiz et les utilisateurs.
                    </p>
                </div>
            </div>
        </div>
    );
}