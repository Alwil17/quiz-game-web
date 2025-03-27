import { Metadata } from 'next';
import { SignUpClient } from './SignUpClient';

export const metadata: Metadata = {
    title: 'Inscription Admin | Quiz Game',
    description: 'Créer un compte administrateur Quiz Game',
};

export default function SignUpPage() {
    return <SignUpClient />;
} 