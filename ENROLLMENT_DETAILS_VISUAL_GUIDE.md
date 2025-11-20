# Enrollment Details Page - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ← Back | Enrollment Details                    [Status Badge]   │
│  ID: 507f1f77bcf86cd799439011                                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LEFT COLUMN (66%)          │        RIGHT COLUMN (33%)         │
│                             │                                    │
│  ┌─────────────────────┐   │    ┌──────────────────────┐       │
│  │ Enrollment Info     │   │    │ Actions              │       │
│  │ - ID                │   │    │                      │       │
│  │ - Status            │   │    │ [Mark as Approved]  │       │
│  │ - Dates             │   │    │ [Mark as Rejected]  │       │
│  └─────────────────────┘   │    │                      │       │
│                             │    │ ─────────────────   │       │
│  ┌─────────────────────┐   │    │ [Download Details]  │       │
│  │ Student Info        │   │    │ [Delete Enrollment] │       │
│  │ - Name              │   │    │                      │       │
│  │ - Email             │   │    │ ℹ️  Notifications    │       │
│  │ - Phone             │   │    └──────────────────────┘       │
│  │ - Job               │   │                                    │
│  │ - Career Goal       │   │                                    │
│  │ - Address           │   │                                    │
│  └─────────────────────┘   │                                    │
│                             │                                    │
│  ┌─────────────────────┐   │                                    │
│  │ Course Info         │   │                                    │
│  │ - Title             │   │                                    │
│  │ - Description       │   │                                    │
│  │ - Duration          │   │                                    │
│  │ - Level             │   │                                    │
│  │ - Lessons           │   │                                    │
│  └─────────────────────┘   │                                    │
│                             │                                    │
│  ┌─────────────────────┐   │                                    │
│  │ Payment Info        │   │                                    │
│  │ - Method            │   │                                    │
│  │ - Amount            │   │                                    │
│  │ - bKash Details     │   │                                    │
│  │ - Payment Date      │   │                                    │
│  └─────────────────────┘   │                                    │
│                             │                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Enrollment Information Section

```
┌────────────────────────────────────────────┐
│ Enrollment Information                     │
├────────────────────────────────────────────┤
│                                            │
│  Enrollment ID           │  Status         │
│  507f1f77bcf86cd7...     │  [✓ Approved]   │
│                          │                 │
│  Enrollment Date         │  Enrolled At    │
│  📅 January 15, 2024     │  January 16,    │
│                          │  2024           │
│                          │                 │
└────────────────────────────────────────────┘
```

## Student Information Section

```
┌────────────────────────────────────────────┐
│ Student Information                        │
├────────────────────────────────────────────┤
│                                            │
│  Name          │ Current Job              │
│  John Doe      │ Software Developer       │
│                │                          │
│  Email         │ Career Goal              │
│  📧 john@...   │ 🎯 Remote Job            │
│                │                          │
│  Phone         │ Address                  │
│  📞 01700...   │ 📍 123 Main St           │
│                │    Dhaka, Dhaka          │
│                │                          │
└────────────────────────────────────────────┘
```

## Course Information Section

```
┌────────────────────────────────────────────┐
│ 📚 Course Information                      │
├────────────────────────────────────────────┤
│                                            │
│  Course Title                              │
│  Web Development Masterclass               │
│                                            │
│  Description                               │
│  Learn modern web development with React, │
│  Node.js, and MongoDB...                  │
│                                            │
│  ┌─────────────┬──────────────┬─────────┐ │
│  │ Duration    │ Level        │ Lessons │ │
│  │ 12 weeks    │ Intermediate │ 48      │ │
│  └─────────────┴──────────────┴─────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

## Payment Information Section

```
┌────────────────────────────────────────────┐
│ 💳 Payment Information                     │
├────────────────────────────────────────────┤
│                                            │
│  Payment Method         │  Amount          │
│  bKash                  │  ৳ 2,500         │
│                         │                  │
│  bKash Number           │  Transaction ID  │
│  01700000000            │  TXN123456       │
│                         │                  │
│  Payment Date                              │
│  📅 January 16, 2024                       │
│                                            │
└────────────────────────────────────────────┘
```

## Actions Sidebar

```
┌────────────────────────┐
│ Actions                │
├────────────────────────┤
│                        │
│ Update Status          │
│ ┌────────────────────┐ │
│ │ ✓ Mark as Approved │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ ✗ Mark as Rejected │ │
│ └────────────────────┘ │
│                        │
│ ─────────────────────  │
│                        │
│ [📥 Download Details] │
│ [🗑️  Delete Enrollment]│
│                        │
│ ℹ️  Student will be    │
│    notified of status  │
│    changes via email.  │
│                        │
└────────────────────────┘
```

## Status Badges

```
┌──────────────────────────────────────────┐
│ Status Visualization                     │
├──────────────────────────────────────────┤
│                                          │
│  [⏱️ Pending]     (Yellow)               │
│  Waiting for admin review                │
│                                          │
│  [✓ Approved]     (Green)                │
│  Student enrolled, can access course     │
│                                          │
│  [✗ Rejected]     (Red)                  │
│  Application denied                      │
│                                          │
│  [✓ Completed]    (Blue)                 │
│  Course finished                         │
│                                          │
└──────────────────────────────────────────┘
```

## Mobile Responsive Layout

### Mobile (< 768px)

```
┌─────────────────────┐
│ ← Back              │
│ Enrollment Details  │
│ [Status Badge]      │
├─────────────────────┤
│                     │
│ Enrollment Info     │
│ (full width)        │
│                     │
│ Student Info        │
│ (full width)        │
│                     │
│ Course Info         │
│ (full width)        │
│                     │
│ Payment Info        │
│ (full width)        │
│                     │
│ Actions             │
│ (vertical stack)    │
│                     │
└─────────────────────┘
```

## Status Update Flow

```
Admin clicks action → Loading spinner → API call →
Success toast → Auto-refresh data → Updated display

If error → Error toast → User can retry
```

## Dark Mode Support

```
Light Mode (Default):
┌─────────────────────────────────┐
│ White backgrounds               │
│ Black/dark gray text            │
│ Color status badges             │
└─────────────────────────────────┘

Dark Mode:
┌─────────────────────────────────┐
│ Dark gray backgrounds           │
│ White/light gray text           │
│ Color status badges (adjusted)  │
└─────────────────────────────────┘
```

## Data Flow Diagram

```
User Clicks Row in List
        ↓
Navigate to [id] page
        ↓
useEffect triggered
        ↓
Check session (authenticated & admin)
        ↓
Fetch /api/enrollments/{id}
        ↓
API returns: enrollment + user + course
        ↓
Set data state
        ↓
Render UI with all sections
        ↓
Admin can take actions:
  - Update Status → PUT /api/enrollments/{id}
  - Delete → DELETE /api/enrollments/{id}
  - Download → Prepares data for export
        ↓
After action → Auto-refresh data
        ↓
Show success/error toast
        ↓
Update display
```

## Error States

```
Loading:
┌──────────────────┐
│ ⏳ Loading...    │
│ Loading enroll... │
└──────────────────┘

Not Found:
┌──────────────────┐
│ ❌ Error        │
│ Enrollment not   │
│ found            │
│ [Back to List]   │
└──────────────────┘

Unauthorized:
┌──────────────────┐
│ 🔒 Unauthorized │
│ [Login]          │
└──────────────────┘

Server Error:
┌──────────────────┐
│ ⚠️  Error        │
│ Failed to load    │
│ [Retry]          │
└──────────────────┘
```

## Key Colors

```
Status Colors:
- Pending: #FBBF24 (Yellow)
- Approved: #10B981 (Green)
- Rejected: #EF4444 (Red)
- Completed: #3B82F6 (Blue)

Action Colors:
- Primary: #9333EA (Purple) - for main actions
- Success: #10B981 (Green) - for approve
- Danger: #EF4444 (Red) - for reject/delete
- Info: #0EA5E9 (Blue) - for informational

Text Colors:
- Primary: #111827 (Dark Gray)
- Secondary: #6B7280 (Medium Gray)
- Tertiary: #9CA3AF (Light Gray)

Backgrounds:
- Primary: #FFFFFF (White)
- Secondary: #F9FAFB (Light Gray)
- Tertiary: #F3F4F6 (Lighter Gray)

Dark Mode:
- Primary: #1F2937 (Dark Gray)
- Secondary: #111827 (Darker Gray)
- Text: #F3F4F6 (Light Gray)
```

---

This visual guide represents the complete enrollment details page with all sections, responsive layouts, and visual hierarchy.
