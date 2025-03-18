'use client';

export const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-700">Chargement...</span>
        </div>
    );
}; 