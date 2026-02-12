"use client";

import * as React from "react";
import { useChat } from "ai/react";
import {
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Home,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSessionList } from "@/components/chat/chat-session-list";

interface ChatSessionItem {
  id: string;
  title: string | null;
  homeId: string | null;
  updatedAt: string;
  _count: { messages: number };
}

interface HomeItem {
  id: string;
  name: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = React.useState<ChatSessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(
    null
  );
  const [homes, setHomes] = React.useState<HomeItem[]>([]);
  const [selectedHomeId, setSelectedHomeId] = React.useState<string | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [homeDropdownOpen, setHomeDropdownOpen] = React.useState(false);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      sessionId: activeSessionId,
      homeId: selectedHomeId,
    },
    onResponse(response) {
      // Capture session ID from new sessions
      const newSessionId = response.headers.get("X-Session-Id");
      if (newSessionId && !activeSessionId) {
        setActiveSessionId(newSessionId);
        loadSessions();
      }
    },
    onFinish() {
      loadSessions();
    },
  });

  const loadSessions = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  const loadHomes = React.useCallback(async () => {
    try {
      const res = await fetch("/api/homes");
      const data = await res.json();
      if (data.success && data.data) {
        setHomes(data.data);
        if (data.data.length > 0 && !selectedHomeId) {
          setSelectedHomeId(data.data[0].id);
        }
      }
    } catch {
      // ignore
    }
  }, [selectedHomeId]);

  React.useEffect(() => {
    loadSessions();
    loadHomes();
  }, [loadSessions, loadHomes]);

  const handleSelectSession = React.useCallback(
    async (id: string) => {
      setActiveSessionId(id);
      // Load messages for this session
      try {
        const session = sessions.find((s) => s.id === id);
        if (session?.homeId) {
          setSelectedHomeId(session.homeId);
        }

        // Fetch session messages from the database
        const res = await fetch(`/api/chat/sessions/${id}/messages`);
        const data = await res.json();
        if (data.success) {
          setMessages(
            data.data.map(
              (m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
              })
            )
          );
        }
      } catch {
        setMessages([]);
      }
    },
    [sessions, setMessages]
  );

  const handleNewChat = React.useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, [setMessages]);

  const handleDeleteSession = React.useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSessionId === id) {
          handleNewChat();
        }
      } catch {
        // ignore
      }
    },
    [activeSessionId, handleNewChat]
  );

  const handleFormSubmit = React.useCallback(
    (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      if (input.trim()) {
        handleSubmit(e as React.FormEvent<HTMLFormElement>);
      }
    },
    [input, handleSubmit]
  );

  // Open sidebar by default on large screens
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) setSidebarOpen(true);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const selectedHome = homes.find((h) => h.id === selectedHomeId);

  return (
    <div className="-m-4 flex h-[calc(100dvh-4rem)] sm:-m-6 lg:-m-8">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Session Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] transition-all duration-300",
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-40 w-72 lg:static"
            : "w-0 overflow-hidden border-r-0"
        )}
      >
        <ChatSessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            handleSelectSession(id);
            // Close sidebar on mobile after selecting
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          onNewChat={() => {
            handleNewChat();
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
          onDeleteSession={handleDeleteSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
            <MessageSquare className="h-4 w-4 text-teal-500" />
            {activeSessionId
              ? sessions.find((s) => s.id === activeSessionId)?.title ||
                "Chat"
              : "New Chat"}
          </div>

          <div className="ml-auto relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setHomeDropdownOpen(!homeDropdownOpen)}
            >
              <Home className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate text-xs">
                {selectedHome?.name ?? "Select Home"}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>

            {homeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setHomeDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1 shadow-lg">
                  {homes.map((home) => (
                    <button
                      key={home.id}
                      onClick={() => {
                        setSelectedHomeId(home.id);
                        setHomeDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        selectedHomeId === home.id
                          ? "bg-teal-500/10 text-[hsl(var(--foreground))]"
                          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                      )}
                    >
                      <Home className="h-3.5 w-3.5" />
                      {home.name}
                    </button>
                  ))}
                  {homes.length === 0 && (
                    <div className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                      No homes yet
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <ChatMessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={() => handleFormSubmit()}
            isLoading={isLoading}
            disabled={homes.length === 0}
          />
          {homes.length === 0 && (
            <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
              Add a home first to start chatting with your home assistant.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
