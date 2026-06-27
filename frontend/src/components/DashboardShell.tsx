"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, Trash2, Clock, CheckCircle2, AlertCircle, FileSpreadsheet, LogOut } from 'lucide-react';
import { apiGet, apiDelete } from '../lib/api-client';
import UploadModal from './UploadModal';
import { logoutAction } from '../app/actions/auth';

interface DocumentItem {
  document_id: string;
  filename: string;
  upload_date: string;
  chunk_count: number;
  status: string;
  can_reindex: boolean;
}

interface ActiveJob {
  job_id: string;
  filename: string;
  status: string;
  error?: string | null;
}

interface DashboardShellProps {
  initialDocuments: DocumentItem[];
  username: string;
}

export default function DashboardShell({ initialDocuments, username }: DashboardShellProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load active jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('document_rag_active_jobs');
    if (savedJobs) {
      try {
        setActiveJobs(JSON.parse(savedJobs));
      } catch {
        // clear corrupted data
        localStorage.removeItem('document_rag_active_jobs');
      }
    }
  }, []);

  // Fetch updated document list
  const refreshDocuments = useCallback(async () => {
    try {
      const response = await apiGet('/documents');
      if (response && response.items) {
        setDocuments(response.items);
      }
    } catch (err) {
      console.error('Failed to refresh documents:', err);
    }
  }, []);

  // Polling loop for active uploads status
  useEffect(() => {
    // Clear any existing timer
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (activeJobs.length === 0) return;

    const pollJobs = async () => {
      let changed = false;
      const updatedJobs = [...activeJobs];

      for (let i = 0; i < updatedJobs.length; i++) {
        const job = updatedJobs[i];
        if (job.status === 'complete' || job.status === 'failed') continue;

        try {
          const res = await apiGet(`/upload/${job.job_id}/status`);
          if (res && res.status !== job.status) {
            updatedJobs[i] = {
              ...job,
              status: res.status,
              error: res.error
            };
            changed = true;

            if (res.status === 'complete') {
              setToast({ type: 'success', message: `"${job.filename}" indexed successfully!` });
            } else if (res.status === 'failed') {
              setToast({ type: 'error', message: `Failed to process "${job.filename}": ${res.error || 'Unknown error'}` });
            }
          }
        } catch (err: any) {
          // If 404, the job might have expired or been pruned
          if (err.status === 404) {
            updatedJobs[i] = {
              ...job,
              status: 'failed',
              error: 'Ingestion job expired or not found.'
            };
            changed = true;
          }
        }
      }

      if (changed) {
        // Filter out completed and failed jobs from active tracking
        const remainingJobs = updatedJobs.filter(j => j.status !== 'complete' && j.status !== 'failed');
        setActiveJobs(remainingJobs);
        localStorage.setItem('document_rag_active_jobs', JSON.stringify(remainingJobs));
        
        // Refresh the document registry to load new chunks
        await refreshDocuments();
      }
    };

    // Run immediately on active job changes
    pollJobs();

    pollingRef.current = setInterval(pollJobs, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeJobs, refreshDocuments]);

  // Handle Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Add job to local storage and active tracking list
  const handleUploadStarted = (jobId: string, filename: string) => {
    const newJob: ActiveJob = { job_id: jobId, filename, status: 'pending' };
    const updatedJobs = [...activeJobs, newJob];
    setActiveJobs(updatedJobs);
    localStorage.setItem('document_rag_active_jobs', JSON.stringify(updatedJobs));
    setToast({ type: 'success', message: `Started upload of "${filename}"` });
  };

  // Delete Document operation
  const handleDelete = async (docId: string, filename: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete this document: "${filename}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiDelete(`/documents/${docId}`);
      setToast({ type: 'success', message: `Deleted "${filename}" successfully.` });
      await refreshDocuments();
    } catch (err: any) {
      setToast({ type: 'error', message: err.detail || `Failed to delete document "${filename}".` });
    }
  };

  // Metric computations
  const completedDocsCount = documents.filter(d => d.status === 'complete').length;
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunk_count || 0), 0);
  const pendingCount = activeJobs.length;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg transition-opacity duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-50 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            Document RAG REST API Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">
              Signed in as: <strong className="text-zinc-200">{username}</strong>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="py-1.5 px-3 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-red-500"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-8">
        
        {/* Stats grid section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Total Documents
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">
              {completedDocsCount}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Indexed Chunks
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">
              {totalChunks}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Pending Ingestions
            </div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">
              {pendingCount}
            </div>
          </div>
        </section>

        {/* Documents section */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-50">Your Documents</h2>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>

          {/* Document list render */}
          {documents.length === 0 && activeJobs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4 space-y-4">
              <FileText className="w-16 h-16 text-zinc-800" />
              <h3 className="text-lg font-medium text-zinc-400">No documents yet</h3>
              <p className="text-zinc-500 text-sm max-w-sm">
                Upload a PDF or DOCX file to start indexing chunks and chatting with your documents.
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upload File
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-zinc-900/50">
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">Upload Date</th>
                    <th className="px-6 py-4">Chunks</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {/* Render active polling jobs first */}
                  {activeJobs.map((job) => (
                    <tr key={job.job_id} className="hover:bg-zinc-800/20 text-zinc-300">
                      <td className="px-6 py-4 font-medium max-w-xs truncate">{job.filename}</td>
                      <td className="px-6 py-4 text-zinc-500">—</td>
                      <td className="px-6 py-4 text-zinc-500">—</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 animate-pulse">
                          <Clock className="w-3.5 h-3.5" />
                          Processing
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">—</td>
                    </tr>
                  ))}

                  {/* Render finished indexed documents */}
                  {documents.map((doc) => (
                    <tr key={doc.document_id} className="hover:bg-zinc-800/30 text-zinc-200 transition-colors">
                      <td className="px-6 py-4 font-medium max-w-xs truncate">{doc.filename}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {doc.upload_date !== 'unknown' 
                          ? new Date(doc.upload_date).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) 
                          : 'unknown'}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-300">{doc.chunk_count}</td>
                      <td className="px-6 py-4">
                        {doc.status === 'complete' ? (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Indexed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(doc.document_id, doc.filename)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors focus:outline-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Upload Dialog modal component */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadStarted={handleUploadStarted}
      />
    </div>
  );
}
