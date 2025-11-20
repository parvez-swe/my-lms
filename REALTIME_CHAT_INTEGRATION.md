# Real-Time Chat Integration Guide

## Overview

The FloatingChatbot is now **fully integrated with the real-time chat system**. Messages sent from the floating widget on public pages will appear in the `/dashboard/chats` page, creating a unified chat experience.

## Architecture

### Components

1. **FloatingChatbot** (`src/components/FloatingChatbot/index.tsx`)

   - Appears on all public-facing pages
   - Uses real chat API endpoints
   - Stores conversation ID in state
   - Sends/receives messages via `/api/chat/*` endpoints

2. **Chat Dashboard** (`src/app/(admin)/dashboard/chats/page.tsx`)

   - Full-featured chat interface for authenticated users
   - Shows conversations and messages
   - Uses same API as FloatingChatbot

3. **Chat Component** (`src/components/Apps/Chat/index.tsx`)

   - Displays messages for selected conversation
   - Handles message sending and real-time updates
   - Supports file attachments

4. **Chat Sidebar** (`src/components/Apps/Chat/Sidebar/index.tsx`)
   - Lists all conversations
   - Shows user list for starting new chats
   - Filters conversations by search

## How It Works

### Sending a Message from FloatingChatbot

1. User types message in floating widget
2. `handleSendMessage()` is triggered
3. Message sent to `/api/chat/messages/{conversationId}` via POST
4. API creates ChatMessage record
5. Message added to local state and displayed immediately
6. Same message appears in dashboard when user navigates to `/dashboard/chats`

### Message Flow

```
FloatingChatbot (Public Pages)
         ↓
   /api/chat/messages
         ↓
   Database (ChatMessage)
         ↓
Chat Dashboard (/dashboard/chats)
```

## API Endpoints Used

### Get Conversations

```bash
GET /api/chat/conversations
# Returns: { conversations: Conversation[] }
```

### Get Messages

```bash
GET /api/chat/messages/{conversationId}?limit=50
# Returns: { messages: ChatMessage[] }
```

### Send Message

```bash
POST /api/chat/messages/{conversationId}
Body: { text: string }
# Returns: { success: boolean, message: ChatMessage }
```

### Create Conversation

```bash
POST /api/chat/create-conversation
Body: { recipientId: string, recipientName: string, recipientAvatar: string }
# Returns: { success: boolean, conversation: Conversation }
```

## Key Features

✅ **Real-Time Messaging**

- Messages instantly appear in both places
- Uses same backend database

✅ **Automatic Conversation Creation**

- FloatingChatbot creates "Support Team" conversation on first use
- Can use existing conversations from dashboard

✅ **Message History**

- Loads last 50 messages when conversation is opened
- Full timestamp tracking

✅ **User Identity**

- Tracks senderName and senderId
- Shows avatar in message bubbles

✅ **Responsive UI**

- Works on mobile and desktop
- Dark mode support
- Auto-scrolling to latest messages

## File Locations

```
src/
├── components/
│   ├── FloatingChatbot/
│   │   └── index.tsx (UPDATED - now real-time)
│   └── Apps/Chat/
│       ├── index.tsx
│       └── Sidebar/
│           └── index.tsx
├── app/(admin)/dashboard/chats/
│   └── page.tsx (chat page)
├── app/(client)/layout.tsx (includes FloatingChatbot)
└── types/
    └── chat.ts (TypeScript interfaces)
```

## Testing

### Test Floating Widget → Dashboard

1. Navigate to homepage: `http://localhost:3000`
2. Click floating chat button (bottom-right)
3. Send a message: "Hello from floating widget"
4. Navigate to dashboard: `/dashboard/chats`
5. Click conversation with "Support Team"
6. ✅ Message should appear in dashboard chat

### Test Dashboard → Floating Widget

1. Go to `/dashboard/chats`
2. Select or create a conversation
3. Send message from dashboard
4. Navigate back to homepage
5. Click floating widget
6. ✅ Message should appear in floating chat

## Type Definitions

```typescript
interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Future Enhancements

- [ ] Real-time WebSocket updates (current implementation polls)
- [ ] File upload support
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Message read receipts
- [ ] User online status
- [ ] Message search
- [ ] Conversation archiving

## Troubleshooting

**Messages not appearing in dashboard?**

- Ensure conversation ID is consistent
- Check API response status
- Verify user is authenticated

**FloatingChatbot not showing messages?**

- Check browser console for errors
- Verify API endpoints are accessible
- Ensure conversation was initialized

**Page not loading?**

- Run: `npm run dev`
- Check terminal for compile errors
- Clear browser cache

---

**Last Updated:** November 20, 2025
**Status:** ✅ Fully Functional - Real-time Chat System Integrated
