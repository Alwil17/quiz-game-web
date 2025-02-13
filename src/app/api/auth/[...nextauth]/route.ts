import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
        name: "Email & Password",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "exemple@email.com" },
          password: { label: "Mot de passe", type: "password" },
        },
        async authorize(credentials) {
          // Remplace ceci par ta logique d'authentification (DB ou API)
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email et mot de passe requis");
          }
  
          // Simule un utilisateur (Remplace par une requête à ta base de données)
          const user = {
            id: "1",
            name: "Admin",
            email: "admin@example.com",
            password: "admin123", // À remplacer par un vrai hash bcrypt en BDD
          };
  
          if (credentials.email !== user.email || credentials.password !== user.password) {
            throw new Error("Email ou mot de passe incorrect");
          }
  
          return { id: user.id, name: user.name, email: user.email };
        },
      }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Redirect to signin page if not authenticated
      if (!user) {
        return '/auth/signin'; // Redirect to the signin page
      }
      return true; // Continue with the default behavior
    },
  },
});

export { handler as GET, handler as POST }; 