# Real-Time Chat System - Quick Reference

## 🚀 Quick Start

### Access Chat

```
URL: /dashboard/chats
```

### Start a New Conversation

1. Click **"Users"** tab in sidebar
2. Click **"Chat"** button next to any user
3. Conversation created and opens automatically

### Send a Message

1. Select conversation from sidebar
2. Type message in input field
3. Press **Enter** to send
4. Message appears in conversation

### Search Conversations

1. Type in search box at top of sidebar
2. Results filter in real-time (both tabs)

---

## 📁 File Locations

| File                | Purpose                 | Location                                              |
| ------------------- | ----------------------- | ----------------------------------------------------- |
| Types               | Chat data models        | `src/types/chat.ts`                                   |
| Page                | State management        | `src/app/(admin)/dashboard/chats/page.tsx`            |
| Chat                | Message display         | `src/components/Apps/Chat/index.tsx`                  |
| Sidebar             | Conversation list       | `src/components/Apps/Chat/Sidebar/index.tsx`          |
| API - Conversations | Get all conversations   | `src/app/api/chat/conversations/route.ts`             |
| API - Users         | Get available users     | `src/app/api/chat/users/route.ts`                     |
| API - Messages      | Get/send messages       | `src/app/api/chat/messages/[conversationId]/route.ts` |
| API - Create Conv   | Create new conversation | `src/app/api/chat/create-conversation/route.ts`       |

---

## 🔌 API Endpoints

### 1. GET `/api/chat/conversations`

Get all conversations for current user

```
Response: { conversations: Conversation[], totalCount: number }
```

### 2. GET `/api/chat/users`

Get all available users

```
Response: { users: User[] }
```

### 3. POST `/api/chat/create-conversation`

Create or get existing conversation

```
Request: { recipientId: string }
Response: { success: boolean, conversation: Conversation }
```

### 4. GET `/api/chat/messages/[conversationId]?limit=50&offset=0`

Get messages from a conversation

```
Response: { messages: ChatMessage[], hasMore: boolean }
```

### 5. POST `/api/chat/messages/[conversationId]`

Send a message

```
Request: { text: string }
Response: { success: boolean, message: ChatMessage }
```

---

## 📊 Data Models

### User

```typescript
{
  id: string; // Unique identifier
  name: string; // Display name
  email: string; // Email address
  avatar: string; // Avatar image URL
  role: "admin" | "instructor" | "student";
  status: "online" | "away" | "offline";
  lastSeen: Date;
}
```

### Conversation

```typescript
{
  id: string;                    // Unique identifier
  participants: string[];        // User IDs
  participantNames: string[];    // User display names
  lastMessage?: string;          // Last message text
  updatedAt: Date;              // Last update time
  unreadCount: number;          // Unread messages for current user
  createdAt: Date;
}
```

### ChatMessage

```typescript
{
  id: string; // Unique identifier
  conversationId: string; // Parent conversation
  senderId: string; // Sender user ID
  senderName: string; // Sender display name
  senderAvatar: string; // Sender avatar URL
  text: string; // Message content
  timestamp: Date; // When sent
  isRead: boolean; // Read status
}
```

---

## 🎨 UI Components

### Sidebar

- **Messages Tab**: List of conversations

  - User avatar
  - Participant name
  - Last message preview
  - Unread count badge
  - Hover effect

- **Users Tab**: Available contacts

  - User avatar with status dot
  - User name
  - User role
  - "Chat" button

- **Search**: Filter both tabs in real-time

### Chat

- **Header**:

  - Participant avatar + status
  - Participant name
  - Status text (Online/Away/Offline)
  - Call/Video/More buttons

- **Messages**:

  - Received: gray background, left-aligned, with avatar
  - Sent: blue background, right-aligned
  - Timestamp below each message
  - Auto-scroll to latest

- **Input**:
  - Type message
  - Press Enter to send
  - Shift+Enter for new line

---

## 🟢 Status Colors

- **🟢 Green**: Online (Active now)
- **🟡 Yellow**: Away
- **⚫ Gray**: Offline

---

## 🔄 State Flow

```
Page Component
├── selectedConversation (state)
├── setSelectedConversation (setter)
├── Sidebar
│   ├── conversations (fetched from API)
│   ├── users (fetched from API)
│   └── onSelectConversation (callback)
└── Chat
    ├── messages (fetched from API)
    ├── inputValue (message text)
    └── sends to API
```

---

## 📝 Mock Data

### Users (5)

- admin-1 (admin)
- student-1, student-2, student-3 (students)
- instructor-1 (instructor)

### Conversations (4)

Pre-existing conversations between admin-1 and others

### Messages (5)

Sample messages in conversations

---

## 🔧 Development Tips

### Add New User

Edit `src/types/chat.ts` and add to `mockUsers` array

### Add New Conversation

Edit `src/types/chat.ts` and add to `mockConversations` array

### Update API Responses

Modify respective files in `src/app/api/chat/`

### Styling Changes

Update Tailwind classes in:

- `src/components/Apps/Chat/index.tsx`
- `src/components/Apps/Chat/Sidebar/index.tsx`

### Future: Switch to Database

1. Remove mock arrays from `src/types/chat.ts`
2. Update API routes to query database
3. Replace "admin-1" with session user ID

---

## ✅ Feature Checklist

### Current

- [x] Real-time user-to-user messaging
- [x] Conversation creation
- [x] Conversation selection
- [x] Message sending/receiving
- [x] Status indicators
- [x] Unread counts
- [x] Search and filtering
- [x] Dark mode support
- [x] Responsive layout
- [x] Message pagination

### Future

- [ ] WebSocket for true real-time
- [ ] Database persistence
- [ ] Authentication integration
- [ ] Typing indicators
- [ ] Read receipts
- [ ] File attachments
- [ ] Message search
- [ ] Conversation archiving
- [ ] Group conversations
- [ ] Message reactions

---

## 🐛 Troubleshooting

| Issue                     | Solution                                                                |
| ------------------------- | ----------------------------------------------------------------------- |
| Conversations not loading | Check Network tab, verify `/api/chat/conversations` endpoint            |
| Messages not appearing    | Verify conversation is selected, check `/api/chat/messages/[id]`        |
| Send button not working   | Check message input is not empty, verify `/api/chat/messages/[id]` POST |
| Status indicator wrong    | Check mock user status in `src/types/chat.ts`                           |
| Search not working        | Check search input is connected to filter logic in Sidebar              |
| Dark mode not applied     | Verify `dark:` Tailwind classes in component JSX                        |

---

## 📚 Documentation Files

- **REAL_TIME_CHAT_SETUP.md** - Detailed architecture and setup guide
- **REAL_TIME_CHAT_COMPLETE.md** - Full implementation details
- **REAL_TIME_CHAT_QUICK_REFERENCE.md** - This file (quick lookup)

---

## 💡 Examples

### Starting a New Conversation (User Perspective)

1. Navigate to `/dashboard/chats`
2. See "Messages" tab with existing conversations
3. Click "Users" tab
4. Find "Student 1" and click "Chat" button
5. New conversation is created
6. Switched to "Messages" tab showing the new conversation
7. Click the conversation to open chat
8. Messages load and display

### Sending a Message (User Perspective)

1. Conversation is open on the right
2. Type "Hello Student!" in message input
3. Press Enter
4. Message sends to API
5. API creates message and returns it
6. Message appears in blue on right side
7. Auto-scrolls to show latest message

### Searching (User Perspective)

1. Type "Student" in search box
2. Sidebar filters:
   - Messages tab shows conversations with students
   - Users tab shows student users
3. Results update in real-time as you type

---

## 🎯 Next Steps

1. **Test the system**: Navigate to `/dashboard/chats` and try all features
2. **Check API responses**: Open DevTools → Network tab to see API calls
3. **Review code**: Look at components to understand the flow
4. **Plan enhancements**: Decide which future features to implement first
5. **Integration**: Connect to real database when ready

---

**Current User**: admin-1 (Hardcoded, replace with session integration)
**Last Updated**: Implementation complete
