import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdmin = token?.role === "admin";
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

        // Si l'utilisateur n'est pas un admin et n'est pas sur la page d'authentification
        if (!isAdmin && !isAuthPage) {
            return NextResponse.redirect(new URL("/auth/signin", req.url));
        }

        // Si l'utilisateur est un admin et essaie d'accéder à la page d'authentification
        if (isAdmin && isAuthPage) {
            return NextResponse.redirect(new URL("/admin-dashboard", req.url));
        }

        return null;
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // On autorise l'accès à la page de connexion même sans token
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/admin-dashboard/:path*",
        "/auth/:path*",
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}; 