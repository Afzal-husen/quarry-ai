"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  BookOpen,
  Clock,
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
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function CitationBadge({ index, citation }: { index: number; citation: any }) {
  const [hovered, setHovered] = useState(false);

  return (
    <span className="relative inline-block mx-0.5">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="bg-indigo-900/40 hover:bg-indigo-800 border border-indigo-700/30 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono select-none cursor-help transition-colors focus:outline-none"
      >
        [{index}]
      </button>

      {hovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 backdrop-blur-md bg-zinc-950/90 border border-zinc-800 rounded-xl p-3 shadow-2xl text-left pointer-events-none flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span className="truncate max-w-[150px]">{citation.source_filename || "source"}</span>
            <span>Page {citation.page_index !== undefined ? citation.page_index + 1 : "—"}</span>
          </span>
          <span className="text-xs text-zinc-300 font-sans italic line-clamp-4 leading-normal">
            "{citation.text}"
          </span>
        </span>
      )}
    </span>
  );
}

export default function ChatShell({ username }: ChatShellProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempSelectedDocIds, setTempSelectedDocIds] = useState<string[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isScrollAtBottom = (container: HTMLDivElement) => {
    const threshold = 100;
    return container.scrollHeight - container.clientHeight - container.scrollTop <= threshold;
  };

  const scrollToBottom = (container: HTMLDivElement) => {
    container.scrollTop = container.scrollHeight;
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    } catch (err: any) {
      console.error("Failed to load chat sessions:", err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await apiGet("/documents");
      if (res && res.items) {
        setDocuments(res.items);
      }
    } catch (err: any) {
      console.error("Failed to load documents registry:", err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
  }, [fetchSessions, fetchDocuments]);

  // Restore active session ID on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("document_rag_active_session_id");
    if (savedSessionId) {
      setActiveSessionId(savedSessionId);
    }
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

  // Load message logs and selected documents of the active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const savedDocIds = localStorage.getItem(`document_rag_session_docs_${activeSessionId}`);
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
    } catch (err) {
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
          localStorage.setItem(`document_rag_session_docs_${res.id}`, JSON.stringify(tempSelectedDocIds));
        } catch (err) {
          console.warn("Failed to save document context:", err);
        }
        setSelectedDocIds(tempSelectedDocIds);
        setActiveSessionId(res.id);
        setIsContextModalOpen(false);
        await fetchSessions();
      }
    } catch (err) {
      toast.error("Failed to create chat session.");
    }
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await apiDelete(`/sessions/${sessionToDelete.id}`);
      try {
        localStorage.removeItem(`document_rag_session_docs_${sessionToDelete.id}`);
      } catch {}
      if (activeSessionId === sessionToDelete.id) {
        setActiveSessionId(null);
      }
      await fetchSessions();
      toast.success("Chat deleted successfully.");
    } catch (err) {
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

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: currentQuestion };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      if (feedContainerRef.current) {
        scrollToBottom(feedContainerRef.current);
      }
    }, 20);

    const token = await getTokenAction();
    const isFirstMessage = messages.length === 0;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/query/stream`, {
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
      });

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
        { id: assistantMsgId, role: "assistant", content: "", metadata: { citations: [] } },
      ]);

      let assistantContent = "";
      let assistantCitations: any[] = [];

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
                    ? { ...m, content: assistantContent, metadata: { citations: assistantCitations } }
                    : m
                )
              );

              if (feedContainerRef.current && isScrollAtBottom(feedContainerRef.current)) {
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
    } catch (err: any) {
      toast.error(err.message || "Error loading model stream.");
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content: string, citations: any[] | undefined, isStreaming: boolean) => {
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
                  citation={citation}
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
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden w-full">
      {/* Collapsible Left Sidebar */}
      <div
        className={`border-r border-zinc-900 bg-zinc-950 flex flex-col justify-between transition-all duration-300 shrink-0 ${
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
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 cursor-pointer">
              <Database className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </div>
          </Link>
          <Link href="/chat">
            <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 cursor-pointer">
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

      {/* Secondary Chat History thread sidebar */}
      <aside className="w-72 bg-zinc-900/60 border-r border-zinc-900 flex flex-col h-full shrink-0">
        {/* Chat History Header */}
        <div className="p-4 border-b border-zinc-900 space-y-3 h-28 flex flex-col justify-between shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Chat History</span>
          </div>
          <Button
            onClick={handleNewChatClick}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 h-9 shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-zinc-950/20">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-xs font-medium">
              No conversation threads
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-between group cursor-pointer transition-colors ${
                  activeSessionId === s.id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span className="truncate">{s.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessionToDelete({ id: s.id, title: s.title });
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all rounded focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Q&A viewport */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950 relative min-w-0">
        {activeSessionId ? (
          <>
            {/* Header context bar */}
            <header className="border-b border-zinc-900 bg-zinc-950/40 backdrop-blur px-6 py-4 flex items-center justify-between h-16 shrink-0 sticky top-0 z-30">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Active Conversation</span>
              </h2>

              {/* Context checklist dropdown */}
              <div ref={dropdownRef} className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-900/60 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors h-8"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Context ({selectedDocIds.length} files)</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </Button>

                {isDocDropdownOpen && (
                  <Card className="absolute right-0 mt-2 w-72 bg-zinc-950 border-zinc-900 shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-zinc-900/50 bg-zinc-900/10">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Query Target Files</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                      {documents.length === 0 ? (
                        <p className="text-xs text-zinc-500 p-2 text-center">No documents found</p>
                      ) : (
                        documents.map((doc) => {
                          const isChecked = selectedDocIds.includes(doc.document_id);
                          return (
                            <button
                              key={doc.document_id}
                              onClick={() => {
                                let newSelection;
                                if (isChecked) {
                                  newSelection = selectedDocIds.filter((id) => id !== doc.document_id);
                                } else {
                                  newSelection = [...selectedDocIds, doc.document_id];
                                }
                                setSelectedDocIds(newSelection);
                                if (activeSessionId) {
                                  try {
                                    localStorage.setItem(
                                      `document_rag_session_docs_${activeSessionId}`,
                                      JSON.stringify(newSelection),
                                    );
                                  } catch (err) {
                                    console.warn("Failed to save document context:", err);
                                  }
                                }
                              }}
                              className="w-full flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-zinc-900/60 cursor-pointer select-none text-zinc-300 hover:text-zinc-100 text-left transition-colors"
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                  isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-800 bg-zinc-900"
                                }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5" />}
                              </div>
                              <span className="truncate flex-1">{doc.filename}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </header>

            {/* Message feed */}
            <div ref={feedContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <MessageSquare className="w-12 h-12 text-zinc-800" />
                  <h3 className="text-base font-medium text-zinc-400 font-sans">Welcome to your new chat</h3>
                  <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
                    Ask any question about your target documents. The AI assistant will retrieve relevant references and
                    cite them in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isLatest = idx === messages.length - 1;
                    const isStreaming = isLatest && loading && msg.role === "assistant";
                    return (
                      <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`p-4 rounded-2xl max-w-[85%] shadow-sm border ${
                            msg.role === "user"
                              ? "bg-zinc-900 border-zinc-800/80 rounded-tr-none text-zinc-100"
                              : "bg-transparent border-transparent rounded-tl-none text-zinc-200"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-1.5 text-indigo-400 mb-2 select-none">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Antigravity AI</span>
                            </div>
                          )}
                          {msg.role === "assistant"
                            ? renderMessageContent(msg.content, msg.metadata?.citations, isStreaming)
                            : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Panel */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 shrink-0">
              <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center gap-3">
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
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-150 placeholder-zinc-500 focus:outline-none focus:border-indigo-600 focus:ring-0 focus:ring-offset-0 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!question.trim() || loading || selectedDocIds.length === 0}
                  className="absolute right-2.5 p-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 w-8 h-8 flex items-center justify-center shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              {selectedDocIds.length === 0 && (
                <p className="text-center text-[10px] text-red-400 mt-2 flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Select at least one document context in the top-right header to unlock text inputs.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Welcome Viewport */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <MessageSquare className="w-16 h-16 text-zinc-800" />
            <h2 className="text-lg font-bold text-zinc-300">Start Q&A Conversational Rooms</h2>
            <p className="text-zinc-500 text-sm max-w-sm leading-normal">
              Create a new chat session, bind your target vector documents context, and stream model responses in
              real-time.
            </p>
            <Button onClick={handleNewChatClick} className="bg-indigo-600 hover:bg-indigo-500 shadow-md">
              Start Chatting
            </Button>
          </div>
        )}
      </main>

      {/* Select Ingestion Context Modal */}
      <Dialog open={isContextModalOpen} onOpenChange={(open) => !open && setIsContextModalOpen(false)}>
        <DialogContent className="border-zinc-900 bg-zinc-950 max-w-md text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-50 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              Select Ingestion Context
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-1">
              Choose the document context scope that you wish to target query retrieval models in this session.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-60 overflow-y-auto space-y-1.5 border border-zinc-850 p-2.5 rounded-lg bg-zinc-900/10">
              {documents.map((doc) => {
                const isChecked = tempSelectedDocIds.includes(doc.document_id);
                return (
                  <button
                    key={doc.document_id}
                    onClick={() => {
                      if (isChecked) {
                        setTempSelectedDocIds(tempSelectedDocIds.filter((id) => id !== doc.document_id));
                      } else {
                        setTempSelectedDocIds([...tempSelectedDocIds, doc.document_id]);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-zinc-900/40 cursor-pointer select-none text-zinc-300 hover:text-zinc-100 text-left transition-colors"
                  >
                    <span className="truncate max-w-[280px] font-medium">{doc.filename}</span>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-800 bg-zinc-900"
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
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
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
      <Dialog open={sessionToDelete !== null} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <DialogContent className="border-zinc-900 bg-zinc-950 max-w-sm text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-50">Delete Chat</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs mt-2">
              Are you sure you want to delete this chat session:{" "}
              <strong className="text-zinc-200">"{sessionToDelete?.title}"</strong>? All message history will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button
              variant="ghost"
              onClick={() => setSessionToDelete(null)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
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
