import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthPage } from '../_components/auth/auth-page.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth');
  return { title: t('registerTitle') };
}

export default function SignUpPage({ searchParams }: PageProps<'/rejestracja'>) {
  return <AuthPage mode="register" searchParams={searchParams} />;
}
