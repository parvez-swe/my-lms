// Chatbot service — client-side wrapper for the AI API

interface ChatbotResponse {
  message: string;
  type: "text" | "error";
  provider?: string;
  sessionId?: string;
}

interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

const AI_SESSION_KEY = "nahal_ai_session_id";

export function getAiSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(AI_SESSION_KEY);
  if (!id) {
    id = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(AI_SESSION_KEY, id);
  }
  return id;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("visitor_id");
  if (!id) {
    id = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("visitor_id", id);
  }
  return id;
}

export async function getChatbotResponse(
  userMessage: string,
  history: ChatHistoryItem[] = [],
  sessionId?: string
): Promise<ChatbotResponse> {
  try {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history,
        sessionId: sessionId || getAiSessionId(),
        visitorId: getVisitorId(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || "Sorry, I encountered an error. Please try again.",
        type: "error",
      };
    }

    if (data.sessionId && typeof window !== "undefined") {
      localStorage.setItem(AI_SESSION_KEY, data.sessionId);
    }

    return {
      message: data.message,
      type: data.type || "text",
      provider: data.provider,
      sessionId: data.sessionId,
    };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      message: "Sorry, I could not connect. Please check your connection or use Live Support.",
      type: "error",
    };
  }
}
