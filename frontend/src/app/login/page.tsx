"use client";

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '../actions/auth';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  const activeError = state?.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            Document RAG REST API
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to upload and chat with your documents
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-8 py-8 shadow-2xl space-y-6">
          {activeError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3">
              {activeError === 'Invalid username or password.' 
                ? 'Invalid email or password. Please double check and try again.' 
                : activeError}
            </div>
          )}

          <form className="space-y-6" action={formAction}>
            <div className="space-y-2">
              <label htmlFor="username" className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                disabled={isPending}
                className="block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="block w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-400 pt-2 border-t border-zinc-800">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
