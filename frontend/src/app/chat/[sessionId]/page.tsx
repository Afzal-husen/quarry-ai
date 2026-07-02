import React from "react";
import { cookies } from "next/headers";
import ChatShell from "@/components/ChatShell";

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "User";
  const { sessionId } = await params;

  return <ChatShell username={username} initialActiveSessionId={sessionId} />;
}
