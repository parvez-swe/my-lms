# Courses Page Implementation Details

## File Location

```
src/app/(client)/courses/page.tsx
```

## Component Architecture

### Top-Level Component: `CoursesPage`

Main component handling:

- State initialization and management
- Data fetching from API
- Filter logic with useMemo
- Conditional rendering (loading, error, content states)
- Layout structure

### Sub-Component: `CourseCard`

Props interface:

```typescript
{
  course: Course;
  viewMode: "grid" | "list";
}
```

Renders:

- Grid view: Vertical card with image on top
- List view: Horizontal layout with image on left

---

## Feature Implementation Details

### 1. Search Functionality

**Implementation**: useMemo hook

```typescript
const filteredAndSortedCourses = useMemo(() => {
  let result = [...courses];

  // Search Filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.tutor.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
    );
  }
  // ... additional filtering
}, [courses, searchQuery, priceFilter, sortBy]);
```

**Features**:

- Case-insensitive matching
- Searches across: title, tutor name, description
- Empty trim check to prevent empty searches
- Real-time as user types

### 2. Price Filter

**State**: `priceFilter: "all" | "free" | "paid"`

**Logic**:

```typescript
if (priceFilter !== "all") {
  result = result.filter((course) => course.pricingType === priceFilter);
}
```

**Display Statistics**:

```typescript
const stats = useMemo(() => {
  return {
    total: courses.length,
    free: courses.filter((c) => c.pricingType === "free").length,
    paid: courses.filter((c) => c.pricingType === "paid").length,
  };
}, [courses]);
```

### 3. Sorting Logic

**State**: `sortBy: "newest" | "popular" | "rating" | "price-low" | "price-high"`

**Implementation**:

```typescript
result.sort((a, b) => {
  switch (sortBy) {
    case "popular":
      return b.students - a.students;
    case "price-low":
      const priceA = parseInt(a.price.replace("$", "")) || 0;
      const priceB = parseInt(b.price.replace("$", "")) || 0;
      return priceA - priceB;
    case "price-high":
      // Reverse logic for high to low
      return priceHigh_B - priceHigh_A;
    case "rating":
      return (b.ratingAverage || 0) - (a.ratingAverage || 0);
    case "newest":
    default:
      return 0; // Maintain original order
  }
});
```

### 4. View Mode Toggle

**State**: `viewMode: "grid" | "list"`

**Grid View CSS**:

```typescript
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
```

**List View CSS**:

```typescript
className = "space-y-6";
```

**Conditional Rendering in CourseCard**:

```typescript
if (viewMode === "list") {
  return (
    <div className="flex flex-col sm:flex-row">{/* List view layout */}</div>
  );
}
// Grid view layout
return <div className="flex flex-col">{/* Grid view layout */}</div>;
```

### 5. Dynamic Statistics

**Displayed Elements**:

- Total courses: `courses.length`
- Filtered results: `filteredAndSortedCourses.length`
- Free course count: From stats object
- Paid course count: From stats object

**Update Trigger**: Automatically updates when filters/search change

### 6. Loading State

**Implementation**:

```typescript
if (loading) {
  return (
    <div className="py-24 bg-gray-50 dark:bg-[#0c1427] min-h-screen">
      {/* Skeleton loaders with animate-pulse */}
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
    </div>
  );
}
```

**Features**:

- Full screen loader
- Animated skeleton cards
- Matches final layout proportions

### 7. Error Handling

**API Error**:

```typescript
try {
  const response = await fetch("/api/courses");
  const result = await response.json();
  if (!result.success) {
    setError("Failed to load courses");
  }
} catch (err) {
  setError("Failed to load courses");
}
```

**Display**:

```typescript
{
  error && (
    <div className="text-center py-20">
      <p className="text-red-500 text-lg font-medium">{error}</p>
    </div>
  );
}
```

### 8. Empty State Handler

**Conditions**:

1. No courses in database
2. Search returns no results
3. Filter combination returns no courses

**Display**:

```typescript
{filteredAndSortedCourses.length > 0 ? (
  // Render courses
) : (
  <div className="text-center py-20">
    <div className="inline-block p-6 rounded-full bg-gray-100 dark:bg-[#15203b] mb-4">
      <Search size={40} className="text-gray-400" />
    </div>
    <h3>No courses found</h3>
    {/* Clear filters button */}
  </div>
)}
```

---

## UI Components Used

### Icons (from lucide-react)

- `Search`: Search input icon
- `Filter`: Filter button icon
- `X`: Clear button
- `BookOpen`: Lessons icon
- `Users`: Students count icon
- `ArrowRight`: Button arrow
- `Star`: Rating display
- `ChevronDown`: Select dropdown
- `Grid3x3`: Grid view toggle
- `List`: List view toggle

### Next.js Components

- `Image`: Course images with optimization
- `Link`: Navigation links

---

## Responsive Breakpoints

| Breakpoint   | Width   | Grid Columns | Applied          |
| ------------ | ------- | ------------ | ---------------- |
| Mobile       | <768px  | 1            | Default          |
| Tablet (md)  | ≥768px  | 2            | `md:` prefix     |
| Desktop (lg) | ≥1024px | 3            | `lg:` prefix     |
| XL (2xl)     | ≥1536px | Max 1320px   | `2xl:` container |

### Mobile-First CSS

All Tailwind classes follow mobile-first approach:

- Base class = mobile style
- `md:` = tablet override
- `lg:` = desktop override

---

## Performance Considerations

### Memoization

```typescript
const filteredAndSortedCourses = useMemo(() => {
  // Complex filtering and sorting logic
}, [courses, searchQuery, priceFilter, sortBy]);
```

**Benefits**:

- Recalculates only when dependencies change
- Prevents unnecessary re-renders
- Efficient for large course lists

### Image Optimization

```typescript
<Image
  src={course.image || "/images/courses/course1.jpg"}
  alt={course.title}
  className="w-full h-full object-cover"
  width={400}
  height={224}
/>
```

**Optimization**:

- Fixed dimensions prevent layout shift
- Next.js automatic image optimization
- WebP format for supported browsers
- Lazy loading by default

### Conditional Rendering

```typescript
{!loading && !error && (
  // Only render when data is ready
)}
```

---

## Color Theme

### Light Mode

- Background: `#f3f4f6` (gray-50)
- Cards: `#ffffff` (white)
- Text: `#111827` (gray-900)
- Accent: `#9333ea` (purple-600)

### Dark Mode

- Background: `#0b1121` (custom)
- Cards: `#15203b` (custom)
- Text: `#f3f4f6` (gray-100)
- Accent: `#a855f7` (purple-500)

### Interactive States

- Hover: Scale, shadow, color changes
- Active: Full purple background
- Focus: Ring 2 purple-500
- Disabled: Reduced opacity

---

## Data Flow

```
Fetch /api/courses
         ↓
   Set courses state
         ↓
   Input: searchQuery, priceFilter, sortBy
         ↓
   useMemo (filteredAndSortedCourses)
         ↓
   Render CourseCard components
```

---

## Future Enhancement Opportunities

### Easy to Add

1. **Difficulty Filter**: Add select with `["Beginner", "Intermediate", "Advanced"]`
2. **Category Filter**: Add checkboxes for course categories
3. **Saved Courses**: Add heart icon and localStorage persistence
4. **Pagination**: Add page numbers or "Load More" button

### Medium Complexity

1. **Advanced Search**: Elasticsearch-like search
2. **Filters Persistence**: URL parameters for shareable links
3. **Course Comparison**: Multi-select and side-by-side view
4. **Recently Viewed**: Track and display last viewed courses

### Complex

1. **AI Recommendations**: Based on user history
2. **Course Analytics**: View engagement metrics
3. **Advanced Analytics Dashboard**: For course creators
4. **Custom Learning Paths**: Suggested course sequences

---

## Testing Scenarios

### Search Functionality

- [ ] Search by course title
- [ ] Search by instructor name
- [ ] Search with special characters
- [ ] Clear search with X button
- [ ] Empty search (no results)

### Filtering

- [ ] Filter free courses
- [ ] Filter paid courses
- [ ] Show all courses
- [ ] Stats update correctly
- [ ] Combined search + filter

### Sorting

- [ ] Sort by newest
- [ ] Sort by popularity
- [ ] Sort by rating
- [ ] Sort by price low to high
- [ ] Sort by price high to low

### View Modes

- [ ] Toggle to list view
- [ ] Toggle to grid view
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

### Edge Cases

- [ ] No courses available
- [ ] API error handling
- [ ] Loading state display
- [ ] Empty search results
- [ ] Long course titles truncation
- [ ] Missing course images
- [ ] Missing instructor images
- [ ] Zero rating display

---

## Installation & Setup

### Dependencies

```bash
npm install
# Already included:
# - next
# - react
# - lucide-react
# - typescript
```

### Running Locally

```bash
npm run dev
# Navigate to http://localhost:3000/courses
```

### Building for Production

```bash
npm run build
npm start
```

---

## Troubleshooting

### Courses Not Loading

1. Check `/api/courses` endpoint
2. Verify MongoDB connection
3. Check browser console for errors
4. Verify course data exists in database

### Sorting Not Working

1. Verify course data has required fields
2. Check price format (should include $)
3. Check ratingAverage field existence

### Images Not Displaying

1. Verify image paths in database
2. Check public folder for fallback images
3. Verify Next.js Image component props

### Performance Issues

1. Check number of courses (>1000 may need pagination)
2. Verify image sizes are optimized
3. Consider adding virtual scrolling for large lists
