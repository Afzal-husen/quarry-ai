import React from "react";
import { cookies } from "next/headers";
import ChatShell from "@/components/ChatShell";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "User";

  return <ChatShell username={username} />;
}
