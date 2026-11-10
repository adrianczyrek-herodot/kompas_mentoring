import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthPage } from '../_components/auth/auth-page.tsx';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth');
  return { title: t('loginTitle') };
}

export default function SignInPage({ searchParams }: PageProps<'/logowanie'>) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
