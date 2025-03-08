import { Metadata } from 'next';
import { SignInClient } from './SignInClient';

export const metadata: Metadata = {
    title: 'Connexion | Quiz Game',
    description: 'Connectez-vous à votre compte Quiz Game',
};

export default function SignInPage() {
    return <SignInClient />;
} 