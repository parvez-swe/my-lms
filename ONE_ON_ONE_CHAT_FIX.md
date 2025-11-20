# One-On-One Chat System Implementation

## Problem Statement

The chat system was a **group chat** where all messages were visible to everyone. The requirement is to convert it to **one-on-one private chats** where:

- Visitors can only see their own chat with Admin
- Admin can see individual chats with each visitor/student
- Messages are strictly private between two participants

## Solution Overview

The system has been completely restructured to enforce **strict one-on-one conversations**:

### Key Changes

#### 1. **Type System Update** (`src/types/chat.ts`)

Added role support for "visitor" and explicit participant tracking:

```typescript
// Added to Conversation interface
export interface Conversation {
  // ... existing fields ...

  // NEW FIELDS for one-on-one enforcement:
  participantIds: string[]; // Explicit user IDs
  participantRoles: ("admin" | "instructor" | "student" | "visitor")[];
  lastMessageSenderId?: string; // Track who sent last message
}

// Added visitor role to User
export interface User {
  role: "admin" | "instructor" | "student" | "visitor"; // NEW: visitor role
  // ... rest of fields ...
}

// Mock data updated to include these fields:
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["admin-1", "student-1"],
    participantNames: ["John Admin", "Sarah Smith"],
    participantIds: ["admin-1", "student-1"], // NEW
    participantRoles: ["admin", "student"], // NEW
    // ... other fields ...
  },
];
```

#### 2. **API Endpoint: GET /api/chat/conversations**

Now filters to return **ONLY one-on-one conversations** for the current user:

**File:** `src/app/api/chat/conversations/route.ts`

```typescript
// Only returns conversations where:
// 1. participants.length === 2  (ONE-ON-ONE ONLY)
// 2. currentUserId is a participant

const userConversations = mockConversations.filter((conv) => {
  // ONE-ON-ONE CHATS ONLY: exactly 2 participants
  if (conv.participants.length !== 2) return false;

  // User must be a participant
  return conv.participants.includes(currentUserId);
});
```

**User Context:** Gets current user from headers:

- `x-user-id`: User's unique ID
- `x-user-role`: User's role (admin, student, visitor, instructor)

#### 3. **API Endpoint: POST /api/chat/create-conversation**

Creates **one-on-one conversations only**:

**File:** `src/app/api/chat/create-conversation/route.ts`

```typescript
// Ensures:
// 1. Exactly 2 participants (one-on-one)
// 2. No duplicates between same users
// 3. No self-conversations
// 4. Stores explicit participant IDs and roles

// Check if ONE-ON-ONE conversation already exists
const existingConversation = mockConversations.find(
  (conv) =>
    conv.participants.length === 2 && // ONE-ON-ONE ONLY
    conv.participants.includes(currentUserId) &&
    conv.participants.includes(recipientId)
);
```

#### 4. **API Endpoint: GET/POST /api/chat/messages/[conversationId]**

**Access Control:** User can only see/send messages if they're a participant:

**File:** `src/app/api/chat/messages/[conversationId]/route.ts`

```typescript
// GET: User must be a participant
if (!conversation.participants.includes(currentUserId)) {
  return NextResponse.json(
    { error: "You don't have access to this conversation" },
    { status: 403 }
  );
}

// POST: User must be a participant
if (!conversation.participants.includes(currentUserId)) {
  return NextResponse.json(
    { error: "You don't have access to this conversation" },
    { status: 403 }
  );
}
```

#### 5. **FloatingChatbot Component** (`src/components/FloatingChatbot/index.tsx`)

Completely rewritten to work with **visitor role** for public visitors:

```typescript
// Generate unique visitor ID (stored in localStorage)
const generateVisitorId = (): string => {
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = `visitor-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

// Initialize conversation with Admin
const initializeConversation = async () => {
  const response = await fetch("/api/chat/conversations", {
    headers: {
      "x-user-id": visitorId,
      "x-user-role": "visitor",
    },
  });

  // If no conversation exists, create ONE-ON-ONE with admin
  if (!data.conversations || data.conversations.length === 0) {
    const createResponse = await fetch("/api/chat/create-conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": visitorId,
        "x-user-role": "visitor",
      },
      body: JSON.stringify({
        recipientId: "admin-1", // ALWAYS chat with admin
      }),
    });
  }
};

// Send message with user context headers
const handleSendMessage = async (e: React.FormEvent) => {
  const response = await fetch(`/api/chat/messages/${conversationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": visitorId,
      "x-user-role": "visitor",
      "x-user-name": "Website Visitor",
      "x-user-avatar": "/images/users/user31.jpg",
    },
    body: JSON.stringify({ text: messageText }),
  });
};
```

**Key Features:**

- Generates unique visitor ID per browser session
- Creates/reuses ONE-ON-ONE conversation with Admin
- Only shows messages from that specific conversation
- Message display correctly identifies sender vs receiver

## Architecture Flow

### Visitor (Public Page) Flow

```
1. Visitor opens website
   ↓
2. FloatingChatbot initializes
   ├─ Generate unique visitor_id (stored in localStorage)
   ├─ Send GET /api/chat/conversations?x-user-id={visitor_id}
   └─ Response: [] (no existing conversations)
   ↓
3. Create ONE-ON-ONE conversation
   ├─ POST /api/chat/create-conversation
   │  └─ recipientId: "admin-1"
   └─ Response: { id: "conv-xyz", participants: [visitor_id, admin-1] }
   ↓
4. Visitor sends message
   ├─ POST /api/chat/messages/conv-xyz
   │  └─ text: "Hello, I have a question"
   └─ API verifies visitor_id is in participants
   ↓
5. Message stored in database (only visible to admin & this visitor)
   ↓
6. Admin sees message in /dashboard/chats
```

### Admin (Dashboard) Flow

```
1. Admin logs in → visits /dashboard/chats
   ↓
2. Page loads with x-user-id: "admin-1", x-user-role: "admin"
   ↓
3. GET /api/chat/conversations
   └─ Returns: ALL one-on-one conversations with admin as participant
      ├─ conv-1: admin-1 ↔ visitor-1234
      ├─ conv-2: admin-1 ↔ student-sarah
      └─ conv-3: admin-1 ↔ student-mike
   ↓
4. Admin selects one conversation (e.g., with visitor-1234)
   ↓
5. GET /api/chat/messages/conv-1
   └─ Returns ONLY messages in this ONE-ON-ONE conversation
   ↓
6. Admin sends message
   ├─ POST /api/chat/messages/conv-1
   │  └─ senderId: "admin-1"
   └─ Message stored and visible to both participants
   ↓
7. Visitor sees admin's response in FloatingChatbot immediately
```

## Data Privacy & Access Control

### Conversation Visibility

| User Type | Can See               | Cannot See              |
| --------- | --------------------- | ----------------------- |
| Visitor A | Their chat with Admin | Chats of other visitors |
| Visitor B | Their chat with Admin | Chats of other visitors |
| Admin     | All one-on-one chats  | Nothing restricted      |
| Student   | Their chat with Admin | Other students' chats   |

### Message Visibility

```typescript
// API enforces: User can only access messages in conversations
// where they are a participant

if (!conversation.participants.includes(currentUserId)) {
  // Reject with 403 Forbidden
}
```

## Database Schema (Mock)

```typescript
// Conversation (ONE-ON-ONE ONLY)
{
  id: "conv-1",
  participants: ["admin-1", "visitor-12345"],           // Exactly 2
  participantNames: ["John Admin", "Website Visitor"],
  participantIds: ["admin-1", "visitor-12345"],
  participantRoles: ["admin", "visitor"],
  lastMessage: "Thanks for your help!",
  lastMessageTime: 2025-11-20T10:30:00Z,
  lastMessageSenderId: "visitor-12345",
  createdAt: 2025-11-20T09:00:00Z,
  updatedAt: 2025-11-20T10:30:00Z,
}

// Message (filtered by conversation)
{
  id: "msg-1",
  conversationId: "conv-1",              // Linked to specific conversation
  senderId: "visitor-12345",             // Who sent it
  senderName: "Website Visitor",
  senderAvatar: "/images/users/user31.jpg",
  text: "I have a question about pricing",
  timestamp: 2025-11-20T10:20:00Z,
  isRead: true,
}
```

## Implementation Checklist

- ✅ Type system updated with `participantIds`, `participantRoles`
- ✅ Mock data includes new fields
- ✅ GET /api/chat/conversations filters for one-on-one only
- ✅ POST /api/chat/create-conversation prevents groups & duplicates
- ✅ GET /api/chat/messages validates user is participant
- ✅ POST /api/chat/messages validates user is participant & updates last message
- ✅ FloatingChatbot generates unique visitor IDs
- ✅ FloatingChatbot creates one-on-one chats with admin
- ✅ FloatingChatbot sends user context headers
- ✅ Message display correctly identifies sender vs receiver

## Testing One-On-One Chats

### Test 1: Visitor Chat

```bash
# 1. Open homepage in private/incognito window
http://localhost:3000/

# 2. Click floating chat button (bottom-right)

# 3. Send message: "Hello from visitor"

# 4. Check localStorage for visitor_id
# localStorage.getItem('visitor_id')
# → Should show: "visitor-1700000000000-abc123"
```

### Test 2: Admin Dashboard

```bash
# 1. Login as admin → go to /dashboard/chats

# 2. Sidebar should show only conversations where admin is participant

# 3. Select conversation with the visitor

# 4. Should see ONLY messages from that visitor (not other visitors' messages)

# 5. Send message: "Hello, how can I help?"

# 6. Switch back to public page (different tab)
# → Visitor should see the admin's response in FloatingChatbot
```

### Test 3: Privacy Verification

```bash
# 1. Two browsers/private windows
# Browser A: Visitor 1 (localStorage: visitor-aaa)
# Browser B: Visitor 2 (localStorage: visitor-bbb)

# 2. Each sends a message through FloatingChatbot

# 3. Admin sees 2 separate conversations in /dashboard/chats

# 4. Visitor 1 cannot see Visitor 2's messages

# 5. Each visitor can only see their own one-on-one chat
```

## Migration from Group Chat

### What Changed

| Aspect          | Before                        | After                               |
| --------------- | ----------------------------- | ----------------------------------- |
| Conversations   | Multiple participants allowed | Exactly 2 participants (one-on-one) |
| Visibility      | All messages visible to all   | Only participant can see messages   |
| Access Control  | No user-level filtering       | Strict participant validation       |
| Visitor Support | Not supported                 | Full support with unique IDs        |
| Message Privacy | No privacy                    | Complete privacy                    |

### Breaking Changes

If you have existing **group chats** in the database:

- They will be **ignored** by the new API
- The system only returns/creates 2-participant conversations
- Existing group data is preserved but not accessible through the API

## Future Enhancements

- [ ] WebSocket for real-time message delivery instead of polling
- [ ] Typing indicators (show when other person is typing)
- [ ] Read receipts (show when messages are read)
- [ ] File/image uploads
- [ ] Conversation archiving
- [ ] Message search
- [ ] Emoji reactions
- [ ] Message editing/deletion
- [ ] Persistent database storage (currently using mock data)

## Troubleshooting

### Q: Visitor ID keeps changing

**A:** Make sure localStorage is not disabled:

```javascript
// Check in browser console
localStorage.getItem("visitor_id");
```

### Q: Visitor can see other visitors' messages

**A:** This shouldn't happen. Check:

- API returns 403 if user not in conversation participants
- FloatingChatbot passes correct `x-user-id` header
- Browser developer tools → Network → check request headers

### Q: Admin sees group messages instead of one-on-one

**A:** Old group chat data. The API filters automatically:

```typescript
if (conv.participants.length !== 2) return false; // Skip groups
```

### Q: Can't create conversation

**A:** Check:

- Recipient ID is provided
- Not creating conversation with self
- Headers include `x-user-id` and `x-user-role`

## Files Modified

1. **src/types/chat.ts**

   - Added `participantIds`, `participantRoles`, `lastMessageSenderId` to Conversation
   - Added "visitor" role to User
   - Updated mock data with new fields

2. **src/app/api/chat/conversations/route.ts**

   - Filters to ONE-ON-ONE only (`participants.length === 2`)
   - Validates user is participant

3. **src/app/api/chat/create-conversation/route.ts**

   - Enforces exactly 2 participants
   - Prevents duplicate conversations
   - Prevents self-conversations
   - Includes `participantIds` and `participantRoles`

4. **src/app/api/chat/messages/[conversationId]/route.ts**

   - GET: Validates user is participant
   - POST: Validates user is participant
   - Includes access control (403 Forbidden)

5. **src/components/FloatingChatbot/index.tsx**
   - Complete rewrite for visitor support
   - Generates unique visitor IDs
   - Creates one-on-one conversations with admin
   - Passes user context headers
   - Fixed message display logic

## Support

For issues or questions about the one-on-one chat implementation, refer to this document or check the code comments in each file.

---

**Status:** ✅ Implementation Complete  
**Last Updated:** November 20, 2025  
**Version:** 1.0
