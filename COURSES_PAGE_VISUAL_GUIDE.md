# Courses Page - Visual UI Guide

## 📐 Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     HEADER SECTION                          │
│  "All Courses"                                              │
│  "Browse our comprehensive library..."                      │
├─────────────────────────────────────────────────────────────┤
│                    SEARCH BAR                               │
│  🔍 [Search courses by title, instructor...]  ✕            │
├─────────────────────────────────────────────────────────────┤
│                  CONTROLS ROW                               │
│  Showing 24 of 50 courses │ Sort by [Newest ▼] │ ≡ ≣ ⚙    │
├─────────────────────────────────────────────────────────────┤
│                  FILTERS (Collapsible)                      │
│  Course Type:  ○ All Courses (50)                          │
│               ◉ Free Courses (20)                          │
│               ○ Paid Courses (30)                          │
│  [Clear All Filters]                                       │
├─────────────────────────────────────────────────────────────┤
│                    COURSES GRID                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Course 1   │  │ Course 2   │  │ Course 3   │           │
│  │ [IMAGE]    │  │ [IMAGE]    │  │ [IMAGE]    │           │
│  │ Title      │  │ Title      │  │ Title      │           │
│  │ Instructor │  │ Instructor │  │ Instructor │           │
│  │ Stats      │  │ Stats      │  │ Stats      │           │
│  │ [BUTTONS]  │  │ [BUTTONS]  │  │ [BUTTONS]  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Course 4   │  │ Course 5   │  │ Course 6   │           │
│  │ ...        │  │ ...        │  │ ...        │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Grid View Card Design

### Hoverable Course Card

```
┌──────────────────────────┐
│    [COURSE IMAGE]        │ ← Image hover: scale 1.1
│    ┌────────────────┐    │
│    │ $99   (badge) │    │ ← Price badge (top-right)
│    └────────────────┘    │
├──────────────────────────┤
│ Course Title Here        │ ← Hover: color purple
│ (max 2 lines)            │
├──────────────────────────┤
│ 👤 Instructor Name       │ ← With profile image
│ (truncated if long)      │
├──────────────────────────┤
│ 📚 24 Lessons            │
│ 👥 150 Students          │
│ ⭐ 4.5 (32 reviews)     │
├──────────────────────────┤
│ [ENROLL NOW →] [LEARN>]  │
└──────────────────────────┘

Dimensions:
- Width: Full grid column
- Height: Auto flex
- Image height: 224px
- Padding: 24px (1.5rem)
- Border radius: 16px
- Shadow: lg on hover, 2xl
```

---

## 📱 List View Card Design

### Horizontal Course Card

```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────────┐                                            │
│ │              │ Course Title                               │
│ │   IMAGE      │ 👤 Instructor Name                        │
│ │   300x200    │ Lorem ipsum dolor sit amet, consectetur.   │
│ │              │                                            │
│ │              │ 📚 24 Lessons   👥 150   ⭐ 4.5 (32)    │
│ │              │                                            │
│ └──────────────┘ [ENROLL NOW →] [LEARN MORE]              │
│                                                             │
│ Price: $99 (right aligned badge)                           │
└─────────────────────────────────────────────────────────────┘

Layout:
- Image: 25% width (flex-shrink-0)
- Content: 75% width (flex-grow)
- Height: Auto
- Min height: 200px
- Padding: 24px
- Responsive: Stack on mobile
```

---

## 🔍 Search & Filter Section

### Search Bar

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search courses by title, instructor...         ✕      │
└──────────────────────────────────────────────────────────┘

Features:
- Placeholder text visible when empty
- Magnifying glass icon (left)
- X button appears when typing (right)
- Background: Light/dark mode aware
- Border: Gray 200/700
- Focus: Ring 2 purple-500
- Padding: 14px left/right
```

### Sort Dropdown

```
┌──────────────────────────┐
│ Sort by: Newest       ▼  │
├──────────────────────────┤
│ ✓ Newest               │
│   Most Popular        │
│   Highest Rated       │
│   Price: Low to High  │
│   Price: High to Low  │
└──────────────────────────┘
```

### Filter Panel

```
┌─────────────────────────────────────────────────────────┐
│ COURSE TYPE                                             │
│                                                         │
│ ◉ All Courses                                (50)      │
│                                                         │
│ ○ Free Courses                               (20)      │
│                                                         │
│ ○ Paid Courses                               (30)      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [Clear All Filters]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎛️ Control Bar

```
┌──────────────────────────────────────────────────────────┐
│ Showing 24 of 50 courses │ Sort by [Newest ▼] │ ≡ ≣ ⚙  │
└──────────────────────────────────────────────────────────┘

Components:
├─ Results Count (left)
│  "Showing 24 of 50 courses"
│
├─ Sort Dropdown (center)
│  "Sort by: [Newest ▼]"
│
└─ View Controls (right)
   [≡] Grid view button
   [≣] List view button
   [⚙] Filters button
```

---

## 🎯 Empty State

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ┌─────────────┐                        │
│              │   🔍        │                        │
│              └─────────────┘                        │
│                                                      │
│         No courses found                            │
│                                                      │
│  We couldn't find any courses matching              │
│  "React" with the selected filters.                 │
│                                                      │
│        [X Clear all filters]                        │
│                                                      │
└──────────────────────────────────────────────────────┘

Icon: Large search icon
Text: Centered, gray color
Button: Purple background
```

---

## 📦 Course Card Components Breakdown

### Price Badge

```
┌──────────────┐
│   $99        │ ← Appears in top-right of image
│              │   Purple background
│              │   White text
│              │   Bold font
└──────────────┘
```

### Instructor Card

```
[👤] John Doe ← Profile image (40x40)
     Name displayed to the right
```

### Statistics Row

```
📚 24 Lessons  |  👥 150 Students  |  ⭐ 4.5
Purple icon    Gray text            Star icon
                                    (optional)
```

### Action Buttons

```
[ENROLL NOW →]     ← Full width, purple background
                      White text, right arrow icon

[LEARN MORE]       ← Full width, bordered
                      Purple text, gray background
```

---

## 🎨 Color Palette

### Light Mode

```
Background:     #f3f4f6 (Gray-50)
Cards:          #ffffff (White)
Text Primary:   #111827 (Gray-900)
Text Secondary: #6b7280 (Gray-500)
Borders:        #e5e7eb (Gray-200)
Accent:         #9333ea (Purple-600)
Hover:          #7e22ce (Purple-700)
```

### Dark Mode

```
Background:     #0b1121 (Custom dark)
Cards:          #15203b (Custom blue)
Text Primary:   #f3f4f6 (Gray-100)
Text Secondary: #9ca3af (Gray-400)
Borders:        #374151 (Gray-700)
Accent:         #a855f7 (Purple-500)
Hover:          #9333ea (Purple-600)
```

### Status Colors

```
Success:        #10b981 (Green-500)
Warning:        #f59e0b (Amber-500)
Error:          #ef4444 (Red-500)
Info:           #3b82f6 (Blue-500)
```

---

## 📐 Responsive Breakpoints

### Mobile (< 768px)

```
┌─────────────────────────┐
│  ALL COURSES            │
│  Browse our...          │
├─────────────────────────┤
│ 🔍 [Search...] ✕       │
├─────────────────────────┤
│ Showing 10 of 50        │
├─────────────────────────┤
│ [Sort by ▼] [⚙]        │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │  [COURSE 1]         │ │
│ │  (full width)       │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │  [COURSE 2]         │ │
│ │  (full width)       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌────────────────────────────────────┐
│     ALL COURSES                    │
│     Browse our comprehensive...    │
├────────────────────────────────────┤
│ 🔍 [Search courses by...]     ✕   │
├────────────────────────────────────┤
│ Results | Sort by [Newest ▼] | ≡ ≣│
├────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐ │
│ │  COURSE 1    │  │  COURSE 2    │ │
│ │  (2 columns) │  │  (2 columns) │ │
│ └──────────────┘  └──────────────┘ │
│ ┌──────────────┐  ┌──────────────┐ │
│ │  COURSE 3    │  │  COURSE 4    │ │
│ │              │  │              │ │
│ └──────────────┘  └──────────────┘ │
└────────────────────────────────────┘
```

### Desktop (> 1024px)

```
┌────────────────────────────────────────────────────────┐
│           ALL COURSES                                  │
│           Browse our comprehensive...                 │
├────────────────────────────────────────────────────────┤
│ 🔍 [Search courses by...]                       ✕    │
├────────────────────────────────────────────────────────┤
│ Results | Sort by [Newest ▼] | ≡ ≣ ⚙               │
├────────────────────────────────────────────────────────┤
│ ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│ │ COURSE 1  │  │ COURSE 2  │  │ COURSE 3  │         │
│ │(3 columns)│  │(3 columns)│  │(3 columns)│         │
│ └───────────┘  └───────────┘  └───────────┘         │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐         │
│ │ COURSE 4  │  │ COURSE 5  │  │ COURSE 6  │         │
│ │           │  │           │  │           │         │
│ └───────────┘  └───────────┘  └───────────┘         │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Animation Effects

### Hover Effects

```
Card Hover:
├─ Shadow: lg → 2xl
├─ Transform: translate -y-2 (move up)
└─ Duration: 300ms

Image Hover:
├─ Scale: 1 → 1.1 (zoom in)
├─ Gradient Overlay: 0 → 100% opacity
└─ Duration: 500ms

Button Hover:
├─ Background: color change
├─ Scale: 1 → 1.05
└─ Duration: 200ms
```

### Loading State

```
Skeleton Animation:
├─ Base: bg-gray-200 dark:bg-gray-700
├─ Animation: animate-pulse
├─ Direction: Smooth fade in/out
└─ Duration: 2s infinite

Cards: 4 skeleton cards displayed
```

---

## 🔔 State Indicators

### Active States

```
Selected Filter Button:
  Background: Purple-600
  Text: White
  Shadow: md shadow-purple-500/30

Active View Mode:
  Background: Purple-600
  Text: White
  Icon: White
```

### Disabled States

```
Clear Button (when nothing to clear):
  Opacity: 50%
  Cursor: not-allowed
  Hover: No change
```

### Focus States

```
Keyboard Focus:
  Ring: 2px
  Color: Purple-500
  Offset: 2px
```

---

## 📊 Statistics Display

### Results Count Row

```
┌─────────────────────────────────┐
│ Showing 24 of 50 courses        │
└─────────────────────────────────┘

Format: "Showing [filtered] of [total] courses"
Color: Gray-600 dark:gray-400
```

### Filter Statistics

```
Free Courses      (20)  ← Count updates live
Paid Courses      (30)  ← Based on filter selection
All Courses       (50)  ← Total always shown
```

---

## 🎯 Button Styles

### Primary Button

```
[ENROLL NOW →]

├─ Background: Purple-600
├─ Hover: Purple-700
├─ Text: White
├─ Icon: ArrowRight (right side)
├─ Padding: 12px 16px (py-3 px-4)
├─ Width: Full width in card
└─ Radius: 8px
```

### Secondary Button

```
[LEARN MORE]

├─ Background: Gray-50/Transparent
├─ Border: 2px Purple-600
├─ Hover: Gray-100 bg with purple text
├─ Text: Purple-600
├─ Padding: 10px 16px (py-2.5 px-4)
├─ Width: Full width in card
└─ Radius: 8px
```

### Filter Button

```
[All] [Free] [Paid]

Selected:
├─ Background: Purple-600
├─ Text: White
├─ Shadow: md

Unselected:
├─ Background: Gray-100
├─ Text: Gray-600
├─ Hover: Gray-200
```

---

## 🌙 Dark Mode Indicators

### Dark Mode Active

```css
/* Apply to affected elements */
.dark {
  background-color: #0b1121; /* Main bg */
  color: #f3f4f6; /* Text */
}

.dark .card {
  background-color: #15203b; /* Cards */
  border-color: #374151; /* Borders */
}

.dark .text-secondary {
  color: #9ca3af; /* Secondary text */
}
```

---

## 📱 Touch-Friendly Design

### Mobile Interactions

```
Buttons:
├─ Min height: 44px
├─ Min width: 44px
├─ Padding: 12px horizontal

Inputs:
├─ Min height: 44px
├─ Tap targets: 48x48px spacing
└─ Font: 16px (prevents zoom)

Spacing:
├─ Vertical: 16px between sections
├─ Horizontal: 12px padding
└─ Gap: 8px between elements
```

---

## ✅ Accessibility Features

### Text Alternatives

```
All images: Alt text provided
Icons: Meaningful context from text
Color: Not sole indicator (+ icon/text)
```

### Keyboard Navigation

```
Tab order: Left to right, top to bottom
Focus: Visible ring indicator
Skip links: Optional (not shown)
Forms: Proper labels (radio buttons)
```

### Screen Reader Support

```
Semantic HTML: <button>, <input>, <select>
ARIA Labels: Where needed
Headings: Proper hierarchy (h1 → h3)
Lists: Proper list markup
```

---

**Last Updated**: November 2025  
**Version**: 1.0.0
