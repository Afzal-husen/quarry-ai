"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "../lib/api-client";
import { logoutAction } from "../app/actions/auth";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function DashboardShell({
  initialDocuments,
  username,
}: DashboardShellProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>(() => {
    if (typeof window !== "undefined") {
      const savedJobs = localStorage.getItem("document_rag_active_jobs");
      if (savedJobs) {
        try {
          return JSON.parse(savedJobs);
        } catch {
          localStorage.removeItem("document_rag_active_jobs");
        }
      }
    }
    return [];
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string; filename: string } | null>(null);

  const dragCounter = useRef(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch updated document list
  const refreshDocuments = useCallback(async () => {
    try {
      const response = await apiGet("/documents");
      if (response && response.items) {
        setDocuments(response.items);
      }
    } catch (err) {
      console.error("Failed to refresh documents:", err);
    }
  }, []);

  // Polling loop for active uploads status
  useEffect(() => {
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
        if (job.status === "complete" || job.status === "failed") continue;

        try {
          const res = await apiGet(`/upload/${job.job_id}/status`);
          if (res && res.status !== job.status) {
            updatedJobs[i] = {
              ...job,
              status: res.status,
              error: res.error,
            };
            changed = true;

            if (res.status === "complete") {
              toast.success(`"${job.filename}" indexed successfully!`);
            } else if (res.status === "failed") {
              toast.error(`Failed to process "${job.filename}": ${res.error || "Unknown error"}`);
            }
          }
        } catch (err: unknown) {
          const apiError = err as { status?: number };
          if (apiError.status === 404) {
            updatedJobs[i] = {
              ...job,
              status: "failed",
              error: "Ingestion job expired or not found.",
            };
            changed = true;
          }
        }
      }

      if (changed) {
        const remainingJobs = updatedJobs.filter(
          (j) => j.status !== "complete" && j.status !== "failed",
        );
        setActiveJobs(remainingJobs);
        try {
          localStorage.setItem(
            "document_rag_active_jobs",
            JSON.stringify(remainingJobs),
          );
        } catch (err) {
          console.warn(
            "LocalStorage writing is blocked by browser policies.",
            err,
          );
        }

        await refreshDocuments();
      }
    };

    pollJobs();
    pollingRef.current = setInterval(pollJobs, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeJobs, refreshDocuments]);

  // Add job to local storage and active tracking list
  const handleUploadStarted = useCallback((jobId: string, filename: string) => {
    const newJob: ActiveJob = { job_id: jobId, filename, status: "pending" };
    const updatedJobs = [...activeJobs, newJob];
    setActiveJobs(updatedJobs);
    try {
      localStorage.setItem(
        "document_rag_active_jobs",
        JSON.stringify(updatedJobs),
      );
    } catch (err) {
      console.warn("LocalStorage writing is blocked by browser policies.", err);
    }
  }, [activeJobs]);

  // Drag-and-drop window listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];
        const filename = droppedFile.name.toLowerCase();
        const isAllowed = filename.endsWith(".pdf") || filename.endsWith(".docx");

        if (!isAllowed) {
          toast.error("Invalid file format. Only PDF and DOCX files are allowed.");
          return;
        }

        if (droppedFile.size > 50 * 1024 * 1024) {
          toast.error("File exceeds maximum size limit of 50 MB.");
          return;
        }

        const formData = new FormData();
        formData.append("file", droppedFile);

        const toastId = toast.loading(`Uploading "${droppedFile.name}"...`);

        try {
          const response = await apiPost("/upload", formData);
          if (response && response.job_id) {
            toast.success(`Upload started for "${droppedFile.name}"`, { id: toastId });
            handleUploadStarted(response.job_id, droppedFile.name);
          } else {
            toast.error("Failed to initiate document ingestion.", { id: toastId });
          }
        } catch (err: unknown) {
          const apiError = err as { detail?: string };
          toast.error(apiError.detail || "An unexpected error occurred during file upload.", { id: toastId });
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [activeJobs, handleUploadStarted]);

  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      await apiDelete(`/documents/${docToDelete.id}`);
      toast.success(`Deleted "${docToDelete.filename}" successfully.`);
      await refreshDocuments();
    } catch (err: unknown) {
      const apiError = err as { detail?: string };
      toast.error(apiError.detail || `Failed to delete document "${docToDelete.filename}".`);
    } finally {
      setDocToDelete(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const filename = selectedFile.name.toLowerCase();
      const isAllowed = filename.endsWith(".pdf") || filename.endsWith(".docx");
      if (!isAllowed) {
        toast.error("Invalid file format. Only PDF and DOCX files are allowed.");
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File exceeds maximum size limit of 50 MB.");
        return;
      }
      setUploadFile(selectedFile);
    }
  };

  const handleManualUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    const toastId = toast.loading(`Uploading "${uploadFile.name}"...`);

    try {
      const response = await apiPost("/upload", formData);
      if (response && response.job_id) {
        toast.success(`Upload started for "${uploadFile.name}"`, { id: toastId });
        handleUploadStarted(response.job_id, uploadFile.name);
        setUploadFile(null);
        setIsUploadOpen(false);
      } else {
        toast.error("Failed to initiate document ingestion.", { id: toastId });
      }
    } catch (err: unknown) {
      const apiError = err as { detail?: string };
      toast.error(apiError.detail || "An unexpected error occurred during file upload.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const completedDocsCount = documents.filter(
    (d) => d.status === "complete",
  ).length;
  const totalChunks = documents.reduce(
    (sum, doc) => sum + (doc.chunk_count || 0),
    0,
  );
  const pendingCount = activeJobs.length;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans w-full">
      {/* Page-wide Drag target overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-500/50 m-6 rounded-2xl pointer-events-none select-none animate-in fade-in-50 duration-200">
          <Upload className="w-16 h-16 text-indigo-400 animate-bounce mb-4" />
          <h3 className="text-2xl font-bold text-zinc-50">Drop files here to upload</h3>
          <p className="text-sm text-zinc-400 mt-2">PDF and DOCX only (Max 50MB)</p>
        </div>
      )}

      {/* Collapsible Left Sidebar */}
      <div
        className={`border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-900 h-16">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 text-md font-semibold tracking-tight text-zinc-50 select-none">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>Antigravity RAG</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <FileSpreadsheet className="w-5 h-5 text-indigo-500 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-zinc-400 hover:text-zinc-100 h-8 w-8 ml-auto"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 cursor-pointer">
              <Database className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </div>
          </Link>
          <Link href="/chat">
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 transition-colors cursor-pointer">
              <Activity className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Chat Feed</span>}
            </div>
          </Link>
        </div>

        {/* Sidebar Profile Card */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/40">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase shrink-0">
                  {username.slice(0, 2)}
                </div>
                <div className="truncate">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">User</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{username}</p>
                </div>
              </div>
              <form action={logoutAction} className="w-full">
                <Button type="submit" variant="destructive" size="sm" className="w-full flex items-center justify-center gap-1.5 h-8">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
                {username.slice(0, 2)}
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">
        <header className="border-b border-zinc-900 h-16 flex items-center justify-between px-6 md:px-8 bg-zinc-950/40 backdrop-blur sticky top-0 z-30">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
            Dashboard
          </h2>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-9 flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </Button>
        </header>

        <main className="p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-zinc-900 bg-zinc-950/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Total Documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-zinc-50">{completedDocsCount}</div>
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Indexed Chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-zinc-50">{totalChunks}</div>
              </CardContent>
            </Card>

            <Card className="border-zinc-900 bg-zinc-950/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Pending Ingestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-zinc-50">{pendingCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Catalog Listing */}
          <Card className="border-zinc-900 bg-zinc-950/50 overflow-hidden shadow-md">
            <CardHeader className="border-b border-zinc-900/50 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-zinc-50 font-sans">Your Documents</CardTitle>
                <CardDescription className="text-zinc-400 text-xs mt-1">
                  Manage and monitor indexed ingestion jobs
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {documents.length === 0 && activeJobs.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center px-4 space-y-4">
                  <FileText className="w-16 h-16 text-zinc-800" />
                  <h3 className="text-lg font-medium text-zinc-400">No documents yet</h3>
                  <p className="text-zinc-500 text-sm max-w-sm">
                    Drag and drop a PDF or DOCX file anywhere onto the page to start indexing.
                  </p>
                  <Button onClick={() => setIsUploadOpen(true)} className="bg-indigo-600 hover:bg-indigo-500">
                    Browse File
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-zinc-900/10 border-b border-zinc-900">
                      <TableRow className="border-zinc-900 hover:bg-transparent">
                        <TableHead className="text-zinc-400 px-6 h-11">Filename</TableHead>
                        <TableHead className="text-zinc-400 px-6 h-11">Upload Date</TableHead>
                        <TableHead className="text-zinc-400 px-6 h-11">Chunks</TableHead>
                        <TableHead className="text-zinc-400 px-6 h-11">Status</TableHead>
                        <TableHead className="text-zinc-400 px-6 h-11 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-900/40">
                      {/* Active Polling Jobs */}
                      {activeJobs.map((job) => (
                        <TableRow key={job.job_id} className="border-zinc-900 hover:bg-zinc-900/10 text-zinc-300">
                          <TableCell className="px-6 py-3.5 font-medium max-w-xs truncate">{job.filename}</TableCell>
                          <TableCell className="px-6 py-3.5 text-zinc-500">—</TableCell>
                          <TableCell className="px-6 py-3.5 text-zinc-500">—</TableCell>
                          <TableCell className="px-6 py-3.5">
                            <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              Processing
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-right text-zinc-500">—</TableCell>
                        </TableRow>
                      ))}

                      {/* Documents */}
                      {documents.map((doc) => (
                        <TableRow key={doc.document_id} className="border-zinc-900 hover:bg-zinc-900/10 text-zinc-200 transition-colors">
                          <TableCell className="px-6 py-3.5 font-medium max-w-xs truncate">{doc.filename}</TableCell>
                          <TableCell className="px-6 py-3.5 text-zinc-400">
                            {doc.upload_date !== "unknown"
                              ? new Date(doc.upload_date).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "unknown"}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 font-mono text-zinc-300">{doc.chunk_count}</TableCell>
                          <TableCell className="px-6 py-3.5">
                            {doc.status === "complete" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                                Indexed
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/10 border border-red-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDocToDelete({ id: doc.document_id, filename: doc.filename })}
                              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Manual Upload Dialog */}
      <Dialog
        open={isUploadOpen}
        onOpenChange={(open) => !open && !isUploading && (setIsUploadOpen(false), setUploadFile(null))}
      >
        <DialogContent className="border-zinc-900 bg-zinc-950 max-w-md text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-1">
              Select a PDF or DOCX file to start indexing chunks and querying.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              {uploadFile ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                  <p className="text-sm font-medium text-zinc-200 truncate max-w-xs">{uploadFile.name}</p>
                  <p className="text-xs text-zinc-500">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-zinc-500 mx-auto" />
                  <p className="text-sm text-zinc-300">Click to browse your files</p>
                  <p className="text-xs text-zinc-500">PDF or DOCX only (Max 50MB)</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end mt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadOpen(false);
                setUploadFile(null);
              }}
              disabled={isUploading}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualUpload}
              disabled={!uploadFile || isUploading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/10"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <Dialog open={docToDelete !== null} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <DialogContent className="border-zinc-900 bg-zinc-950 max-w-sm text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-50">Delete Document</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-2">
              Are you sure you want to delete this document:{" "}
              <strong className="text-zinc-200">&quot;{docToDelete?.filename}&quot;</strong>? This action cannot be undone and will permanently delete the parsed chunks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setDocToDelete(null)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
