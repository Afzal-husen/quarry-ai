"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, FileText, Trash2, Clock, Menu } from "lucide-react";
import { apiGet, apiDelete, apiPost } from "../lib/api-client";
import { ThemeToggle } from "./ThemeToggle";
import Sidebar from "./Sidebar";
import PreviewModal from "./PreviewModal";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DocumentItem {
  document_id: string;
  filename: string;
  upload_date: string;
  chunk_count: number;
  status: string;
  can_reindex: boolean;
  file_size?: number;
  summary?: string;
  summary_status?: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{
    id: string;
    filename: string;
  } | null>(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
              toast.error(
                `Failed to process "${job.filename}": ${res.error || "Unknown error"}`,
              );
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
    pollingRef.current = setInterval(pollJobs, 12000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeJobs, refreshDocuments]);

  // Add job to local storage and active tracking list
  const handleUploadStarted = useCallback(
    (jobId: string, filename: string) => {
      const newJob: ActiveJob = { job_id: jobId, filename, status: "pending" };
      const updatedJobs = [...activeJobs, newJob];
      setActiveJobs(updatedJobs);
      try {
        localStorage.setItem(
          "document_rag_active_jobs",
          JSON.stringify(updatedJobs),
        );
      } catch (err) {
        console.warn(
          "LocalStorage writing is blocked by browser policies.",
          err,
        );
      }
    },
    [activeJobs],
  );

  // Drag-and-drop window listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (
        e.dataTransfer &&
        e.dataTransfer.items &&
        e.dataTransfer.items.length > 0
      ) {
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
        const isAllowed =
          filename.endsWith(".pdf") || filename.endsWith(".docx");

        if (!isAllowed) {
          toast.error(
            "Invalid file format. Only PDF and DOCX files are allowed.",
          );
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
            toast.success(`Upload started for "${droppedFile.name}"`, {
              id: toastId,
            });
            handleUploadStarted(response.job_id, droppedFile.name);
          } else {
            toast.error("Failed to initiate document ingestion.", {
              id: toastId,
            });
          }
        } catch (err: unknown) {
          const apiError = err as { detail?: string };
          toast.error(
            apiError.detail ||
              "An unexpected error occurred during file upload.",
            { id: toastId },
          );
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
      toast.error(
        apiError.detail ||
          `Failed to delete document "${docToDelete.filename}".`,
      );
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
        toast.error(
          "Invalid file format. Only PDF and DOCX files are allowed.",
        );
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
        toast.success(`Upload started for "${uploadFile.name}"`, {
          id: toastId,
        });
        handleUploadStarted(response.job_id, uploadFile.name);
        setUploadFile(null);
        setIsUploadOpen(false);
      } else {
        toast.error("Failed to initiate document ingestion.", { id: toastId });
      }
    } catch (err: unknown) {
      const apiError = err as { detail?: string };
      toast.error(
        apiError.detail || "An unexpected error occurred during file upload.",
        { id: toastId },
      );
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
    <div className="flex min-h-screen bg-background text-foreground font-sans w-full">
      {/* Page-wide Drag target overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-background/90 flex flex-col items-center justify-center border-2 border-dashed border-primary m-6 rounded-md pointer-events-none select-none animate-in fade-in-50 duration-200">
          <Upload className="w-16 h-16 text-primary animate-bounce mb-4" />
          <h3 className="text-2xl font-bold text-foreground">
            Drop files here to upload
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            PDF and DOCX only (Max 50MB)
          </p>
        </div>
      )}

      {/* Collapsible Left Sidebar */}
      <Sidebar
        username={username}
        currentPath="/"
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto">
        <header className="border-b border-border h-16 flex items-center justify-between px-6 md:px-8 bg-background/40 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-sm"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold tracking-tight text-foreground truncate">
              Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium text-xs h-9 flex items-center gap-1.5 rounded-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </Button>
          </div>
        </header>

        <main className="p-6 md:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-border bg-card rounded-md shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-neutral-500 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                  Total Documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-extrabold tracking-tight text-foreground">
                  {completedDocsCount}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card rounded-md shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-neutral-500 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
                  Indexed Chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-extrabold tracking-tight text-foreground">
                  {totalChunks}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card rounded-md shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-neutral-500 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700"></span>
                  Pending Ingestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-extrabold tracking-tight text-foreground">
                  {pendingCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Catalog Listing */}
          <Card className="border-border bg-card overflow-hidden rounded-md shadow-none">
            <CardHeader className="border-b border-border/50 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-extrabold tracking-tight text-foreground font-sans">
                  Your Documents
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs mt-1">
                  Manage and monitor indexed ingestion jobs
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {documents.length === 0 && activeJobs.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto space-y-6">
                  <div className="h-12 w-12 rounded-sm bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                      Document index is empty.
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Drag and drop a PDF or DOCX file anywhere onto the page,
                      or browse your local files to start indexing chunk nodes.
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium text-sm h-10 px-6 rounded-sm shadow-none"
                  >
                    Browse Local Files
                  </Button>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Polling Jobs */}
                    {activeJobs.map((job) => (
                      <div
                        key={job.job_id}
                        className="bg-card border border-border border-dashed rounded-md p-5 transition-colors duration-200 relative group flex flex-col justify-between h-48 select-none animate-pulse"
                      >
                        <div className="flex items-start justify-between min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 shrink-0 border border-border">
                            <Clock className="w-5 h-5 animate-spin" />
                          </div>
                          <Badge className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border text-xs py-0.5 rounded-sm">
                            Processing
                          </Badge>
                        </div>
                        <div className="min-w-0 mt-4 flex-1">
                          <h4
                            className="text-sm font-semibold text-foreground truncate"
                            title={job.filename}
                          >
                            {job.filename}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Parsing document chunks...
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground select-none">
                          <span>Size: --</span>
                          <span>Uploaded: --</span>
                        </div>
                      </div>
                    ))}

                    {/* Documents */}
                    {documents.map((doc) => {
                      const isPdf = doc.filename.toLowerCase().endsWith(".pdf");

                      // Format bytes to human readable file size
                      const formatSize = (bytes?: number) => {
                        if (bytes === undefined || bytes === null)
                          return "unknown";
                        if (bytes === 0) return "0 B";
                        const k = 1024;
                        const sizes = ["B", "KB", "MB", "GB"];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return (
                          parseFloat((bytes / Math.pow(k, i)).toFixed(1)) +
                          " " +
                          sizes[i]
                        );
                      };

                      return (
                        <div
                          key={doc.document_id}
                          onClick={() => {
                            setActivePreviewDoc(doc);
                            setIsPreviewOpen(true);
                          }}
                          className="bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border border-border hover:border-primary rounded-md p-5 transition-colors duration-200 relative group flex flex-col justify-between h-48 cursor-pointer select-none"
                        >
                          <div className="flex items-start justify-between min-w-0 w-full">
                            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-primary shrink-0 border border-border">
                              <FileText className="w-5 h-5" />
                            </div>

                            <div className="flex items-center gap-2">
                              {doc.status === "complete" ? (
                                <Badge className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border text-[10px] py-0.5 rounded-sm">
                                  Complete
                                </Badge>
                              ) : (
                                <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/10 border border-red-500/20 text-[10px] py-0.5 rounded-sm">
                                  Failed
                                </Badge>
                              )}

                              {doc.summary_status === "completed" && (
                                <Badge className="bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/10 border border-indigo-500/20 text-[10px] py-0.5 rounded-sm">
                                  Digest
                                </Badge>
                              )}
                              {doc.summary_status === "pending" && (
                                <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 text-[10px] py-0.5 rounded-sm animate-pulse">
                                  Digest pending
                                </Badge>
                              )}
                              {doc.summary_status === "failed" && (
                                <Badge className="bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/10 border border-neutral-500/20 text-[10px] py-0.5 rounded-sm">
                                  No Digest
                                </Badge>
                              )}

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDocToDelete({
                                    id: doc.document_id,
                                    filename: doc.filename,
                                  });
                                }}
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-sm transition-all shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="min-w-0 mt-3 flex-1 overflow-hidden">
                            <h4
                              className="text-sm font-bold tracking-tight text-foreground truncate"
                              title={doc.filename}
                            >
                              {doc.filename}
                            </h4>
                            <p
                              className="text-xs text-muted-foreground mt-1 line-clamp-2 select-text"
                              title={doc.summary}
                            >
                              {doc.summary
                                ? doc.summary.replace(/[#*`\-]/g, "").trim()
                                : isPdf
                                  ? "PDF Document"
                                  : "Word Document"}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground select-none">
                            <span>Size: {formatSize(doc.file_size)}</span>
                            <span>
                              Uploaded:{" "}
                              {doc.upload_date !== "unknown"
                                ? new Date(doc.upload_date).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "unknown"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setActivePreviewDoc(null);
        }}
        document={activePreviewDoc}
      />

      {/* Manual Upload Dialog */}
      <Dialog
        open={isUploadOpen}
        onOpenChange={(open) =>
          !open && !isUploading && (setIsUploadOpen(false), setUploadFile(null))
        }
      >
        <DialogContent className="border-border bg-card max-w-md text-foreground rounded-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
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
              className="border-2 border-dashed border-border bg-muted/20 hover:border-primary rounded-md p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              {uploadFile ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 text-primary mx-auto animate-pulse" />
                  <p className="text-sm font-medium text-foreground truncate max-w-xs">
                    {uploadFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-foreground">
                    Click to browse your files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF or DOCX only (Max 50MB)
                  </p>
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
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleManualUpload}
              disabled={!uploadFile || isUploading}
              className="bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium rounded-sm"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <Dialog
        open={docToDelete !== null}
        onOpenChange={(open) => !open && setDocToDelete(null)}
      >
        <DialogContent className="border-border bg-card max-w-sm text-foreground rounded-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Document
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-2">
              Are you sure you want to delete this document:{" "}
              <strong className="text-foreground">
                &quot;{docToDelete?.filename}&quot;
              </strong>
              ? This action cannot be undone and will permanently delete the
              parsed chunks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setDocToDelete(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="rounded-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
