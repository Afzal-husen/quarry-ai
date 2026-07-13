"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Download, FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { getTokenAction } from "../app/actions/cookies";
import { apiGet, apiPost } from "../lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { parseMarkdown } from "../lib/markdown-parser";

interface DocumentItem {
  document_id: string;
  filename: string;
  upload_date?: string;
  chunk_count: number;
  status: string;
  can_reindex?: boolean;
  summary?: string;
  summary_status?: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

interface ChunkPayloadItem {
  page_index: number;
  text: string;
}

export default function PreviewModal({ isOpen, onClose, document }: PreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [textPages, setTextPages] = useState<Record<number, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [showSummary, setShowSummary] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [summaryStatus, setSummaryStatus] = useState<string>("pending");
  const [regenerating, setRegenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<"auto" | "guided">("auto");
  const [focusTopic, setFocusTopic] = useState<string>("");
  const [guidedSummary, setGuidedSummary] = useState<string>("");
  const [guidedStatus, setGuidedStatus] = useState<"idle" | "pending" | "completed" | "failed">("idle");
  const [generatingGuided, setGeneratingGuided] = useState(false);
  const [prevDocId, setPrevDocId] = useState<string>("");

  if ((document?.document_id || "") !== prevDocId) {
    setPrevDocId(document?.document_id || "");
    setFocusTopic("");
    setGuidedSummary("");
    setGuidedStatus("idle");
    setActiveTab("auto");
  }

  const pdfUrlRef = useRef<string | null>(null);


  // Sync initial summary states from selected document
  useEffect(() => {
    if (!isOpen || !document) {
      setSummary("");
      setSummaryStatus("pending");
      return;
    }
    setSummary(document.summary || "");
    setSummaryStatus(document.summary_status || "pending");
  }, [isOpen, document]);

  // Polling loop when status is pending
  useEffect(() => {
    if (!isOpen || !document) return;
    if (summaryStatus !== "pending") return;

    const pollSummary = async () => {
      try {
        const res = await apiGet(`/documents/${document.document_id}/summary`);
        if (res) {
          setSummary(res.summary || "");
          setSummaryStatus(res.summary_status || "pending");
        }
      } catch (err) {
        console.error("Error polling summary:", err);
      }
    };

    const interval = setInterval(pollSummary, 2500);
    return () => clearInterval(interval);
  }, [isOpen, document, summaryStatus]);

  const handleRegenerate = async () => {
    if (!document) return;
    setRegenerating(true);
    setSummaryStatus("pending");
    try {
      const res = await apiPost(`/documents/${document.document_id}/summary/regenerate`);
      if (res && res.status === "pending") {
        toast.success("Summary regeneration started");
      } else {
        toast.error("Failed to start summary regeneration");
        setSummaryStatus("failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate summary");
      setSummaryStatus("failed");
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateGuided = async () => {
    if (!document || focusTopic.trim().length < 3) return;
    setGeneratingGuided(true);
    setGuidedStatus("pending");
    try {
      const res = await apiPost(`/documents/${document.document_id}/summary/guided`, {
        focus_topic: focusTopic.trim()
      });
      if (res && res.guided_summary) {
        setGuidedSummary(res.guided_summary);
        setGuidedStatus("completed");
        toast.success("Focused summary generated");
      } else {
        toast.error("Failed to generate focused summary");
        setGuidedStatus("failed");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate focused summary";
      toast.error(errMsg);
      setGuidedStatus("failed");
    } finally {
      setGeneratingGuided(false);
    }
  };


  useEffect(() => {
    if (!isOpen || !document) {
      setTimeout(() => {
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
          pdfUrlRef.current = null;
        }
        setPdfUrl(null);
        setTextPages({});
        setError(null);
      }, 0);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      const isPdf = document.filename.toLowerCase().endsWith(".pdf");

      try {
        if (isPdf) {
          const token = await getTokenAction();
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const url = `${baseUrl}/documents/${document.document_id}/file`;
          
          const res = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (!res.ok) {
            throw new Error(`Failed to load PDF file (${res.status})`);
          }

          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          pdfUrlRef.current = objUrl;
          setPdfUrl(objUrl);
        } else {
          // Fetch DOC/DOCX chunks
          const res = await apiGet(`/documents/${document.document_id}/chunks`);
          
          // Determine if we should use parents list or chunks list
          const items = res.parents && res.parents.length > 0 ? res.parents : res.chunks;
          
          if (!items || items.length === 0) {
            throw new Error("No parsed content chunks found for this document.");
          }

          // Group by page_index
          const pages: Record<number, string[]> = {};
          items.forEach((item: ChunkPayloadItem) => {
            const page = typeof item.page_index === "number" ? item.page_index : 0;
            if (!pages[page]) {
              pages[page] = [];
            }
            if (item.text && item.text.trim()) {
              pages[page].push(item.text);
            }
          });
          
          setTextPages(pages);
        }
      } catch (err: unknown) {
        console.error("Error loading document preview:", err);
        const errMsg = err instanceof Error ? err.message : "An error occurred while loading the preview.";
        setError(errMsg);
        toast.error("Failed to load document preview");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const isPdf = document.filename.toLowerCase().endsWith(".pdf");

  const handleDownload = async () => {
    try {
      const token = await getTokenAction();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const url = `${baseUrl}/documents/${document.document_id}/file?download=true`;
      
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = objUrl;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(objUrl);
    } catch {
      toast.error("Failed to download document file");
    }
  };

  const sortedPageIndices = Object.keys(textPages)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col h-screen w-screen overflow-hidden animate-in fade-in-50 duration-200 select-none">
      {/* Header Context Bar */}
      <header className="border-b border-border h-16 shrink-0 flex items-center justify-between px-6 md:px-8 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-100 dark:bg-neutral-800 text-primary shrink-0 border border-border">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-semibold text-foreground truncate max-w-md sm:max-w-xl md:max-w-3xl">
              {document.filename}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isPdf ? "PDF Document" : "Word Document Preview"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={showSummary ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1.5 text-xs h-9 border-border rounded-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Summary</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs h-9 border-border bg-card hover:bg-accent text-foreground font-medium rounded-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Preview Viewport */}
      <div className="flex-1 overflow-hidden relative bg-muted/20 flex flex-row">
        {/* Left Pane: Document Content */}
        <div className="flex-1 h-full overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/50 z-10 select-none">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Parsing and loading preview...
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-red-500/10 text-red-500 mb-4 border border-red-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-md font-semibold text-foreground mb-2">
                Preview Unresolved
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs font-semibold h-9 rounded-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Raw Document
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="w-full h-full">
              {isPdf && pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none bg-background select-text"
                  title={document.filename}
                />
              ) : (
                <div className="w-full h-full overflow-y-auto px-4 py-8 select-text">
                  {sortedPageIndices.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground text-sm font-medium select-none">
                      No preview text contents available.
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-8 select-text">
                      {sortedPageIndices.map((pageIndex) => (
                        <div
                          key={pageIndex}
                          className="bg-card border border-border rounded-md p-8 md:p-12 min-h-[700px] relative font-serif text-card-foreground select-text"
                        >
                          <div className="absolute top-4 right-6 text-xs text-muted-foreground font-sans select-none pb-0.5">
                            Page {pageIndex + 1}
                          </div>
                          <div className="space-y-5 mt-8 leading-relaxed text-sm md:text-base select-text">
                            {textPages[pageIndex].map((para, i) => (
                              <p key={i} className="text-justify whitespace-pre-wrap select-text">
                                {para}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane: AI Summary Sidebar */}
        {showSummary && (
          <div className="w-80 md:w-96 h-full border-l border-border bg-card flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-right duration-200 select-none">
            {/* Summary Sidebar Header with Pill Toggle */}
            <div className="h-12 border-b border-border px-5 flex items-center justify-between bg-muted/20 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                AI Summary
              </span>
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-sm border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs rounded-xs font-medium transition-all ${
                    activeTab === "auto"
                      ? "bg-background shadow-xs text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  }`}
                  onClick={() => setActiveTab("auto")}
                >
                  Auto
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs rounded-xs font-medium transition-all ${
                    activeTab === "guided"
                      ? "bg-background shadow-xs text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  }`}
                  onClick={() => setActiveTab("guided")}
                >
                  Focus
                </Button>
              </div>
            </div>

            {/* Summary Sidebar Content */}
            {activeTab === "auto" ? (
              <div className="flex-1 overflow-y-auto p-5 select-text relative">
                {/* Auto summary regeneration trigger (absolute/sticky or floating next to summary content) */}
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRegenerate}
                    disabled={summaryStatus === "pending" || regenerating}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-sm bg-card/80 border border-border/50 backdrop-blur"
                    title="Regenerate Summary"
                  >
                    <RefreshCw className={`w-3 h-3 ${(summaryStatus === "pending" || regenerating) ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {summaryStatus === "completed" && summary ? (
                  <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-xs select-text space-y-4 pr-6">
                    {parseMarkdown(summary, () => null)}
                  </div>
                ) : summaryStatus === "pending" ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3 select-none">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-xs text-muted-foreground">
                      Analyzing document and generating digest...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center p-4 select-none">
                    <p className="text-xs text-muted-foreground mb-4">
                      No summary available or generation failed.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="flex items-center gap-1.5 text-xs h-9 rounded-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate Summary</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Fixed input container */}
                <div className="p-4 border-b border-border bg-muted/10 flex flex-col gap-2 shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Enter focus topic (e.g. revenue, terms)..."
                      value={focusTopic}
                      onChange={(e) => setFocusTopic(e.target.value)}
                      disabled={generatingGuided}
                      className="text-xs h-8 focus-visible:ring-1"
                    />
                    <Button
                      size="sm"
                      disabled={focusTopic.trim().length < 3 || generatingGuided}
                      onClick={handleGenerateGuided}
                      className="h-8 text-xs font-semibold px-3 shrink-0 flex items-center gap-1.5"
                    >
                      {generatingGuided ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>Generate</span>
                    </Button>
                  </div>
                </div>

                {/* Scrollable results container */}
                <div className="flex-1 overflow-y-auto p-5 select-text">
                  {guidedStatus === "completed" && guidedSummary ? (
                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-xs select-text space-y-4">
                      {parseMarkdown(guidedSummary, () => null)}
                    </div>
                  ) : guidedStatus === "pending" ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3 select-none">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <p className="text-xs text-muted-foreground">
                        Searching and generating focused digest...
                      </p>
                    </div>
                  ) : guidedStatus === "failed" ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center p-4 select-none">
                      <p className="text-xs text-muted-foreground mb-4">
                        Generation failed. Please try a different topic.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateGuided}
                        disabled={focusTopic.trim().length < 3 || generatingGuided}
                        className="flex items-center gap-1.5 text-xs h-9 rounded-sm font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4 select-none text-muted-foreground">
                      <Sparkles className="w-8 h-8 mb-3 text-muted-foreground/40" />
                      <p className="text-xs font-medium">
                        Enter a focus topic above to generate a scoped summary.
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[220px]">
                        Only matching document segments will be analyzed by the AI.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
