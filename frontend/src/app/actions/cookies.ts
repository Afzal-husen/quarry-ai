"use server";

import { cookies } from 'next/headers';

export async function getTokenAction(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export async function setTokenAction(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function deleteTokenAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
