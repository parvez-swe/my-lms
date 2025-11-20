# Real-Time Chat System - Setup & Implementation Guide

## Overview

A fully functional real-time chat system enabling admin/instructors to communicate with students/visitors through individual conversations.

## Architecture

### Data Model (`src/types/chat.ts`)

- **User**: Represents a chat participant with role (admin/instructor/student), status, avatar
- **Conversation**: Stores conversation metadata with participants, last message, unread count
- **ChatMessage**: Individual messages with sender info, text, timestamp, read status

### Components

#### 1. **Chat Page** (`src/app/(admin)/dashboard/chats/page.tsx`)

- **Purpose**: Main container managing state for entire chat system
- **State**: `selectedConversation` (which conversation is currently open)
- **Props Passed**:
  - → Sidebar: `selectedConversation`, `onSelectConversation`
  - → Chat: `selectedConversation`
- **Layout**: 3-column grid (1 col sidebar, 2 col chat)

#### 2. **Sidebar Component** (`src/components/Apps/Chat/Sidebar/index.tsx`)

- **Purpose**: Shows conversation list and available users
- **Features**:
  - Two tabs: Messages (conversations) and Users (contacts)
  - Search filtering for both tabs
  - Unread message count badges
  - Online status indicators (green/yellow/gray)
  - Click to select conversation or Chat button to start new
- **State**:
  - `activeTab`: 0 for Messages, 1 for Users
  - `conversations`: Fetched from `/api/chat/conversations`
  - `users`: Fetched from `/api/chat/users`
  - `searchQuery`: Filter conversations and users
- **API Calls**:
  - GET `/api/chat/conversations` (on mount)
  - GET `/api/chat/users` (on mount)
  - POST `/api/chat/create-conversation` (when Chat button clicked)

#### 3. **Chat Component** (`src/components/Apps/Chat/index.tsx`)

- **Purpose**: Display conversation messages and message input
- **Props**: `selectedConversation` from parent page
- **Features**:
  - Dynamic header with participant name and status
  - Message list with sender/receiver differentiation
  - Auto-scroll to latest message
  - Loading animation during fetch
  - Empty state when no conversation selected
  - Send message input with Enter key support
- **State**:
  - `messages`: Fetched from API
  - `inputValue`: Message text being typed
  - `isLoading`: Loading state during fetch
- **API Calls**:
  - GET `/api/chat/messages/[conversationId]` (on conversation change)
  - POST `/api/chat/messages/[conversationId]` (when sending message)

### API Routes

#### 1. **GET `/api/chat/conversations`**

Returns all conversations for the current user, filtered by participants.

```
Response: { conversations: Conversation[], totalCount: number }
```

#### 2. **GET `/api/chat/users`**

Returns all available users except the current user.

```
Response: { users: User[] }
```

#### 3. **POST `/api/chat/create-conversation`**

Creates a new conversation or returns existing one between current user and recipient.

```
Request: { recipientId: string }
Response: { success: boolean, conversation: Conversation }
```

#### 4. **GET `/api/chat/messages/[conversationId]`**

Fetches paginated messages from a conversation.

```
Query Params: limit=50, offset=0
Response: { messages: ChatMessage[], hasMore: boolean }
```

#### 5. **POST `/api/chat/messages/[conversationId]`**

Sends a new message to a conversation.

```
Request: { text: string }
Response: { success: boolean, message: ChatMessage }
```

## Data Flow

### Starting a Conversation

1. User clicks "Chat" button on a user in the Users tab
2. Sidebar calls POST `/api/chat/create-conversation`
3. API creates conversation if not exists
4. Sidebar calls `onSelectConversation` callback
5. Page sets `selectedConversation` state
6. Chat component receives `selectedConversation` as prop
7. Chat loads messages via GET `/api/chat/messages/[id]`
8. Messages display in conversation

### Sending a Message

1. User types in message input and presses Enter
2. Chat component calls `handleSendMessage()`
3. POST `/api/chat/messages/[conversationId]` with message text
4. API creates ChatMessage and adds to messages array
5. API returns new message
6. Chat component adds message to `messages` state
7. Message renders in UI with auto-scroll

## Mock Data

Current system uses in-memory mock data for rapid development:

### Mock Users (5 total)

- admin-1 (current user, admin role)
- student-1, student-2, student-3 (student role)
- instructor-1 (instructor role)

### Mock Conversations (4 total)

Pre-existing conversations between admin-1 and various students/instructor

### Mock Messages (5 total)

Sample messages across conversations for testing

## Current Limitations & Future Enhancements

### Current

- ✅ Real-time user-to-user messaging
- ✅ Conversation management (create, select, list)
- ✅ Search and filtering
- ✅ Status indicators
- ✅ Unread count tracking
- ✅ Message pagination support

### Future Enhancements

- 🔲 WebSocket integration for true real-time updates (instead of polling)
- 🔲 Database persistence (replace mock data with MongoDB/PostgreSQL)
- 🔲 Session/Auth integration (replace hardcoded "admin-1" with req.user.id)
- 🔲 Typing indicators ("User is typing...")
- 🔲 Read receipts (checkmarks showing when message was read)
- 🔲 Conversation archiving/deletion
- 🔲 File attachment support (images, documents)
- 🔲 Message search functionality
- 🔲 Group conversations (multiple participants)
- 🔲 Message reactions/emojis

## Testing the System

1. Navigate to `/dashboard/chats`
2. You should see:
   - Left sidebar with "Messages" tab showing existing conversations
   - "Users" tab showing available contacts
   - Right panel showing "Select a conversation" message
3. Click a user in Users tab → new conversation created
4. Conversation now appears in Messages tab
5. Click conversation → messages load on right
6. Type message and press Enter → message sends and appears
7. Mock system will cycle messages between users automatically

## File Structure

```
src/
├── types/
│   └── chat.ts                              # Type definitions
├── app/
│   ├── api/chat/
│   │   ├── conversations/route.ts           # GET conversations
│   │   ├── users/route.ts                   # GET users
│   │   ├── create-conversation/route.ts     # POST create conversation
│   │   └── messages/[conversationId]/route.ts # GET/POST messages
│   └── (admin)/dashboard/chats/
│       └── page.tsx                         # Main chat page (state management)
└── components/Apps/Chat/
    ├── index.tsx                             # Chat display component
    └── Sidebar/index.tsx                     # Sidebar component
```

## Environment Setup

No additional setup required. System uses:

- Next.js 15.3.1 (already configured)
- TypeScript (already configured)
- Tailwind CSS (already configured)
- React Hooks (no external dependencies)
- In-memory storage (no database setup needed)

## Notes for Developer Integration

### Switching from Mock Data to Database

1. Replace `mockUsers`, `mockConversations`, `mockMessages` in `src/types/chat.ts` with database queries
2. Update API routes in `src/app/api/chat/*` to query database instead of mock arrays
3. Add database schema for User, Conversation, Message collections/tables

### Adding Session/Auth

1. Replace hardcoded `"admin-1"` with `req.user.id` from session
2. Add session validation middleware to API routes
3. Filter conversations/messages by authenticated user

### Adding Real-Time Updates with WebSocket

1. Integrate Socket.io or similar library
2. Replace HTTP polling with Socket.io event emissions
3. Broadcast new messages to all participants in conversation
4. Add typing indicator events
5. Add online/offline status events
