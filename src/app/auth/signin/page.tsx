"use client";

import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
    
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
    
        if (result?.error) {
          setError(result.error);
        } else {
          window.location.href = "/admin-dashboard"; // Redirection après connexion
        }
      };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
            <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Connexion</h2>
            </div>
            {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit} >
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button type="submit" className="group relative flex w-full justify-center bg-blue-500 text-white py-2 text-sm font-semibold rounded-md hover:bg-blue-600">
          Se connecter
        </button>
      </form>
            <div className="mt-8 space-y-6">
            <button
                onClick={() => signIn("github", { callbackUrl: "/admin-dashboard" })}
                className="group relative flex w-full justify-center rounded-md bg-[#333] px-3 py-2 text-sm font-semibold text-white hover:bg-[#24292e]"
            >
                <svg
                className="mr-2 h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
                >
                <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.528 2.341 1.087 2.91.832.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.91-1.294 2.75-1.025 2.75-1.025.544 1.376.201 2.393.099 2.646.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.563 4.936.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.135 20.165 22 16.418 22 12c0-5.52-4.48-10-10-10z"
                    clipRule="evenodd"
                />
                </svg>
                Sign in with GitHub
            </button>
            </div>
        </div>
        </div>
    );
} 