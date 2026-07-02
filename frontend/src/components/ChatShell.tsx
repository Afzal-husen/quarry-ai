"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  FileText,
  BookOpen,
  AlertCircle,
  Sparkles,
  Check,
  ChevronRight,
  Plus,
  Eye,
  X,
  Menu,
} from "lucide-react";
import { apiGet, apiDelete, apiPost } from "../lib/api-client";
import { getTokenAction } from "../app/actions/cookies";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import PreviewModal from "./PreviewModal";
import { parseMarkdown } from "../lib/markdown-parser";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  upload_date?: string;
  can_reindex?: boolean;
}

interface ChatShellProps {
  username: string;
  initialActiveSessionId?: string | null;
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
      className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded-sm text-xs font-mono select-none cursor-pointer transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    >
      [{index}]
    </button>
  );
}

export default function ChatShell({
  username,
  initialActiveSessionId,
}: ChatShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (initialActiveSessionId !== undefined) return initialActiveSessionId;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("session_id");
      if (queryId) return queryId;
      return localStorage.getItem("document_rag_active_session_id");
    }
    return null;
  });

  useEffect(() => {
    if (initialActiveSessionId !== undefined) {
      setActiveSessionId(initialActiveSessionId);
    }
  }, [initialActiveSessionId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempSelectedDocIds, setTempSelectedDocIds] = useState<string[]>([]);
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<{
    source_filename: string;
    page_index: number;
    text: string;
  } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Load message logs and selected documents of the active session
  useEffect(() => {
    if (!activeSessionId) {
      setTimeout(() => {
        setMessages((prev) => (prev.length > 0 ? [] : prev));
      }, 0);
      return;
    }

    const savedDocIds = localStorage.getItem(
      `document_rag_session_docs_${activeSessionId}`,
    );
    setTimeout(() => {
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
    }, 0);

    const loadMessages = async () => {
      if (!activeSessionId) {
        setMessages([]);
        return;
      }
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

  // Focus the chat input box automatically on mount, session switch, or completion
  useEffect(() => {
    if (!loading && activeSessionId && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeSessionId, loading]);

  const handleNewChatClick = useCallback(async () => {
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
  }, []);

  const handleOpenContextModal = async () => {
    try {
      const res = await apiGet("/documents");
      if (!res || !res.items || res.items.length === 0) {
        toast.error("You must upload at least one document to select context.");
      } else {
        setDocuments(res.items);
        setTempSelectedDocIds(selectedDocIds.length > 0 ? selectedDocIds : [res.items[0].document_id]);
        setIsContextModalOpen(true);
      }
    } catch {
      toast.error("Failed to access document registry.");
    }
  };

  // Sync activeSessionId with URL query parameter
  const paramSessionId = searchParams.get("session_id");
  useEffect(() => {
    if (paramSessionId && paramSessionId !== activeSessionId) {
      setTimeout(() => {
        setActiveSessionId(paramSessionId);
      }, 0);
    }
  }, [paramSessionId, activeSessionId]);

  // Automatically trigger New Chat context modal if new=true is in URL
  const isNewChatParam = searchParams.get("new") === "true";
  useEffect(() => {
    if (isNewChatParam) {
      setTimeout(() => {
        handleNewChatClick();
        router.replace("/chat");
      }, 0);
    }
  }, [isNewChatParam, handleNewChatClick, router]);

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
        router.push(`/chat/${res.id}`);
        setIsContextModalOpen(false);
        await fetchSessions();
      }
    } catch {
      toast.error("Failed to create chat session.");
    }
  };

  const handleSaveContext = async () => {
    if (tempSelectedDocIds.length === 0) {
      toast.error("Please select at least one document context.");
      return;
    }

    if (activeSessionId) {
      try {
        localStorage.setItem(
          `document_rag_session_docs_${activeSessionId}`,
          JSON.stringify(tempSelectedDocIds),
        );
      } catch (err) {
        console.warn("Failed to save document context:", err);
      }
      setSelectedDocIds(tempSelectedDocIds);
      setIsContextModalOpen(false);
    } else {
      await handleStartChat();
    }
  };

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/chat/${sessionId}`);
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
    const handleRenderCitation = (citationIdx: number) => {
      const actualIdx = citationIdx - 1;
      const citation = citations ? citations[actualIdx] : undefined;
      if (citation) {
        return (
          <CitationBadge
            index={citationIdx}
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
      return `[${citationIdx}]`;
    };

    return (
      <div className="space-y-1.5 break-words">
        {parseMarkdown(content, handleRenderCitation)}
        {isStreaming && (
          <span className="inline-block w-2.5 h-4 ml-1 bg-primary animate-pulse select-none align-middle" />
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden w-full">
      <Sidebar
        username={username}
        currentPath="/chat"
        activeSessionId={activeSessionId}
        sessions={sessions}
        onSelectSession={selectSession}
        onCreateSession={handleNewChatClick}
        onDeleteSession={setSessionToDelete}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Q&A viewport */}
      <main className="flex-1 flex flex-col h-full bg-background relative min-w-0">
        {activeSessionId ? (
          <>
            {/* Header context bar */}
            <header className="border-b border-border bg-background/40 backdrop-blur px-6 py-4 flex items-center justify-between h-16 shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-2.5 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-sm"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h2 className="text-md font-bold tracking-tight text-foreground flex items-center gap-2 truncate">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>Active Conversation</span>
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />

              </div>
            </header>

            {/* Message feed */}
            <div
              ref={feedContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth min-h-0"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <div className="h-12 w-12 rounded-sm bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold tracking-tight text-foreground animate-pulse">
                      Active Workspace Ready
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Ask any question about your referenced documents to begin context retrieval.
                    </p>
                  </div>
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
                          className={`p-4 rounded-md border ${
                            msg.role === "user"
                              ? "bg-muted border-border rounded-tr-none text-foreground"
                              : "bg-transparent border-transparent rounded-tl-none text-foreground"
                          }`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex items-center gap-1.5 text-foreground mb-2 select-none">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-xs font-semibold tracking-tight">
                                Quarry AI
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
              {/* Active context badges */}
              {selectedDocIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5 max-w-3xl mx-auto">
                  {selectedDocIds.map((id) => {
                    const doc = documents.find((d) => d.document_id === id);
                    if (!doc) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded-sm text-xs transition-colors"
                      >
                        <span className="truncate max-w-[150px]">{doc.filename}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newSelection = selectedDocIds.filter((x) => x !== id);
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
                          className="hover:text-red-400 p-0.5 rounded-full shrink-0 cursor-pointer"
                          title="Remove from context"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <form
                onSubmit={handleSend}
                className="max-w-3xl mx-auto flex items-center gap-3"
              >
                <div className="flex items-center gap-2 flex-1 bg-muted border border-border rounded-md px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger
                      type="button"
                      className="h-8 w-8 hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 rounded-sm flex items-center justify-center cursor-pointer"
                      aria-label="Add context or actions"
                    >
                      <Plus className="w-4 h-4" />
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-40 p-1 bg-card border-border text-foreground shadow-none rounded-md">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          handleOpenContextModal();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs hover:bg-accent cursor-pointer text-left text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Context</span>
                      </button>
                    </PopoverContent>
                  </Popover>

                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={loading || selectedDocIds.length === 0}
                    aria-label="Ask a question about your documents"
                    placeholder={
                      selectedDocIds.length === 0
                        ? "Add document context via + menu..."
                        : "Ask a question about your documents..."
                    }
                    className="flex-1 bg-transparent border-0 outline-none ring-0 placeholder-muted-foreground text-sm text-foreground focus:ring-0 focus:outline-none"
                  />

                  <Button
                    type="submit"
                    disabled={!question.trim() || loading || selectedDocIds.length === 0}
                    className="h-8 w-8 p-0 bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground rounded-sm transition-colors disabled:bg-muted disabled:text-muted-foreground flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              {selectedDocIds.length === 0 && (
                <p className="text-center text-[10px] text-red-400 mt-2 flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Select at least one document context in the + menu to unlock text inputs.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Welcome Viewport */
          <div className="flex-1 flex flex-col h-full bg-background relative min-w-0">
            {/* Mobile Welcome Header */}
            <header className="border-b border-border bg-background/40 backdrop-blur px-6 py-4 flex md:hidden items-center justify-between h-16 shrink-0 sticky top-0 z-30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="h-9 w-9 text-muted-foreground hover:text-foreground shrink-0 rounded-sm"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-sm font-semibold text-foreground">
                Quarry
              </h2>
              <div className="w-9" /> {/* balance layout offset */}
            </header>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-6">
              <div className="h-12 w-12 rounded-sm bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
                  No active session.
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Start a new Q&A conversation, select your document context resources, and stream reference answers in real-time.
                </p>
              </div>
              <Button
                onClick={handleNewChatClick}
                className="bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium text-sm h-10 px-6 rounded-sm shadow-none animate-in fade-in duration-200"
              >
                Start Chatting
              </Button>
            </div>
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
              <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
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
                <span className="text-xs font-medium text-muted-foreground">
                  Document Name
                </span>
                <div className="flex items-center gap-2 p-2 rounded-sm bg-muted border border-border">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <p
                    className="text-xs text-foreground font-medium truncate"
                    title={selectedCitation.source_filename}
                  >
                    {selectedCitation.source_filename}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Reference Location
                </span>
                <div className="p-2 rounded-sm bg-muted border border-border">
                  <p className="text-xs text-foreground font-medium">
                    Page{" "}
                    {selectedCitation.page_index !== undefined
                      ? selectedCitation.page_index + 1
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Matched Text Segment
                </span>
                <div className="p-3 rounded-sm bg-muted/30 border border-border text-xs text-foreground font-sans leading-relaxed whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
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
        <DialogContent className="border-border bg-card max-w-md text-foreground rounded-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Select Ingestion Context
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              Choose the document context scope that you wish to target query
              retrieval models in this session.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="max-h-60 overflow-y-auto space-y-1 border border-border p-2.5 rounded-md bg-muted/40">
              {documents.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2 text-center">
                  No documents found
                </p>
              ) : (
                documents.map((doc) => {
                  const isChecked = tempSelectedDocIds.includes(doc.document_id);
                  return (
                    <div
                      key={doc.document_id}
                      className="flex items-center justify-between p-1.5 rounded-sm hover:bg-accent/50 text-xs text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <button
                        type="button"
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
                        className="flex-1 flex items-center gap-2.5 text-left py-1 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
                      >
                        <div
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? "bg-primary border-primary text-white"
                              : "border-border bg-muted"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate max-w-[240px] font-medium">
                          {doc.filename}
                        </span>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePreviewDoc(doc);
                          setIsPreviewOpen(true);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-accent rounded-sm shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsContextModalOpen(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveContext}
              disabled={tempSelectedDocIds.length === 0}
              className="bg-primary hover:bg-neutral-800 dark:hover:bg-neutral-200 text-primary-foreground font-medium rounded-sm"
            >
              Save Context
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setActivePreviewDoc(null);
        }}
        document={activePreviewDoc}
      />

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
