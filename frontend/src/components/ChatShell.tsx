"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Plus, Trash2, Send, ArrowLeft, FileText, 
  ChevronDown, BookOpen, Clock, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { apiGet, apiDelete, apiPost } from '../lib/api-client';
import { getTokenAction } from '../app/actions/cookies';
import UploadModal from './UploadModal';

interface SessionItem {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
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
        className="bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700/40 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono select-none cursor-help transition-colors focus:outline-none"
      >
        [{index}]
      </button>

      {hovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-2xl text-left pointer-events-none flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span className="truncate max-w-[150px]">{citation.source_filename || 'source'}</span>
            <span>Page {citation.page_index !== undefined ? citation.page_index + 1 : '—'}</span>
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
  
  // Selected context ids
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  // Modal control states
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempSelectedDocIds, setTempSelectedDocIds] = useState<string[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Inputs
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const feedContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper scrolling functions
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

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch initial documents and chat sessions list
  const fetchSessions = useCallback(async () => {
    try {
      const res = await apiGet('/sessions?limit=50');
      if (res && res.items) {
        setSessions(res.items);
      }
    } catch (err: any) {
      console.error('Failed to load chat sessions:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await apiGet('/documents');
      if (res && res.items) {
        setDocuments(res.items);
      }
    } catch (err: any) {
      console.error('Failed to load documents registry:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
  }, [fetchSessions, fetchDocuments]);

  // Restore active session ID on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('document_rag_active_session_id');
    if (savedSessionId) {
      setActiveSessionId(savedSessionId);
    }
  }, []);

  // Save active session ID on changes
  useEffect(() => {
    if (activeSessionId) {
      try {
        localStorage.setItem('document_rag_active_session_id', activeSessionId);
      } catch (err) {
        console.warn('Failed to save active session ID:', err);
      }
    } else {
      try {
        localStorage.removeItem('document_rag_active_session_id');
      } catch (err) {
        console.warn('Failed to remove active session ID:', err);
      }
    }
  }, [activeSessionId]);

  // Load message logs and selected documents of the active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    // Restore selected documents context from localStorage
    const savedDocIds = localStorage.getItem(`document_rag_session_docs_${activeSessionId}`);
    if (savedDocIds) {
      try {
        setSelectedDocIds(JSON.parse(savedDocIds));
      } catch (err) {
        console.warn('Failed to parse saved document context:', err);
        if (documents.length > 0) {
          setSelectedDocIds([documents[0].document_id]);
        }
      }
    } else {
      // Default to the first available document if no config exists
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
          // Scroll bottom on load
          setTimeout(() => {
            if (feedContainerRef.current) {
              scrollToBottom(feedContainerRef.current);
            }
          }, 50);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    loadMessages();
  }, [activeSessionId, documents]);

  // Handle New Chat clicks with ingestion validations
  const handleNewChatClick = async () => {
    try {
      const res = await apiGet('/documents');
      if (!res || !res.items || res.items.length === 0) {
        setToast({ type: 'error', message: 'You must upload at least one document to start a chat.' });
        setIsUploadOpen(true);
      } else {
        setDocuments(res.items);
        setTempSelectedDocIds([res.items[0].document_id]);
        setIsContextModalOpen(true);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to access document registry.' });
    }
  };

  // Confirms starting a session
  const handleStartChat = async () => {
    if (tempSelectedDocIds.length === 0) {
      setToast({ type: 'error', message: 'Please select at least one document context.' });
      return;
    }

    try {
      const res = await apiPost('/sessions', { title: 'New Chat' });
      if (res && res.id) {
        try {
          localStorage.setItem(`document_rag_session_docs_${res.id}`, JSON.stringify(tempSelectedDocIds));
        } catch (err) {
          console.warn('Failed to save document context:', err);
        }
        setSelectedDocIds(tempSelectedDocIds);
        setActiveSessionId(res.id);
        setIsContextModalOpen(false);
        await fetchSessions();
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to create chat session.' });
    }
  };

  // Deleting sessions
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this chat session? All message history will be lost.');
    if (!confirmed) return;

    try {
      await apiDelete(`/sessions/${sessionId}`);
      try {
        localStorage.removeItem(`document_rag_session_docs_${sessionId}`);
      } catch {}
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
      await fetchSessions();
      setToast({ type: 'success', message: 'Chat deleted.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete chat session.' });
    }
  };

  // Upload handler fallback trigger
  const handleUploadStarted = (jobId: string, filename: string) => {
    setToast({ type: 'success', message: `Upload started for "${filename}". Check dashboard for progress.` });
    // Reload documents once background ingestion is triggered
    fetchDocuments();
  };

  // Submit query stream handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading || !activeSessionId) return;

    if (selectedDocIds.length === 0) {
      setToast({ type: 'error', message: 'You must select at least one document to define context.' });
      return;
    }

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);

    // Push User message
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: currentQuestion };
    setMessages(prev => [...prev, userMsg]);

    // Force scroll after user question
    setTimeout(() => {
      if (feedContainerRef.current) {
        scrollToBottom(feedContainerRef.current);
      }
    }, 20);

    const token = await getTokenAction();
    const isFirstMessage = messages.length === 0;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_ids: selectedDocIds,
          question: currentQuestion,
          session_id: activeSessionId
        })
      });

      if (!response.ok) {
        throw new Error('Streaming query submission failed.');
      }

      if (!response.body) {
        throw new Error('No response readable stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Initialize assistant placeholder message
      const assistantMsgId = `assistant-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', metadata: { citations: [] } }
      ]);

      let assistantContent = '';
      let assistantCitations: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;

          if (cleaned.startsWith('data: ')) {
            const dataStr = cleaned.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.citations) {
                assistantCitations = parsed.citations;
              } else if (parsed.token) {
                assistantContent += parsed.token;
              }

              // Update the assistant message content
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: assistantContent, metadata: { citations: assistantCitations } }
                    : m
                )
              );

              // Smart-scroll container updates
              if (feedContainerRef.current && isScrollAtBottom(feedContainerRef.current)) {
                scrollToBottom(feedContainerRef.current);
              }
            } catch (err) {
              console.error('Failed to parse SSE data block:', cleaned, err);
            }
          }
        }
      }

      // If it was the first turn, trigger session reload to fetch generated titles
      if (isFirstMessage) {
        await fetchSessions();
      }

    } catch (err: any) {
      setToast({ type: 'error', message: err.message || 'Error loading model stream.' });
    } finally {
      setLoading(false);
    }
  };

  // Splits assistant message text into parsed tokens displaying inline hover buttons
  const renderMessageContent = (content: string, citations: any[] | undefined) => {
    if (!citations || citations.length === 0) {
      return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }

    const parts = content.split(/(\[\d+\])/g);
    return (
      <p className="whitespace-pre-wrap leading-relaxed text-sm">
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
      </p>
    );
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Toast Banner Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg transition-opacity duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* 1. Sidebar history listing */}
      <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <a 
              href="/"
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Dashboard
            </a>
            <span className="text-xs text-zinc-500 font-medium">Chat Sessions</span>
          </div>
          <button
            onClick={handleNewChatClick}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Scrollable chat logs list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No chat logs found
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium flex items-center justify-between group cursor-pointer transition-colors ${
                  activeSessionId === s.id 
                    ? 'bg-zinc-800 text-zinc-100' 
                    : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span className="truncate">{s.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition-all rounded focus:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar user footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
          <p className="text-xs text-zinc-400 truncate">
            Signed in as: <strong className="text-zinc-200">{username}</strong>
          </p>
        </div>
      </aside>

      {/* 2. Main Q&A viewport */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950 relative">
        {activeSessionId ? (
          <>
            {/* Active chat header context bar */}
            <header className="border-b border-zinc-800 bg-zinc-900/20 backdrop-blur px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Active Session Room
              </h2>
              
              {/* Context Selector Checklist dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                  className="py-1.5 px-3 bg-zinc-900 border border-zinc-850 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Context ({selectedDocIds.length} files)</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {isDocDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-zinc-800 bg-zinc-950/30">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Query Target Files</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                      {documents.length === 0 ? (
                        <p className="text-xs text-zinc-500 p-2 text-center">No files found</p>
                      ) : (
                        documents.map((doc) => {
                          const isChecked = selectedDocIds.includes(doc.document_id);
                          return (
                            <label
                              key={doc.document_id}
                              className="flex items-center gap-2.5 p-2 rounded-lg text-xs hover:bg-zinc-800/40 cursor-pointer select-none text-zinc-300 hover:text-zinc-100"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                                checked={isChecked}
                                onChange={() => {
                                  let newSelection;
                                  if (isChecked) {
                                    newSelection = selectedDocIds.filter(id => id !== doc.document_id);
                                  } else {
                                    newSelection = [...selectedDocIds, doc.document_id];
                                  }
                                  setSelectedDocIds(newSelection);
                                  if (activeSessionId) {
                                    try {
                                      localStorage.setItem(`document_rag_session_docs_${activeSessionId}`, JSON.stringify(newSelection));
                                    } catch (err) {
                                      console.warn('Failed to save document context:', err);
                                    }
                                  }
                                }}
                              />
                              <span className="truncate flex-1">{doc.filename}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Message feed feed */}
            <div 
              ref={feedContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <MessageSquare className="w-12 h-12 text-zinc-800" />
                  <h3 className="text-base font-medium text-zinc-400">Welcome to your new chat</h3>
                  <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
                    Ask any question about your target documents. The AI assistant will retrieve relevant references and cite them in real-time.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-2xl max-w-[70%] shadow-md border ${
                      msg.role === 'user'
                        ? 'bg-zinc-800 border-zinc-700/60 rounded-tr-none text-zinc-150'
                        : 'bg-zinc-900 border-zinc-800 rounded-tl-none text-zinc-200'
                    }`}>
                      {msg.role === 'assistant' 
                        ? renderMessageContent(msg.content, msg.metadata?.citations)
                        : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      }
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input panel */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
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
                <button
                  type="submit"
                  disabled={!question.trim() || loading || selectedDocIds.length === 0}
                  className="absolute right-2.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:bg-zinc-800 disabled:text-zinc-500"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {selectedDocIds.length === 0 && (
                <p className="text-center text-[11px] text-red-400 mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Select at least one document context in the top-right header to unlock text inputs.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Landing welcome viewport */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <MessageSquare className="w-16 h-16 text-zinc-800" />
            <h2 className="text-lg font-semibold text-zinc-300">Start Q&A Conversational Rooms</h2>
            <p className="text-zinc-500 text-sm max-w-sm">
              Create a new chat session, bind your target vector documents context, and stream model responses in real-time.
            </p>
            <button
              onClick={handleNewChatClick}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Chatting
            </button>
          </div>
        )}
      </main>

      {/* 3. New Chat Context Configuration Modal */}
      {isContextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <h3 className="text-base font-semibold text-zinc-50 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Select Ingestion Context
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-400 leading-normal">
                Choose the document context scope that you wish to target query retrieval models in this session. You can modify these targets dynamically inside the chat room.
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2 border border-zinc-850 p-3 rounded-lg bg-zinc-950">
                {documents.map((doc) => {
                  const isChecked = tempSelectedDocIds.includes(doc.document_id);
                  return (
                    <button
                      key={doc.document_id}
                      onClick={() => {
                        if (isChecked) {
                          setTempSelectedDocIds(tempSelectedDocIds.filter(id => id !== doc.document_id));
                        } else {
                          setTempSelectedDocIds([...tempSelectedDocIds, doc.document_id]);
                        }
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-zinc-900/60 cursor-pointer select-none text-zinc-300 hover:text-zinc-100 text-left transition-colors"
                    >
                      <span className="truncate max-w-[280px] font-medium">{doc.filename}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'border-zinc-800 bg-zinc-900'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4 bg-zinc-900/50">
              <button
                onClick={() => setIsContextModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartChat}
                disabled={tempSelectedDocIds.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:text-zinc-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Ingestion modal fallback popup */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadStarted={handleUploadStarted}
      />
    </div>
  );
}
