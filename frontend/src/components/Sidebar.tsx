"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
} from "lucide-react";
import { apiGet, apiDelete } from "../lib/api-client";
import { logoutAction } from "../app/actions/auth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SessionItem {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  username: string;
  currentPath: string;
  activeSessionId?: string | null;
  sessions?: SessionItem[];
  onSelectSession?: (sessionId: string) => void;
  onCreateSession?: () => void;
  onDeleteSession?: (session: { id: string; title: string }) => void;
}

export default function Sidebar({
  username,
  currentPath,
  activeSessionId = null,
  sessions: propSessions,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}: SidebarProps) {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [localSessions, setLocalSessions] = useState<SessionItem[]>([]);
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Initialize collapse state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("document_rag_sidebar_collapsed");
      if (saved === "true") {
        setTimeout(() => {
          setIsSidebarCollapsed(true);
        }, 0);
      }
    }
  }, []);

  // Fetch sessions internally if not provided by prop
  const isDashboardMode = !propSessions;
  const sessions = propSessions || localSessions;

  const fetchLocalSessions = async () => {
    try {
      const res = await apiGet("/sessions?limit=50");
      if (res && res.items) {
        setLocalSessions(res.items);
      }
    } catch (err) {
      console.error("Failed to load local sessions:", err);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiGet("/sessions?limit=50");
        if (active && res && res.items) {
          setLocalSessions(res.items);
        }
      } catch (err) {
        console.error("Failed to load local sessions:", err);
      }
    };

    if (isDashboardMode) {
      load();
    }

    return () => {
      active = false;
    };
  }, [isDashboardMode]);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    if (typeof window !== "undefined") {
      localStorage.setItem("document_rag_sidebar_collapsed", String(newState));
    }
  };

  const handleSessionClick = (sessionId: string) => {
    if (currentPath === "/chat") {
      if (onSelectSession) {
        onSelectSession(sessionId);
      }
    } else {
      // Transition from dashboard to chat view with search parameters
      if (typeof window !== "undefined") {
        localStorage.setItem("document_rag_active_session_id", sessionId);
      }
      router.push(`/chat?session_id=${sessionId}`);
    }
  };

  const handleNewChatClick = async () => {
    if (currentPath === "/chat") {
      if (onCreateSession) {
        onCreateSession();
      }
    } else {
      router.push("/chat?new=true");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, session: SessionItem) => {
    e.stopPropagation();
    if (currentPath === "/chat" && onDeleteSession) {
      onDeleteSession({ id: session.id, title: session.title });
    } else {
      setSessionToDelete({ id: session.id, title: session.title });
    }
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await apiDelete(`/sessions/${sessionToDelete.id}`);
      toast.success("Chat conversation deleted");

      // If we deleted the active session stored in localStorage, clear it
      if (typeof window !== "undefined") {
        const savedActive = localStorage.getItem(
          "document_rag_active_session_id",
        );
        if (savedActive === sessionToDelete.id) {
          localStorage.removeItem("document_rag_active_session_id");
        }
      }

      setSessionToDelete(null);
      fetchLocalSessions();
    } catch (err) {
      toast.error("Failed to delete chat session");
      console.error(err);
    }
  };

  return (
    <>
      <div
        className={`border-r border-border bg-card flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 h-screen ${
          isSidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-border h-16 shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 text-md font-semibold tracking-tight text-foreground select-none">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>Quarry</span>
            </div>
          )}
          {isSidebarCollapsed && (
            <FileSpreadsheet className="w-5 h-5 text-indigo-500 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground h-8 w-8 ml-auto shrink-0"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Top Actions & Nav links */}
        <div className="p-3 space-y-2 shrink-0">
          <Link href="/">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer group relative ${
                currentPath === "/"
                  ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Database className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md border border-border">
                  Dashboard
                </div>
              )}
            </div>
          </Link>

          <Button
            onClick={handleNewChatClick}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 h-9 shadow-md shadow-indigo-600/10 shrink-0 group relative ${
              isSidebarCollapsed ? "px-0" : ""
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>New Chat</span>}
            {isSidebarCollapsed && (
              <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md border border-border">
                New Chat
              </div>
            )}
          </Button>
        </div>

        {/* Separator & Chat History Title */}
        <div className="px-4 py-2 flex items-center gap-2 shrink-0">
          <div className="flex-1 border-t border-border" />
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              Chat History
            </span>
          )}
          <div className="flex-grow-0 border-t border-border" />
        </div>

        {/* Middle Section (Conversations list) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-card/20 select-none">
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs font-medium">
              {!isSidebarCollapsed ? "No conversations" : "Empty"}
            </div>
          ) : (
            sessions.map((s) => {
              const isSelected = activeSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSessionClick(s.id)}
                  className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-between group cursor-pointer transition-colors relative ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare className="w-4 h-4 shrink-0 text-indigo-400" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{s.title}</span>
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, s)}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all rounded focus:outline-none"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {isSidebarCollapsed && (
                    <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md border border-border">
                      {s.title}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer Profile card */}
        <div className="p-4 border-t border-border bg-card/40 shrink-0">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase shrink-0">
                    {username.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      User
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {username}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <ThemeToggle />
                </div>
              </div>
              <form action={logoutAction} className="w-full">
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1.5 h-8 font-medium text-xs shadow-md shadow-red-900/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ThemeToggle />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase group relative">
                {username.slice(0, 2)}
                <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md border border-border">
                  Logged in as: {username}
                </div>
              </div>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive group relative"
                >
                  <LogOut className="w-4 h-4" />
                  <div className="absolute left-16 bg-popover text-popover-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md border border-border">
                    Sign Out
                  </div>
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog for dashboard mode */}
      <Dialog
        open={sessionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setSessionToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the conversation thread &quot;
              <span className="font-semibold text-foreground">
                {sessionToDelete?.title}
              </span>
              &quot;? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setSessionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Permanent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
