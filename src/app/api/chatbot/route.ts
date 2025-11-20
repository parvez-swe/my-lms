import { getChatbotResponse } from "@/services/chatbotService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await getChatbotResponse(message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to process message" },
      { status: 500 }
    );
  }
}
