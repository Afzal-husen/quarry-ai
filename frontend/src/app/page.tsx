import React from 'react';
import { cookies } from 'next/headers';
import DashboardShell from '@/components/DashboardShell';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default async function Home() {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value || 'User';
  const token = cookieStore.get('token')?.value;

  let initialDocuments = [];
  if (token) {
    try {
      const response = await fetch(`${BACKEND_URL}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        initialDocuments = data.items || [];
      }
    } catch (err) {
      console.error('Failed to fetch initial documents on server:', err);
    }
  }

  return (
    <DashboardShell
      initialDocuments={initialDocuments}
      username={username}
    />
  );
}
