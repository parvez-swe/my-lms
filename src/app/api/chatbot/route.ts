import { generateAIResponse } from "@/lib/ai";
import { saveAiMessage } from "@/lib/aiChatRepository";
import { withRateLimit } from "@/lib/rateLimit";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const rateLimited = withRateLimit(
      request,
      "chatbot",
      30,
      60 * 60 * 1000
    );
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { message, history, sessionId, visitorId } = body as {
      message?: string;
      history?: { role: "user" | "assistant"; content: string }[];
      sessionId?: string;
      visitorId?: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    const chatSessionId =
      sessionId ||
      visitorId ||
      `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    await saveAiMessage({
      sessionId: chatSessionId,
      role: "user",
      content: message,
      visitorId,
      userId: session?.user?.id,
      userName: session?.user?.name || undefined,
      userEmail: session?.user?.email || undefined,
    });

    const response = await generateAIResponse(message, history || []);

    await saveAiMessage({
      sessionId: chatSessionId,
      role: "assistant",
      content: response.message,
      provider: response.provider,
      visitorId,
      userId: session?.user?.id,
      userName: session?.user?.name || undefined,
      userEmail: session?.user?.email || undefined,
    });

    return NextResponse.json({
      message: response.message,
      type: "text",
      provider: response.provider,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Sorry, I could not process your message. Please try again.",
        type: "error",
      },
      { status: 500 }
    );
  }
}
