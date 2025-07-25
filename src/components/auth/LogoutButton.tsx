import { useAuth } from '@/hooks/useAuth';

export const LogoutButton = () => {
    const { logout } = useAuth();

    return (
        <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
            Déconnexion
        </button>
    );
}; 