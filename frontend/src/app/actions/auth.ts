"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || username.trim().length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      let detail = 'Failed to sign in. Please verify your credentials.';
      try {
        const errJson = await res.json();
        detail = errJson.detail || detail;
      } catch {
        // fallback
      }
      return { error: detail };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    
    // Set standard session cookie
    cookieStore.set('token', data.access_token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    cookieStore.set('username', username, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (err) {
    return { error: 'Could not connect to authentication server.' };
  }

  redirect('/');
}

export async function signupAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!username || username.trim().length < 3) {
    return { error: 'Username must be at least 3 characters.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    // 1. Call Signup
    const signupRes = await fetch(`${BACKEND_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!signupRes.ok) {
      let detail = 'Registration failed.';
      try {
        const errJson = await signupRes.json();
        detail = errJson.detail || detail;
      } catch {
        // fallback
      }
      return { error: detail };
    }

    // 2. Call Login automatically
    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!loginRes.ok) {
      return { error: 'Registration succeeded, but auto-login failed. Please sign in manually.' };
    }

    const data = await loginRes.json();
    const cookieStore = await cookies();
    
    cookieStore.set('token', data.access_token, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    cookieStore.set('username', username, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  } catch (err) {
    return { error: 'Could not connect to authentication server.' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('username');
  redirect('/login');
}
