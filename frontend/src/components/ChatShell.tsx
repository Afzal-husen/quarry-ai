"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  BookOpen,
  AlertCircle,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  Activity,
  LogOut,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "../lib/api-client";
import { getTokenAction } from "../app/actions/cookies";
import { logoutAction } from "../app/actions/auth";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";

interface SessionItem {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    citations?: {
      source_filename: string;
      page_index: number;
      text: string;
    }[];
  } | null;
  created_at?: string;
}

interface DocumentItem {
  document_id: string;
  filename: string;
  status: string;
  chunk_count: number;
}

interface ChatShellProps {
  username: string;
}

function CitationBadge({
  index,
  onSelect,
}: {
  index: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="bg-indigo-900/40 hover:bg-indigo-800 border border-indigo-700/30 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono select-none cursor-pointer transition-colors focus:outline-none"
    >
      [{index}]
    </button>
  );
}

export default function ChatShell({ username }: ChatShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("session_id");
      if (queryId) return queryId;
      return localStorage.getItem("document_rag_active_session_id");
    }
    return null;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempSelectedDocIds, setTempSelectedDocIds] = useState<string[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<{
    source_filename: string;
    page_index: number;
    text: string;
  } | null>(null);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isScrollAtBottom = (container: HTMLDivElement) => {
    const threshold = 100;
    return (
      container.scrollHeight - container.clientHeight - container.scrollTop <=
      threshold
    );
  };

  const scrollToBottom = (container: HTMLDivElement) => {
    container.scrollTop = container.scrollHeight;
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDocDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiGet("/sessions?limit=50");
      if (res && res.items) {
        setSessions(res.items);
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await apiGet("/documents");
      if (res && res.items) {
        setDocuments(res.items);
      }
    } catch (err) {
      console.error("Failed to load documents registry:", err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const sRes = await apiGet("/sessions?limit=50");
      if (active && sRes && sRes.items) {
        setSessions(sRes.items);
      }
      const dRes = await apiGet("/documents");
      if (active && dRes && dRes.items) {
        setDocuments(dRes.items);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Save active session ID on changes
  useEffect(() => {
    if (activeSessionId) {
      try {
        localStorage.setItem("document_rag_active_session_id", activeSessionId);
      } catch (err) {
        console.warn("Failed to save active session ID:", err);
      }
    } else {
      try {
        localStorage.removeItem("document_rag_active_session_id");
      } catch (err) {
        console.warn("Failed to remove active session ID:", err);
      }
    }
  }, [activeSessionId]);

  // Sync activeSessionId with URL query parameter
  const paramSessionId = searchParams.get("session_id");
  useEffect(() => {
    if (paramSessionId && paramSessionId !== activeSessionId) {
      setActiveSessionId(paramSessionId);
    }
  }, [paramSessionId, activeSessionId]);

  // Automatically trigger New Chat context modal if new=true is in URL
  const isNewChatParam = searchParams.get("new") === "true";
  useEffect(() => {
    if (isNewChatParam) {
      handleNewChatClick();
      // Remove query parameter so the dialog doesn't re-trigger on reload
      router.replace("/chat");
    }
  }, [isNewChatParam]);

  // Load message logs and selected documents of the active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    const savedDocIds = localStorage.getItem(
      `document_rag_session_docs_${activeSessionId}`,
    );
    if (savedDocIds) {
      try {
        setSelectedDocIds(JSON.parse(savedDocIds));
      } catch (err) {
        console.warn("Failed to parse saved document context:", err);
        if (documents.length > 0) {
          setSelectedDocIds([documents[0].document_id]);
        }
      }
    } else {
      if (documents.length > 0) {
        setSelectedDocIds([documents[0].document_id]);
      } else {
        setSelectedDocIds([]);
      }
    }

    const loadMessages = async () => {
      try {
        const res = await apiGet(`/sessions/${activeSessionId}`);
        if (res && res.messages) {
          setMessages(res.messages);
          setTimeout(() => {
            if (feedContainerRef.current) {
              scrollToBottom(feedContainerRef.current);
            }
          }, 50);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, [activeSessionId, documents]);

  // Keep scrolled to bottom during generation and initial loading
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop =
        feedContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleNewChatClick = async () => {
    try {
      const res = await apiGet("/documents");
      if (!res || !res.items || res.items.length === 0) {
        toast.error("You must upload at least one document to start a chat.");
      } else {
        setDocuments(res.items);
        setTempSelectedDocIds([res.items[0].document_id]);
        setIsContextModalOpen(true);
      }
    } catch {
      toast.error("Failed to access document registry.");
    }
  };

  const handleStartChat = async () => {
    if (tempSelectedDocIds.length === 0) {
      toast.error("Please select at least one document context.");
      return;
    }

    try {
      const res = await apiPost("/sessions", { title: "New Chat" });
      if (res && res.id) {
        try {
          localStorage.setItem(
            `document_rag_session_docs_${res.id}`,
            JSON.stringify(tempSelectedDocIds),
          );
        } catch (err) {
          console.warn("Failed to save document context:", err);
        }
        setSelectedDocIds(tempSelectedDocIds);
        setActiveSessionId(res.id);
        router.push(`/chat?session_id=${res.id}`);
        setIsContextModalOpen(false);
        await fetchSessions();
      }
    } catch {
      toast.error("Failed to create chat session.");
    }
  };

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/chat?session_id=${sessionId}`);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await apiDelete(`/sessions/${sessionToDelete.id}`);
      try {
        localStorage.removeItem(
          `document_rag_session_docs_${sessionToDelete.id}`,
        );
      } catch {}
      if (activeSessionId === sessionToDelete.id) {
        setActiveSessionId(null);
        router.push("/chat");
      }
      await fetchSessions();
      toast.success("Chat deleted successfully.");
    } catch {
      toast.error("Failed to delete chat session.");
    } finally {
      setSessionToDelete(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading || !activeSessionId) return;

    if (selectedDocIds.length === 0) {
      toast.error("You must select at least one document to define context.");
      return;
    }

    const currentQuestion = question;
    setQuestion("");
    setLoading(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentQuestion,
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      if (feedContainerRef.current) {
        scrollToBottom(feedContainerRef.current);
      }
    }, 20);

    const token = await getTokenAction();
    const isFirstMessage = messages.length === 0;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/query/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            document_ids: selectedDocIds,
            question: currentQuestion,
            session_id: activeSessionId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Streaming query submission failed.");
      }

      if (!response.body) {
        throw new Error("No response readable stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          content: "",
          metadata: { citations: [] },
        },
      ]);

      let assistantContent = "";
      let assistantCitations: NonNullable<
        NonNullable<Message["metadata"]>["citations"]
      > = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;

          if (cleaned.startsWith("data: ")) {
            const dataStr = cleaned.slice(6);
            if (dataStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.citations) {
                assistantCitations = parsed.citations;
              } else if (parsed.token) {
                assistantContent += parsed.token;
              }

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: assistantContent,
                        metadata: { citations: assistantCitations },
                      }
                    : m,
                ),
              );

              if (
                feedContainerRef.current &&
                isScrollAtBottom(feedContainerRef.current)
              ) {
                scrollToBottom(feedContainerRef.current);
              }
            } catch (err) {
              console.error("Failed to parse SSE data block:", cleaned, err);
            }
          }
        }
      }

      if (isFirstMessage) {
        await fetchSessions();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Error loading model stream.");
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (
    content: string,
    citations:
      | NonNullable<NonNullable<Message["metadata"]>["citations"]>
      | undefined,
    isStreaming: boolean,
  ) => {
    if (!citations || citations.length === 0) {
      return (
        <span className="whitespace-pre-wrap leading-relaxed text-sm">
          {content}
          {isStreaming && (
            <span className="inline-block w-2.5 h-4 ml-1 bg-indigo-400 animate-pulse select-none align-middle" />
          )}
        </span>
      );
    }

    const parts = content.split(/(\[\d+\])/g);
    return (
      <span className="whitespace-pre-wrap leading-relaxed text-sm">
        {parts.map((part, index) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            const citationIdx = parseInt(match[1], 10) - 1;
            const citation = citations[citationIdx];
            if (citation) {
              return (
                <CitationBadge
                  key={index}
                  index={citationIdx + 1}
                  onSelect={() =>
                    setSelectedCitation({
                      source_filename: citation.source_filename,
                      page_index: citation.page_index,
                      text: citation.text,
                    })
                  }
                />
              );
            }
          }
          return part;
        })}
        {isStreaming && (
          <span className="inline-block w-2.5 h-4 ml-1 bg-indigo-400 animate-pulse select-none align-middle" />
        )}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden w-full">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        username={username}
        currentPath="/chat"
        activeSessionId={activeSessionId}
        sessions={sessions}
        onSelectSession={selectSession}
        onCreateSession={handleNewChatClick}
        onDeleteSession={setSessionToDelete}
      />

      {/* Main Q&A viewport */}
      <main className="flex-1 flex flex-col h-full bg-background relative min-w-0">
        {activeSessionId ? (
          <>
            {/* Header context bar */}
            <header className="border-b border-border bg-background/40 backdrop-blur px-6 py-4 flex items-center justify-between h-16 shrink-0 sticky top-0 z-30">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Active Conversation</span>
              </h2>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                {/* Context checklist dropdown */}
                <div ref={dropdownRef} className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                    className="bg-muted border border-border hover:bg-muted/65 rounded-lg text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors h-8"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Context ({selectedDocIds.length} files)</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>

                  {isDocDropdownOpen && (
                    <Card className="absolute right-0 mt-2 w-72 bg-card border-border shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-border bg-muted/40">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          Query Target Files
                        </p>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                        {documents.length === 0 ? (
                          <p className="text-xs text-muted-foreground p-2 text-center">
                            No documents found
                          </p>
                        ) : (
                          documents.map((doc) => {
                            const isChecked = selectedDocIds.includes(
                              doc.document_id,
                            );
                            return (
                              <button
                                key={doc.document_id}
                                onClick={() => {
                                  let newSelection;
                                  if (isChecked) {
                                    newSelection = selectedDocIds.filter(
                                      (id) => id !== doc.document_id,
                                    );
                                  } else {
                                    newSelection = [
                                      ...selectedDocIds,
                                      doc.document_id,
                                    ];
                                  }
                                  setSelectedDocIds(newSelection);
                                  if (activeSessionId) {
                                    try {
                                      localStorage.setItem(
                                        `document_rag_session_docs_${activeSessionId}`,
                                        JSON.stringify(newSelection),
                                      );
                                    } catch (err) {
                                      console.warn(
                                        "Failed to save document context:",
                                        err,
                                      );
                                    }
                                  }
                                }}
                                className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-accent cursor-pointer select-none text-muted-foreground hover:text-foreground text-left transition-colors"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                    isChecked
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "border-border bg-muted"
                                  }`}
                                >
                                  {isChecked && (
                                    <Check className="w-2.5 h-2.5" />
                                  )}
                                </div>
                                <span className="truncate flex-1">
                                  {doc.filename}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </header>

            {/* Message feed */}
            <div
              ref={feedContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth min-h-0"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
                  <h3 className="text-base font-medium text-muted-foreground font-sans">
                    Welcome to your new chat
                  </h3>
                  <p className="text-muted-foreground text-xs max-w-sm leading-relaxed">
                    Ask any question about your target documents. The AI
                    assistant will retrieve relevant references and cite them in
                    real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isLatest = idx === messages.length - 1;
                    const isStreaming =
                      isLatest && loading && msg.role === "assistant";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-4 rounded-2xl shadow-sm border ${
                            msg.role === "user"
                              ? "bg-muted border border-border rounded-tr-none text-foreground"
                              : "bg-transparent border-transparent rounded-tl-none text-foreground"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-1.5 text-indigo-400 mb-2 select-none">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Antigravity AI
                              </span>
                            </div>
                          )}
                          {msg.role === "assistant" ? (
                            renderMessageContent(
                              msg.content,
                              msg.metadata?.citations,
                              isStreaming,
                            )
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Panel */}
            <div className="p-4 border-t border-border bg-background/40 shrink-0">
              <form
                onSubmit={handleSend}
                className="max-w-3xl mx-auto relative flex items-center gap-3"
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading || selectedDocIds.length === 0}
                  placeholder={
                    selectedDocIds.length === 0
                      ? "Select at least one document target..."
                      : "Ask a question about your documents..."
                  }
                  className="flex-1 bg-muted border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus-visible:border-indigo-600 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={
                    !question.trim() || loading || selectedDocIds.length === 0
                  }
                  className="absolute right-2.5 p-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-muted disabled:text-muted-foreground w-8 h-8 flex items-center justify-center shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              {selectedDocIds.length === 0 && (
                <p className="text-center text-[10px] text-red-400 mt-2 flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Select at least one document context in the top-right header
                  to unlock text inputs.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Welcome Viewport */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <MessageSquare className="w-16 h-16 text-muted-foreground/30" />
            <h2 className="text-lg font-bold text-foreground">
              Start Q&A Conversational Rooms
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-normal">
              Create a new chat session, bind your target vector documents
              context, and stream model responses in real-time.
            </p>
            <Button
              onClick={handleNewChatClick}
              className="bg-indigo-600 hover:bg-indigo-500 shadow-md"
            >
              Start Chatting
            </Button>
          </div>
        )}
      </main>

      {/* Right sidebar: Citations reference panel */}
      <aside
        className={`border-l border-border bg-card flex flex-col transition-all duration-300 ease-in-out shrink-0 h-full ${
          selectedCitation ? "w-80" : "w-0 overflow-hidden border-l-transparent"
        }`}
      >
        {selectedCitation && (
          <div className="flex flex-col h-full w-80">
            <div className="p-4 border-b border-border flex items-center justify-between h-16 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Source Reference
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCitation(null)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Document Name
                </span>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <p
                    className="text-xs text-foreground font-medium truncate"
                    title={selectedCitation.source_filename}
                  >
                    {selectedCitation.source_filename}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Reference Location
                </span>
                <div className="p-2 rounded-lg bg-muted border border-border">
                  <p className="text-xs text-foreground font-medium">
                    Page{" "}
                    {selectedCitation.page_index !== undefined
                      ? selectedCitation.page_index + 1
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Matched Text Segment
                </span>
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-foreground font-sans leading-relaxed whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
                  &quot;{selectedCitation.text}&quot;
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Select Ingestion Context Modal */}
      <Dialog
        open={isContextModalOpen}
        onOpenChange={(open) => !open && setIsContextModalOpen(false)}
      >
        <DialogContent className="border-border bg-card max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Select Ingestion Context
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              Choose the document context scope that you wish to target query
              retrieval models in this session.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-60 overflow-y-auto space-y-1.5 border border-border p-2.5 rounded-lg bg-muted/40">
              {documents.map((doc) => {
                const isChecked = tempSelectedDocIds.includes(doc.document_id);
                return (
                  <button
                    key={doc.document_id}
                    onClick={() => {
                      if (isChecked) {
                        setTempSelectedDocIds(
                          tempSelectedDocIds.filter(
                            (id) => id !== doc.document_id,
                          ),
                        );
                      } else {
                        setTempSelectedDocIds([
                          ...tempSelectedDocIds,
                          doc.document_id,
                        ]);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-accent cursor-pointer select-none text-muted-foreground hover:text-foreground text-left transition-colors"
                  >
                    <span className="truncate max-w-[280px] font-medium">
                      {doc.filename}
                    </span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-border bg-muted"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsContextModalOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartChat}
              disabled={tempSelectedDocIds.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Thread Confirmation Dialog */}
      <Dialog
        open={sessionToDelete !== null}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <DialogContent className="border-border bg-card max-w-sm text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Chat
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-2">
              Are you sure you want to delete this chat session:{" "}
              <strong className="text-foreground">
                &quot;{sessionToDelete?.title}&quot;
              </strong>
              ? All message history will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setSessionToDelete(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSession}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
