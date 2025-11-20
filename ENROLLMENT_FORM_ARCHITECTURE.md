# Multi-Step Course Enrollment Form - Architecture & State Management

## Overview

This document outlines the complete architecture, state management, and logical flow of the multi-step course enrollment form.

## State Management Structure

### Main Form Data State

```typescript
interface EnrollmentFormData {
  // Step 1: Authentication
  email?: string;
  password?: string;
  confirmPassword?: string;
  hasAccount?: boolean;

  // Step 2: Personal Info
  phone: string;
  currentJob: string;
  careerGoal: "freelance" | "abroad" | "job" | "remote-job" | "";
  division: string;
  district: string;

  // Step 3: Payment
  bkashNumber: string;
  transactionId: string;
}
```

### Additional State Variables

- `currentStep`: Number (0-2) - Tracks which step user is on
- `errors`: Partial<EnrollmentFormData> - Form validation errors
- `loading`: Boolean - Submission loading state
- `showPassword`: Boolean - Password visibility toggle
- `signInEmail`: String - Email for sign-in form
- `signInPassword`: String - Password for sign-in form
- `showSignInPassword`: Boolean - Sign-in password visibility toggle
- `signInError`: String | null - Sign-in specific error message
- `signInLoading`: Boolean - Sign-in loading state
- `status`: "authenticated" | "unauthenticated" | "loading" - NextAuth session status
- `session`: Session | null - NextAuth session data

## Complete Flow Breakdown

### Step 0: Authentication Logic

#### Initial State Detection

```
Check NextAuth Session Status:
├─ If authenticated:
│  ├─ Auto-fill email from session
│  ├─ Show "Already Logged In" message
│  └─ Allow immediate progression to Step 1
│
└─ If unauthenticated:
   └─ Show "Do you have an account?" prompt
      ├─ Option 1: Yes (Show Sign-In Form)
      ├─ Option 2: No (Show Sign-Up Form)
      └─ No action: Block progression
```

#### Branch 1: User Has Existing Account (Sign-In)

1. **Form Fields:**

   - Email (required, must be valid)
   - Password (required, minimum 6 characters)

2. **Validation:**

   - Email format validation using regex
   - Password not empty
   - Both fields required

3. **Sign-In Process:**

   - Submit credentials using NextAuth `signIn("credentials")`
   - If successful: Session updates, component re-renders
   - If failed: Display error message, allow retry
   - Progress to Step 1 only after successful authentication

4. **Error Handling:**
   - Invalid credentials: "Invalid email or password"
   - Network error: "Sign in failed. Please try again."
   - Display error in red alert box

#### Branch 2: New User (Sign-Up)

1. **Form Fields:**

   - Email (required, must be valid)
   - Password (required, minimum 6 characters)
   - Confirm Password (required, must match password)

2. **Validation:**

   - Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Password minimum 6 characters
   - Passwords match exactly
   - All fields required

3. **Sign-Up Process:**

   - Form data stored locally (not submitted yet)
   - Email will be auto-filled in Step 1
   - Progress to Step 1 after validation passes
   - Actual account creation happens in Step 1 form submission (API endpoint)

4. **Error Handling:**
   - Display inline validation errors below each field
   - Red border on invalid fields
   - Clear feedback messages

#### Branch 3: Already Authenticated

1. **Skip authentication entirely**
2. **Auto-fill email from session**
3. **Show confirmation card with:**
   - Checkmark icon
   - "Already Logged In" message
   - User's email
4. **Provide "Continue to Personal Info" button**

---

### Step 1: Personal Information Collection

#### Form Fields & Validation

| Field       | Type   | Required | Validation                                 | Auto-fill               |
| ----------- | ------ | -------- | ------------------------------------------ | ----------------------- |
| Email       | Text   | Yes      | Read-only                                  | From session or sign-up |
| Phone       | Tel    | Yes      | Valid phone format                         | None                    |
| Current Job | Text   | Yes      | Not empty                                  | None                    |
| Career Goal | Select | Yes      | One of: freelance, abroad, job, remote-job | None                    |
| Division    | Select | Yes      | From bangladeshDivisions                   | None                    |
| District    | Select | Yes      | From districts array                       | None                    |

#### Phone Number Validation

- Regex: `/^[\d\s\-+()]+$/`
- Allows: digits, spaces, hyphens, +, parentheses
- Examples: "+880 1XXXXXXXXX", "01XXXXXXXXX", "+88 01XXXXXXXXX"

#### Location Structure

```typescript
const bangladeshDivisions = {
  "Dhaka": ["Dhaka", "Gazipur", ...],
  "Chattogram": ["Chattogram", ...],
  "Sylhet": [...],
  "Khulna": [...],
  "Rajshahi": [...],
  "Rangpur": [...]
}
```

#### Dynamic District Population

- District dropdown disabled until division selected
- When division changes: district reset to empty
- District options populated based on selected division

#### Validation Rules

1. Phone: Must match regex pattern
2. Current Job: Cannot be empty/whitespace only
3. Career Goal: Must select from dropdown
4. Division: Must select from dropdown
5. District: Must select from dropdown (and division must be selected)

#### Error Display

- Red text below field
- Red border on invalid field
- Error clears when user corrects input

---

### Step 2: Payment Step

#### Form Fields & Validation

| Field          | Type | Required | Validation      | Format                        |
| -------------- | ---- | -------- | --------------- | ----------------------------- |
| bKash Number   | Tel  | Yes      | 10-11 digits    | Phone format                  |
| Transaction ID | Text | Yes      | Minimum 5 chars | Alphanumeric, auto-uppercased |

#### Payment Workflow

1. **Display Instructions:**

   ```
   ┌─────────────────────────────────────────┐
   │ Payment Instructions                     │
   │─────────────────────────────────────────│
   │ Send course fee to bKash Personal:      │
   │ [Environment Variable: NEXT_PUBLIC_BKASH_NUMBER]
   └─────────────────────────────────────────┘
   ```

2. **Collect User's bKash Number:**

   - Input: User enters their bKash number
   - Validation: 10-11 digits (after removing non-digits)
   - Error: "Invalid bKash number (10-11 digits)"

3. **Collect Transaction ID:**

   - Input: User enters transaction ID from bKash confirmation
   - Format: Auto-convert to uppercase (e.g., "8NLKXXXX8")
   - Max length: 20 characters
   - Validation: Minimum 5 characters
   - Error: "Invalid transaction ID format"

4. **Important Notes Display:**
   ```
   "Note: Your enrollment will be processed after we verify
   your payment. You'll receive a confirmation email within 24 hours."
   ```

#### bKash Transaction Verification

- Backend will verify transaction ID with bKash API
- Status: pending → approved/rejected (after admin verification)
- Timeline: 24 hours for manual verification
- Notification: Email sent when status changes

---

## Complete Enrollment Data Submission

### Final Data Structure

```typescript
{
  courseSlug: string; // From course object
  phone: string; // Step 1
  currentJob: string; // Step 1
  careerGoal: string; // Step 1 (enum value)
  address: {
    division: string; // Step 1
    district: string; // Step 1
  }
  payment: {
    method: "bkash"; // Fixed
    bkashNumber: string; // Step 2
    transactionId: string; // Step 2
  }
}
```

### Submission Flow

1. **Validate Step 2 data**
2. **Construct payload** with all collected data
3. **POST to `/api/enrollments`**
4. **Success path:**
   - Redirect to: `/courses/{slug}?enrolled=true`
   - Show success message
5. **Error path:**
   - Display error message in form
   - Allow user to correct and retry

---

## Step Navigation

### Navigation Rules

```
Step 0 (Auth)
├─ Next Button: Validates authentication choice
│  ├─ If "Yes": Validate sign-in form
│  ├─ If "No": Validate sign-up form
│  ├─ If authenticated: Skip validation
│  └─ Move to Step 1
├─ Previous Button: DISABLED
└─ No Back button shown

Step 1 (Personal Info)
├─ Previous Button: Go back to Step 0
├─ Next Button: Validate all fields
│  └─ If valid: Move to Step 2
└─ Show "Back" and "Next" buttons

Step 2 (Payment)
├─ Previous Button: Go back to Step 1
├─ Submit Button: Validate payment fields
│  ├─ If valid: Submit form
│  ├─ If invalid: Show errors
│  └─ If success: Redirect
└─ Show "Back" and "Complete Enrollment" buttons
```

### Step Indicator Visual

```
Step 1: Auth    ─────── Step 2: Info    ─────── Step 3: Payment
  ●               ────────    ○              ────────    ○
(Active)         (Completed) (Pending)      (Completed) (Pending)
```

- Completed steps: Green with checkmark
- Current step: Purple/filled
- Pending steps: Gray/empty

---

## Validation Strategy

### Type 1: Field-Level Validation

- Triggered on form submission only (not real-time)
- Errors cleared when user edits field
- Visual feedback: Red border + error text

### Type 2: Form-Level Validation

- All fields in current step validated together
- Navigation blocked if validation fails
- `validateStep(stepNumber)` function returns boolean

### Type 3: Cross-Field Validation

- District depends on Division selection
- Passwords must match
- Email must be unique (backend check)

---

## Error Handling

### Error Types & Handlers

1. **Validation Errors:** Display inline below field
2. **Sign-In Errors:** Display in alert box
3. **Submission Errors:** Display in alert box at form top
4. **Network Errors:** User-friendly message
5. **Email Conflict:** "Email already registered"

### Error Messages Best Practices

- Clear and specific
- Actionable (tell user how to fix)
- Color-coded (red for errors)
- Icon support (AlertCircle icon)

---

## Authentication Integration

### NextAuth.js Integration

- Session status: `status` (loading, authenticated, unauthenticated)
- User data: `session?.user?.email`
- Sign-in function: `signIn("credentials", {...})`
- Automatic session refresh on success

### Conditional Rendering

- Show authentication step only if unauthenticated
- Auto-skip if authenticated
- Prevent double authentication

---

## UI/UX Considerations

### Visual Hierarchy

1. Course header (gradient background)
2. Step indicator (progress bar)
3. Form section (clear labels, proper spacing)
4. Navigation buttons (consistent styling)
5. Course summary (reference info)

### Responsive Design

- Mobile: Single column
- Tablet: Adjusted spacing
- Desktop: Full layout

### Accessibility

- Proper label associations
- Icon + text on buttons
- Color + text for status (not color-only)
- Clear error messages
- Disabled states clearly marked

### Loading States

- Button text changes to "Processing..."
- Spinner animation on button
- Button disabled during submission
- Prevent duplicate submissions

---

## Environment Variables Required

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_BKASH_NUMBER=+880 1XXXXXXXXX
```

---

## API Endpoints

### POST /api/enrollments

**Request:**

```json
{
  "courseSlug": "ui-ux-fundamentals",
  "phone": "+880 1234567890",
  "currentJob": "Student",
  "careerGoal": "job",
  "address": {
    "division": "Dhaka",
    "district": "Dhaka"
  },
  "payment": {
    "method": "bkash",
    "bkashNumber": "01234567890",
    "transactionId": "8NLKXXXX8"
  }
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": {
    "id": "enrollment_123",
    "userId": "user_456",
    "courseSlug": "ui-ux-fundamentals",
    "status": "pending",
    "enrolledAt": "2025-11-19T10:30:00Z"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Email already registered for this course"
}
```

---

## Future Enhancements

1. **Real-time validation** (optional)
2. **Progress persistence** (save draft locally)
3. **Multi-language support** (Bangla/English)
4. **SMS confirmation** for bKash transaction
5. **Form auto-save** (localStorage)
6. **Payment webhook** integration
7. **Discount codes** support
8. **Payment gateway** integration (actual bKash API)

---

## Testing Checklist

- [ ] Auth step: Sign-in with valid credentials
- [ ] Auth step: Sign-in with invalid credentials
- [ ] Auth step: Create new account
- [ ] Auth step: Password mismatch error
- [ ] Personal Info: All fields required
- [ ] Personal Info: Phone validation
- [ ] Personal Info: Division/District dependency
- [ ] Payment: Transaction ID validation
- [ ] Payment: bKash number validation
- [ ] Navigation: Back/Next buttons work
- [ ] Navigation: Step indicator updates
- [ ] Submission: All data sent correctly
- [ ] Error handling: Display error messages
- [ ] Responsive: Mobile/tablet/desktop views
- [ ] Accessibility: Keyboard navigation
