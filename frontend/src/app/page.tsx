"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
            Document RAG REST API Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              Signed in as: <strong className="text-zinc-200">{user?.username || 'User'}</strong>
            </span>
            <button
              onClick={logout}
              className="py-1.5 px-3 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-50">Welcome to your dashboard</h2>
          <p className="text-zinc-400 leading-relaxed text-sm">
            You have successfully authenticated and bypassed the Next.js Edge proxy route guard. 
            In the upcoming phases, this screen will load your uploaded files and provide access 
            to active conversational chat panels.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Auth Guard Enabled
            </span>
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              SSR Cookie Sync
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
