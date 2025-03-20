import { UserSession } from "@/types/auth";

export const isAuthenticated = (session: UserSession | null): boolean => {
    return !!session?.user;
};

export const isAdmin = (session: UserSession | null): boolean => {
    return session?.user?.role === 'admin';
};

export const getAuthToken = (session: UserSession | null): string | null => {
    return session?.user?.token || null;
};

export const parseJwt = (token: string): any => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const decodedToken = parseJwt(token);
    if (!decodedToken) return true;
    
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
};

export const getRedirectPath = (session: UserSession | null): string => {
    if (!session?.user) return '/auth/signin';
    if (session.user.role === 'admin') return '/admin-dashboard';
    return '/dashboard';
}; 