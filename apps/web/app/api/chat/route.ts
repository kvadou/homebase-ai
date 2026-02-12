import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildHomeAssistantPrompt,
  searchManualChunks,
} from "@homebase-ai/ai/rag";
import { DEFAULT_MODEL } from "@homebase-ai/ai";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { messages, sessionId, homeId } = body as {
      messages: Array<{ role: string; content: string }>;
      sessionId?: string;
      homeId?: string;
    };

    if (!messages || messages.length === 0) {
      return Response.json(
        { success: false, error: "Messages are required" },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (!lastUserMessage) {
      return Response.json(
        { success: false, error: "No user message found" },
        { status: 400 }
      );
    }

    // Resolve or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          homeId: homeId || null,
          title: lastUserMessage.content.slice(0, 100),
        },
      });
      currentSessionId = session.id;
    } else {
      // Verify session belongs to user
      const session = await prisma.chatSession.findFirst({
        where: { id: currentSessionId, userId: user.id },
      });
      if (!session) {
        return Response.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }
    }

    // Build system prompt with home context
    let systemPrompt =
      "You are HomeBase AI, a helpful home assistant. You help homeowners manage and maintain their homes.";
    const resolvedHomeId = homeId || (await getSessionHomeId(currentSessionId));

    if (resolvedHomeId) {
      const home = await prisma.home.findFirst({
        where: {
          id: resolvedHomeId,
          users: { some: { userId: user.id } },
        },
        include: {
          rooms: { select: { name: true, roomType: true } },
          items: {
            select: {
              name: true,
              category: true,
              brand: true,
              model: true,
              room: { select: { name: true } },
            },
          },
        },
      });

      if (home) {
        // Search for relevant manual context
        let relevantChunks: Awaited<ReturnType<typeof searchManualChunks>> = [];
        try {
          relevantChunks = await searchManualChunks(
            prisma,
            lastUserMessage.content,
            3
          );
        } catch {
          // RAG search may fail if no embeddings exist yet
        }

        systemPrompt = buildHomeAssistantPrompt(
          {
            homeName: home.name,
            rooms: home.rooms,
            items: home.items.map((i) => ({
              ...i,
              roomName: i.room?.name ?? null,
            })),
          },
          relevantChunks
        );
      }
    }

    // Save user message to DB
    await prisma.chatMessage.create({
      data: {
        sessionId: currentSessionId,
        role: "user",
        content: lastUserMessage.content,
      },
    });

    // Stream response using Vercel AI SDK
    const result = streamText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      maxTokens: 4096,
      async onFinish({ text }) {
        // Save assistant response to DB
        await prisma.chatMessage.create({
          data: {
            sessionId: currentSessionId!,
            role: "assistant",
            content: text,
          },
        });

        // Update session title if it's the first exchange
        const messageCount = await prisma.chatMessage.count({
          where: { sessionId: currentSessionId! },
        });
        if (messageCount <= 2) {
          await prisma.chatSession.update({
            where: { id: currentSessionId! },
            data: {
              title: lastUserMessage.content.slice(0, 100),
            },
          });
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "X-Session-Id": currentSessionId,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Chat API error:", error);
    return Response.json(
      { success: false, error: "Failed to process chat" },
      { status: 500 }
    );
  }
}

async function getSessionHomeId(
  sessionId: string
): Promise<string | null> {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { homeId: true },
  });
  return session?.homeId ?? null;
}
