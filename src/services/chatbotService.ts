// Chatbot service - handles AI responses
// This can be integrated with an actual AI API (like OpenAI, Anthropic, etc.)

interface ChatbotResponse {
  message: string;
  type: "text" | "error";
}

// Sample responses for different types of queries
const responsePatterns: { [key: string]: string[] } = {
  greeting: [
    "Hello! 👋 I'm here to help. What can I assist you with today?",
    "Hi there! 😊 Feel free to ask me anything about our courses or services.",
    "Welcome! 🎓 How can I help you today?",
  ],
  courses: [
    "We offer a wide variety of courses in web development, mobile development, data science, and more. What subject interests you?",
    "Our course catalog includes everything from beginner to advanced levels. Which topic would you like to explore?",
    "We have structured courses for all skill levels. What are you looking to learn?",
  ],
  pricing: [
    "Our pricing varies based on the course level and duration. Would you like information about a specific course?",
    "We offer flexible pricing options for individual courses and subscription plans. Let me help you find the right option!",
    "Check our pricing page for detailed information about course costs and subscription plans.",
  ],
  help: [
    "I can help you with course information, pricing, enrollment, and general questions. What do you need help with?",
    "I'm here to assist! Ask me about courses, pricing, technical issues, or anything else you need.",
    "Feel free to ask me about courses, enrollment, pricing, or any other questions you have!",
  ],
  enrollment: [
    "To enroll in a course, visit the course page and click the 'Enroll Now' button. You'll need to create an account if you haven't already.",
    "Enrollment is easy! Select the course you're interested in, then click the enrollment button to get started.",
    "Would you like help with the enrollment process? I can guide you through it step by step.",
  ],
  thanks: [
    "You're welcome! 😊 Is there anything else I can help you with?",
    "Happy to help! Let me know if you have any other questions.",
    "You're welcome! Feel free to ask if you need anything else.",
  ],
  default: [
    "That's interesting! Can you tell me more about what you're looking for?",
    "I'm not sure I understand. Could you rephrase that?",
    "Hmm, let me help you. Could you provide more details?",
  ],
};

// Determine the type of query and return appropriate response
function categorizeQuery(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (/hello|hi|hey|greet|start|begin/i.test(lowerMessage)) {
    return "greeting";
  } else if (/course|learn|subject|topic|curriculum/i.test(lowerMessage)) {
    return "courses";
  } else if (/price|cost|fee|subscription|payment|afford/i.test(lowerMessage)) {
    return "pricing";
  } else if (/help|assist|support|guide|stuck|issue/i.test(lowerMessage)) {
    return "help";
  } else if (/enroll|join|register|sign|access|begin/i.test(lowerMessage)) {
    return "enrollment";
  } else if (/thank|thanks|appreciate|grateful/i.test(lowerMessage)) {
    return "thanks";
  }

  return "default";
}

// Get a random response from a category
function getRandomResponse(category: string): string {
  const responses = responsePatterns[category] || responsePatterns["default"];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Main chatbot response function
export async function getChatbotResponse(
  userMessage: string
): Promise<ChatbotResponse> {
  try {
    // Simulate API call delay (remove this in production)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const category = categorizeQuery(userMessage);
    const response = getRandomResponse(category);

    return {
      message: response,
      type: "text",
    };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      message: "Sorry, I encountered an error. Please try again.",
      type: "error",
    };
  }
}

// You can replace this with actual API integration
// Example with OpenAI API:
/*
export async function getChatbotResponse(userMessage: string): Promise<ChatbotResponse> {
  try {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    return { message: data.message, type: "text" };
  } catch (error) {
    return { message: "Error getting response", type: "error" };
  }
}
*/
