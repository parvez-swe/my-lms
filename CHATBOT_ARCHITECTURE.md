# 🎯 Chatbot System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     LEARNING PLATFORM                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              CHAT PAGE (/dashboard/chats)                │ │
│  │                                                           │ │
│  │  ┌──────────────────┐      ┌──────────────────────────┐ │ │
│  │  │    SIDEBAR       │      │   CHAT COMPONENT         │ │ │
│  │  │ ├─ All Messages  │      │ ┌──────────────────────┐ │ │ │
│  │  │ ├─ Group Chat    │      │ │  Message Display     │ │ │ │
│  │  │ └─ Contacts      │      │ │ ┌────────────────┐  │ │ │
│  │  │                  │      │ │ │ Bot Message    │  │ │ │ │
│  │  │  [Contact List]  │      │ │ │ Timestamp      │  │ │ │
│  │  │  • Sarah Smith   │      │ │ └────────────────┘  │ │ │
│  │  │  • John Doe      │      │ │ ┌────────────────┐  │ │ │
│  │  │  • Jane Wilson   │      │ │ │ User Message   │  │ │ │
│  │  │                  │      │ │ │ Timestamp      │  │ │ │
│  │  └──────────────────┘      │ │ └────────────────┘  │ │ │
│  │                            │ │    [Auto-scroll]   │ │ │
│  │                            │ │ ┌──Loading Dots──┐  │ │ │
│  │                            │ │ │ • • •          │  │ │ │
│  │                            │ │ └────────────────┘  │ │ │
│  │                            │ └──────────────────────┘ │ │
│  │                            │                         │ │
│  │                            │ ┌──────────────────────┐ │ │
│  │                            │ │   INPUT AREA        │ │ │
│  │                            │ │ [😊][📎][🎤][🖼️]   │ │ │
│  │                            │ │ [Type message...] [Send]
│  │                            │ └──────────────────────┘ │ │
│  │                            │                         │ │
│  │                            └─────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

    USER TYPES MESSAGE
            │
            ▼
    ┌───────────────────┐
    │  Input Handler    │
    │ onChange/onKeyDown│
    └────────┬──────────┘
             │
             ▼
    ┌───────────────────────────┐
    │ Validate Input            │
    │ • Not empty               │
    │ • Not loading             │
    └────────┬──────────────────┘
             │
             ▼
    ┌───────────────────────────────────┐
    │ Create User Message               │
    │ • id: auto-increment              │
    │ • text: user input                │
    │ • isSender: true                  │
    │ • timestamp: current time         │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌───────────────────────────────────┐
    │ Update Messages State             │
    │ • Add to messages array           │
    │ • Clear input field               │
    │ • Set loading = true              │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────┐
    │ Call getChatbotResponse()                           │
    │                                                     │
    │  ┌──────────────────────────────────────────────┐  │
    │  │ 1. Analyze Message                           │  │
    │  │    • Convert to lowercase                    │  │
    │  │    • Extract keywords                        │  │
    │  └──────────────────────────────────────────────┘  │
    │                     │                              │
    │                     ▼                              │
    │  ┌──────────────────────────────────────────────┐  │
    │  │ 2. Categorize Input                          │  │
    │  │    • Greeting                                │  │
    │  │    • Courses                                 │  │
    │  │    • Pricing                                 │  │
    │  │    • Support                                 │  │
    │  │    • Enrollment                              │  │
    │  │    • Thanks                                  │  │
    │  │    • Default                                 │  │
    │  └──────────────────────────────────────────────┘  │
    │                     │                              │
    │                     ▼                              │
    │  ┌──────────────────────────────────────────────┐  │
    │  │ 3. Select Response                           │  │
    │  │    • Get category responses array            │  │
    │  │    • Pick random response                    │  │
    │  │    • Return with type="text"                 │  │
    │  └──────────────────────────────────────────────┘  │
    │                                                     │
    └────────┬────────────────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Create Bot Message                  │
    │ • id: auto-increment                │
    │ • text: response text               │
    │ • isSender: false                   │
    │ • timestamp: current time           │
    │ • avatar: bot avatar                │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Update Messages State               │
    │ • Add bot message to array          │
    │ • Set loading = false               │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────┐
    │ Auto-scroll to Bottom               │
    │ • Smooth scroll behavior            │
    │ • Focus on latest message           │
    └────────┬────────────────────────────┘
             │
             ▼
    MESSAGE DISPLAYED WITH TIMESTAMP
```

## Component Structure

```
┌──────────────────────────────────────────────────────────────┐
│                     CHAT PAGE                                │
│ (src/app/(admin)/dashboard/chats/page.tsx)                   │
└────────┬───────────────────────────────────────────┬─────────┘
         │                                           │
         ▼                                           ▼
    ┌─────────────────┐                    ┌──────────────────┐
    │  SIDEBAR        │                    │ CHAT COMPONENT   │
    │ Component       │                    │ Component        │
    │                 │                    │                  │
    │ • Messages List │                    │ STATE:           │
    │ • Group Chat    │                    │ • messages[]     │
    │ • Contacts      │                    │ • inputValue     │
    │ • Search        │                    │ • isLoading      │
    │                 │                    │                  │
    └─────────────────┘                    │ FEATURES:        │
                                           │ • Message List   │
                                           │ • Input Handler  │
                                           │ • Auto-scroll    │
                                           │ • Loading State  │
                                           │ • Keyboard Ctrl  │
                                           │                  │
                                           └──────┬───────────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    │             │             │
                                    ▼             ▼             ▼
                          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                          │ Message Item │ │ Input Form   │ │ UI Elements  │
                          │              │ │              │ │              │
                          │ • User Msg   │ │ • Input field│ │ • Icons      │
                          │ • Bot Msg    │ │ • Buttons    │ │ • Loading    │
                          │ • Timestamp  │ │ • Send Btn   │ │ • Timestamp  │
                          │ • Avatar     │ │ • Actions    │ │ • Avatars    │
                          └──────────────┘ └──────────────┘ └──────────────┘
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CHATBOT SERVICE LAYER                          │
│  (src/services/chatbotService.ts)                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ getChatbotResponse(message: string)                  │  │
│  │                                                      │  │
│  │ INPUT: User message string                          │  │
│  │                                                      │  │
│  │ FLOW:                                               │  │
│  │  1. Convert to lowercase                            │  │
│  │  2. categorizeQuery()                               │  │
│  │     ├─ Check greeting patterns                      │  │
│  │     ├─ Check course patterns                        │  │
│  │     ├─ Check pricing patterns                       │  │
│  │     ├─ Check support patterns                       │  │
│  │     ├─ Check enrollment patterns                    │  │
│  │     ├─ Check thanks patterns                        │  │
│  │     └─ Default                                      │  │
│  │  3. getRandomResponse(category)                     │  │
│  │     └─ Select random from pattern array            │  │
│  │  4. Return ChatbotResponse object                   │  │
│  │                                                      │  │
│  │ OUTPUT: { message: string, type: "text"|"error" }  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Response Patterns                                    │ │
│  │                                                       │ │
│  │ greeting: [                                          │ │
│  │   "Hello! 👋 I'm here to help...",                  │ │
│  │   "Hi there! 😊 How can I assist...",              │ │
│  │   "Welcome! 🎓 What can I help..."                 │ │
│  │ ]                                                    │ │
│  │                                                       │ │
│  │ courses: [                                           │ │
│  │   "We offer web development...",                     │ │
│  │   "Our courses include...",                          │ │
│  │   "We have programs for..."                          │ │
│  │ ]                                                    │ │
│  │                                                       │ │
│  │ pricing: [ ... ]                                     │ │
│  │ enrollment: [ ... ]                                  │ │
│  │ support: [ ... ]                                     │ │
│  │ thanks: [ ... ]                                      │ │
│  │ default: [ ... ]                                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API Route

```
┌──────────────────────────────────────────────────────────────┐
│              API ENDPOINT                                    │
│  POST /api/chatbot                                           │
│  (src/app/api/chatbot/route.ts)                              │
│                                                              │
│  REQUEST:                                                    │
│  {                                                           │
│    "message": "What courses do you offer?"                   │
│  }                                                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 1. Parse Request Body                               │   │
│  │    • Extract message                                │   │
│  │    • Validate not empty                             │   │
│  │    • Validate is string                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 2. Call getChatbotResponse()                         │   │
│  │    • Pass validated message                         │   │
│  │    • Get response with type                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 3. Return Response                                  │   │
│  │    • Success: 200 with response                     │   │
│  │    • Error: 400/500 with error message              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  RESPONSE:                                                   │
│  {                                                           │
│    "message": "We offer web development, mobile...",        │
│    "type": "text"                                            │
│  }                                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## State Management

```
┌────────────────────────────────────────────────────────────┐
│              CHAT COMPONENT STATE                          │
│                                                            │
│  messages: ChatMessage[]                                  │
│  ├─ id: number                                            │
│  ├─ text: string                                          │
│  ├─ isSender: boolean (true = user, false = bot)         │
│  ├─ timestamp: string (HH:MM AM/PM)                      │
│  └─ avatar?: string (optional)                           │
│                                                            │
│  inputValue: string                                       │
│  ├─ Current text in input field                          │
│  ├─ Reset after sending                                  │
│  └─ Disabled when isLoading                              │
│                                                            │
│  isLoading: boolean                                       │
│  ├─ true = chatbot is responding                         │
│  ├─ false = ready for input                              │
│  └─ Shows loading dots animation                         │
│                                                            │
│  messagesEndRef: React.RefObject<HTMLDivElement>         │
│  └─ Used for auto-scroll behavior                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

```
START
  │
  ├─► User Types Message
  │   └─ onCh onChange updates inputValue
  │
  ├─► Press ENTER or Click SEND
  │   ├─ onKeyPress handler (Enter)
  │   └─ onClick handler (Send button)
  │
  ├─► handleSendMessage() triggered
  │   ├─ Validate input (not empty)
  │   ├─ Create user message object
  │   ├─ Add to messages array
  │   ├─ Clear inputValue
  │   ├─ Set isLoading = true
  │   └─ Call getChatbotResponse()
  │
  ├─► Display User Message
  │   ├─ Show in message list
  │   ├─ Right-aligned (blue)
  │   ├─ With timestamp
  │   └─ With user avatar
  │
  ├─► Show Loading Indicator
  │   ├─ Animate bouncing dots
  │   ├─ Auto-scroll to it
  │   └─ Input field disabled
  │
  ├─► Receive Bot Response
  │   ├─ Create bot message object
  │   └─ Add to messages array
  │
  ├─► Display Bot Message
  │   ├─ Show in message list
  │   ├─ Left-aligned (gray)
  │   ├─ With timestamp
  │   └─ With bot avatar
  │
  ├─► Remove Loading Indicator
  │   └─ Set isLoading = false
  │
  ├─► Auto-scroll to Bottom
  │   └─ Smooth scroll to latest message
  │
  ├─► Enable Input
  │   └─ User can type again
  │
  └─► READY FOR NEXT MESSAGE
```

---

**This architecture ensures**:

- ✅ Clean separation of concerns
- ✅ Easy to test and debug
- ✅ Scalable for future features
- ✅ Performance optimized
- ✅ User experience focused
