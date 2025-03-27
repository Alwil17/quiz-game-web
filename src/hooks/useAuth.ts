import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSession } from '../types/auth';

export const useAuth = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const userSession = session as UserSession;

    const login = async (email: string, password: string) => {
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            if (result?.ok) {
                router.push('/admin-dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut({ redirect: false });
            router.push('/auth/signin');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const isAuthenticated = status === 'authenticated';
    const isLoading = status === 'loading';
    const isAdmin = userSession?.user?.role === 'admin';

    return {
        user: userSession?.user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        logout,
    };
}; 