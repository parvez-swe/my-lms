import {
  buildAIKnowledgeContext,
  findMatchingCoursesForFallback,
  getAIKnowledgeBundle,
} from "@/lib/aiKnowledge";

const LMS_SYSTEM_PROMPT = `You are a helpful AI assistant for an online Learning Management System (LMS).
You help students and visitors with course recommendations, enrollment steps, pricing, and platform navigation.

IMPORTANT RULES:
- You are given a LIVE course catalog from our database below. ONLY mention courses that appear in that catalog.
- When recommending courses, include the exact course title, price, instructor name, and links (/courses/{slug} or /courses/enroll/{slug}).
- If the user asks about a topic (e.g. freelancing, web development), search the catalog descriptions and curriculum for matching courses and list them specifically.
- Keep answers concise, friendly, and actionable (2-4 short paragraphs or a bullet list).
- Never invent course names, prices, or instructors.
- For billing disputes, account access, or custom requests, suggest "Live Support" in the chat widget.`;

interface AIResponse {
  message: string;
  provider: "groq" | "gemini" | "fallback";
}

async function chatWithGroq(
  systemPrompt: string,
  userMessage: string
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    }
  );

  if (!response.ok) {
    console.error("Groq API error:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function chatWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Gemini API error:", response.status, await response.text());
    return null;
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function fallbackResponse(userMessage: string): Promise<string> {
  const lower = userMessage.toLowerCase();

  try {
    const { courses } = await getAIKnowledgeBundle();
    const matches = findMatchingCoursesForFallback(courses, userMessage);

    if (matches.length > 0) {
      const list = matches
        .map(
          (c) =>
            `• **${c.title}** — ${c.price} (${c.pricingType}) with ${c.tutor}. ${c.lessons} lessons. [View](${c.detailsUrl}) · [Enroll](${c.enrollUrl})`
        )
        .join("\n");

      return `Here are courses from our catalog that match your interest:\n\n${list}\n\nBrowse all courses at /courses. Need personal guidance? Switch to Live Support.`;
    }

    if (courses.length > 0 && /course|learn|enroll|freelance|study/i.test(lower)) {
      const top = courses.slice(0, 3);
      const list = top
        .map(
          (c) =>
            `• **${c.title}** — ${c.price}. [Details](${c.detailsUrl})`
        )
        .join("\n");
      return `We have ${courses.length} courses available. Popular options:\n\n${list}\n\nSee the full catalog at /courses.`;
    }
  } catch (error) {
    console.error("Fallback knowledge load error:", error);
  }

  if (/hello|hi|hey/i.test(lower)) {
    return "Hello! I can recommend specific courses from our catalog, help with enrollment, and answer pricing questions. What would you like to learn?";
  }
  if (/price|payment|bkash|cost/i.test(lower)) {
    return "Each course shows its price on the course page. Paid courses accept bKash during enrollment. Ask me about a specific course for exact pricing.";
  }
  return "Ask me about a topic (e.g. freelancing, web development) and I'll suggest matching courses from our catalog. For account help, use Live Support.";
}

export async function generateAIResponse(
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<AIResponse> {
  try {
    const knowledge = await buildAIKnowledgeContext(userMessage);
    const systemPrompt = `${LMS_SYSTEM_PROMPT}\n\n${knowledge}`;

    const recentHistory = history.slice(-6);
    const historyBlock =
      recentHistory.length > 0
        ? `Previous conversation:\n${recentHistory
            .map(
              (h) =>
                `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`
            )
            .join("\n")}\n\n`
        : "";

    const promptForModel =
      historyBlock.length > 0
        ? `${historyBlock}User: ${userMessage}`
        : userMessage;

    const groqReply = await chatWithGroq(systemPrompt, promptForModel);
    if (groqReply) {
      return { message: groqReply, provider: "groq" };
    }

    const geminiReply = await chatWithGemini(systemPrompt, promptForModel);
    if (geminiReply) {
      return { message: geminiReply, provider: "gemini" };
    }

    return {
      message: await fallbackResponse(userMessage),
      provider: "fallback",
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return {
      message: await fallbackResponse(userMessage),
      provider: "fallback",
    };
  }
}

export function isAIConfigured(): boolean {
  return Boolean(
    process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  );
}
