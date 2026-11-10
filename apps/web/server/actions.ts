'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContainer } from './runtime.ts';

/** Ends the session of this device (S3 adds "sign out everywhere"). */
export async function signOut(): Promise<never> {
  await getContainer().cradle.auth.api.signOut({ headers: await headers() });
  redirect('/');
}
