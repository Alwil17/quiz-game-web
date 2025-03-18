import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  return session ? (
    <button onClick={() => signOut()} className="px-4 py-2 bg-red-500 text-white rounded">Se déconnecter</button>
  ) : (
    <button onClick={() => signIn("github")} className="px-4 py-2 bg-blue-500 text-white rounded">Se connecter</button>
  );
}
