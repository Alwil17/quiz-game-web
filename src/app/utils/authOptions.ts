import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "../api/api";
import { AuthResponse } from "@/types/auth";
import NextAuth, { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "exemple@email.com",
        },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        try {
          const response = await api.post<AuthResponse>("/auth/signin", {
            email: credentials.email,
            password: credentials.password,
          });

          const user = response.data;

          if (user && user.role === "user") {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              token: user.token,
            };
          }
          throw new Error(
            "Accès non autorisé. Seuls les administrateurs peuvent se connecter."
          );
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Erreur lors de la connexion";
          throw new Error(message);
        }
      },
    }),
  ],
  // The 'pages' configuration allows you to specify custom URLs for the built-in authentication pages.
  // Here, we are setting the URL for the sign-in page and the error page.
  pages: {
    signIn: "/auth/signin", // This is the URL for the sign-in page.
    error: "/auth/error", // This is the URL for the error page.
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        if (user.role !== "user") {
          throw new Error("Accès non autorisé");
        }
        token.id = user.id;
        token.role = user.role;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.token = token.token;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}/admin-dashboard`;
      } else if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/admin-dashboard`;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
