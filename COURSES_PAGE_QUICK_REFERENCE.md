# Courses Page - Quick Reference Guide

## 🚀 Quick Start

### Access the Page

```
URL: http://localhost:3000/courses
```

### What's New

✅ Advanced search functionality  
✅ Multiple sorting options  
✅ Price type filtering  
✅ Grid/List view toggle  
✅ Real-time result count  
✅ Rating display  
✅ Dark mode support  
✅ Responsive design  
✅ Empty state handling

---

## 🔍 Search Features

### How to Search

1. Click the search input at the top
2. Type any keyword
3. Results filter in real-time
4. Click X to clear search

### What You Can Search

- Course titles
- Instructor names
- Course descriptions

### Example Searches

- "React" → finds all React courses
- "John Doe" → finds courses by John Doe
- "Web Development" → finds courses with that topic

---

## 🎯 Filtering Options

### Price Type Filter

1. Click "Filters" button
2. Select one of:
   - **All Courses**: All courses (default)
   - **Free Courses**: Only free/open courses
   - **Paid Courses**: Only paid courses
3. Stats show count for each option

### Clear Filters

Click **"Clear All Filters"** button to:

- Clear search
- Reset to "All Courses"
- Reset to default sort

---

## 📊 Sorting Methods

Click the **"Sort by"** dropdown to choose:

| Option                 | Result                         |
| ---------------------- | ------------------------------ |
| **Newest**             | Default order (recently added) |
| **Most Popular**       | Most enrolled students first   |
| **Highest Rated**      | Best rated courses first       |
| **Price: Low to High** | Cheapest courses first         |
| **Price: High to Low** | Most expensive first           |

---

## 👁️ View Modes

### Toggle Between Views

- **Grid Icon**: 3-column grid layout (best for browsing)
- **List Icon**: Horizontal card layout (see more details)

### Grid View (Default)

- Visual browsing experience
- Shows course preview
- Hover animations
- **Responsive**: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)

### List View

- See more course info
- Better for comparison
- Shows description preview
- Good for reading course details

---

## 📊 Course Card Information

### Displayed Data

```
┌─────────────────────────────────┐
│  COURSE IMAGE                   │
├─────────────────────────────────┤
│  Course Title                   │
│  Instructor: [image] John Doe   │
│  📚 24 Lessons  👥 150 Students │
│  ⭐ 4.5 (32 reviews)           │
├─────────────────────────────────┤
│  [ENROLL NOW]  [LEARN MORE]     │
└─────────────────────────────────┘
```

### Price Badge

- Top right corner of course image
- Shows course price (e.g., "$99" or "$0")
- Always visible

### Rating Display

- Only shows if rating exists
- Star icon with rating number
- Shows review count in parentheses

---

## 📈 Statistics Display

**Top of page shows:**

- Total courses: All courses in system
- Filtered courses: Current results
- Free courses: Available free options
- Paid courses: Available paid options

Updates automatically as you:

- Search
- Change filters
- Change sort order

---

## 🎨 Dark Mode

The page automatically adapts to:

- System dark mode preference
- Manual dark mode toggle in settings

**Colors:**

- Light mode: Clean whites and grays
- Dark mode: Deep blues and purples

---

## 📱 Mobile Friendly

### Mobile (< 768px)

- Single column grid
- Stacked search/filter controls
- Touch-friendly buttons
- Full-width cards

### Tablet (768px - 1024px)

- 2-column grid
- Responsive layout
- Adjusted spacing

### Desktop (> 1024px)

- Full 3-column grid
- Side-by-side controls
- Maximum 1320px width
- Premium spacing

---

## ⚡ Performance

### Features

- Fast loading
- Smooth filtering
- Instant search
- No page refresh needed

### What Makes It Fast

- Optimized images
- Memoized calculations
- Efficient rendering
- Smart caching

---

## 🎯 Common Tasks

### Find Specific Course

1. Type course name in search
2. Results appear instantly
3. Click "Enroll Now" or "Learn More"

### Browse Free Courses

1. Click "Filters"
2. Select "Free Courses"
3. See only free options
4. Optionally search within free courses

### Sort by Price

1. Open "Sort by" dropdown
2. Choose "Price: Low to High" or "High to Low"
3. Courses reorganize by price

### Compare Courses

1. Switch to "List View"
2. Scroll through courses
3. Click "Learn More" on interesting courses
4. Open multiple in tabs to compare

### Find Popular Courses

1. Click "Sort by" dropdown
2. Select "Most Popular"
3. See most enrolled courses first

### Find Best Rated

1. Click "Sort by" dropdown
2. Select "Highest Rated"
3. See best reviewed courses first

---

## 🛠️ Troubleshooting

### Search Not Working

- Check spelling
- Try different keywords
- Clear and try again
- Try searching by instructor name

### No Courses Appear

- Click "Clear All Filters"
- Check internet connection
- Refresh the page
- Check browser console (F12)

### Images Not Loading

- Check internet connection
- Refresh page
- Course may not have image (shows default)

### View Mode Not Changing

- Click grid/list icons
- Should switch immediately
- Try clearing browser cache

### Sorting Not Working

- Refresh page
- Check sort dropdown
- Try different sort option

---

## 📲 Share Features

### Share Course

1. Click course card to expand
2. Copy course URL
3. Share with others

### Bookmark Courses

(Future feature)

- Save favorite courses
- Create learning lists
- Track progress

---

## 🎓 Course Information

Each course shows:

- **Title**: Course name
- **Instructor**: Teacher/creator name with photo
- **Lessons**: Total lessons count
- **Students**: Current enrollment count
- **Price**: Cost in dollars
- **Rating**: Average rating (when available)
- **Description**: Brief course overview

---

## 🔗 Quick Links

### Navigation

- **Enroll Now**: Takes you to enrollment form
- **Learn More**: Shows full course details
- **Instructor Profile**: (If available) View instructor details

---

## 💡 Tips & Tricks

### Pro Tips

1. **Combine Search + Filter**: Search within specific price type
2. **Use List View**: Better for reading descriptions
3. **Sort by Popular**: Good starting point for new users
4. **Check Ratings**: High rated = good course quality
5. **See Student Count**: More students = proven course

### Keyboard Shortcuts

- **Tab**: Navigate buttons
- **Enter**: Select highlighted option
- **Esc**: May close filter panel (on desktop)

---

## 📝 Course Details Page

After clicking "Learn More":

- Full course description
- Complete lesson list
- Instructor biography
- Student reviews & ratings
- FAQ section
- Related courses
- Testimonials

---

## 🚀 What's Coming Soon

Future enhancements:

- Category filtering
- Difficulty level filter
- Price range slider
- Course comparison tool
- Wishlist/saved courses
- Review & rating system
- Course recommendations
- Advanced search

---

## ❓ FAQ

**Q: Can I search by topic?**  
A: Yes! Search for any topic in the search bar.

**Q: How do I find free courses?**  
A: Click "Filters" → Select "Free Courses"

**Q: Can I compare courses?**  
A: Switch to List View to see more details and compare.

**Q: Where are my saved courses?**  
A: Wishlist feature coming soon!

**Q: Can I leave reviews?**  
A: Visit the course details page to leave reviews (if feature available).

**Q: How are courses sorted by default?**  
A: By newest (most recent courses first).

**Q: Do ratings update in real-time?**  
A: Yes, ratings update as new reviews come in.

**Q: Can I filter by multiple options?**  
A: Yes! Search + Price Type work together.

**Q: Is there a pagination?**  
A: Currently shows all courses; scroll to see more.

---

## 📞 Support

### Issues or Questions

1. Check this guide
2. Clear browser cache
3. Refresh page
4. Contact support team

### Report Issues

Include:

- What you were trying to do
- What happened
- Screenshots if possible
- Browser/device info

---

**Last Updated**: November 2025  
**Version**: 1.0.0
