# Multi-Step Enrollment Form - Quick Reference Guide

## File Location

`/src/components/Enrollment/MultiStepEnrollmentForm.tsx`

## Key State Variables

```typescript
const [currentStep, setCurrentStep] = useState(0);        // 0, 1, 2
const [formData, setFormData] = useState<EnrollmentFormData>({...});
const [errors, setErrors] = useState<Partial<EnrollmentFormData>>({});
const [loading, setLoading] = useState(false);
const { data: session, status } = useSession();           // NextAuth
const { data: session, status } = useSession();           // NextAuth
```

## Component Hooks

### useEffect: Auto-detect authentication

```typescript
useEffect(() => {
  if (status === "authenticated" && session?.user?.email) {
    setFormData((prev) => ({ ...prev, email: session.user.email }));
    setCurrentStep(1); // Skip to personal info
  } else if (status === "unauthenticated") {
    setCurrentStep(0); // Start at auth
  }
}, [status, session]);
```

## Step Components Breakdown

### Step 0: AuthenticationStep()

- **Shows if:** Unauthenticated
- **Content:**
  - "Do you have an account?" buttons (Yes/No)
  - If Yes: Sign-In form (email, password)
  - If No: Sign-Up form (email, password, confirm password)
  - If Authenticated: "Already Logged In" card
- **Validation:**
  - `handleSignIn()` - Sign in with credentials
  - Email format validation
  - Password length check (min 6)
  - Password match validation

### Step 1: PersonalInfoStep()

- **Always shows** after auth
- **Fields:**
  1. Email (read-only, auto-filled)
  2. Phone (required, regex validation)
  3. Current Job (required, not empty)
  4. Career Goal (dropdown, required)
  5. Division (dropdown, required)
  6. District (dependent dropdown, required)
- **Validation:** All fields required with specific rules

### Step 2: PaymentStep()

- **Shows after step 1** is complete
- **Content:**
  - Instructions card with bKash number
  - User's bKash number input (10-11 digits)
  - Transaction ID input (5+ chars, alphanumeric)
- **Validation:**
  - bKash number: 10-11 digits only
  - Transaction ID: minimum 5 characters

## Validation Functions

### validateStep(step: number): boolean

```typescript
// Step 0: Check hasAccount is defined
// Step 1: Check all personal info fields
// Step 2: Check payment fields
// Returns false if errors exist, true if valid
```

### isValidEmail(email: string): boolean

```typescript
// Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Returns true if valid email format
```

## Form State Updates

### Controlled Inputs Pattern

```typescript
<input
  value={formData.phone}
  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
/>
```

### Error Display Pattern

```typescript
{
  errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>;
}
```

## Navigation Logic

### handleNext()

```typescript
// Validates current step
// If valid: Move to next step (currentStep + 1)
// If invalid: Display errors, don't advance
```

### handlePrevious()

```typescript
// Go back one step (currentStep - 1)
// Minimum 0 (auth step)
// No validation needed going back
```

### handleSubmit()

```typescript
// Final validation of step 2
// POST to /api/enrollments
// On success: Redirect to /courses/{slug}?enrolled=true
// On error: Display error message
```

## Dependent Fields

### Division → District Relationship

```typescript
// When division changes:
1. Reset district to empty
2. Disable district dropdown until selection

// District dropdown options come from:
bangladeshDivisions[selectedDivision]

// Example:
"Dhaka" → ["Dhaka", "Gazipur", "Narayanganj", ...]
```

## Sign-In Flow

### handleSignIn()

```typescript
1. Get email & password from state
2. Call signIn("credentials", {...})
3. If error: Display error message
4. If success: Session updates, component re-renders
5. currentStep automatically becomes 1 (personal info)
```

## Data Submission

### handleSubmit()

```typescript
1. Validate step 2 data
2. Construct enrollment object:
   {
     courseSlug,
     phone, currentJob, careerGoal,
     address: { division, district },
     payment: { method: "bkash", bkashNumber, transactionId }
   }
3. POST to /api/enrollments
4. If success: router.push(/courses/{slug}?enrolled=true)
5. If error: Show error, allow retry
```

## UI Components Used

- **Icons:** Clock, AlertCircle, Eye, EyeOff, Loader, CheckCircle2, ChevronLeft, ChevronRight, Mail, Lock, Phone, Briefcase, MapPin, DollarSign
- **Step Indicator:** Custom component with progress bar
- **Course Header:** Gradient background with title
- **Form Sections:** Grouped by step
- **Navigation Buttons:** Back/Next/Submit
- **Course Summary:** Reference card at bottom

## Environment Variables

```env
NEXT_PUBLIC_BKASH_NUMBER="+880 1XXXXXXXXX"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Error Messages

### Step 0 (Auth)

- "Please select an option" - hasAccount not selected
- "Invalid email or password" - Sign-in failed
- "Valid email is required" - Invalid email format
- "Password must be at least 6 characters" - Short password
- "Passwords do not match" - Confirm password mismatch
- "Sign in failed. Please try again." - Network error

### Step 1 (Personal Info)

- "Phone number is required" - Empty phone
- "Invalid phone number format" - Wrong format
- "Current job is required" - Empty job
- "Career goal is required" - Not selected
- "Division is required" - Not selected
- "District is required" - Not selected

### Step 2 (Payment)

- "bKash number is required" - Empty number
- "Invalid bKash number (10-11 digits)" - Wrong format
- "Transaction ID is required" - Empty ID
- "Invalid transaction ID format" - Too short

## Testing Scenarios

### Auth Step

- ✓ User already logged in
- ✓ User signs in with credentials
- ✓ User creates new account
- ✓ Sign-in fails with wrong password
- ✓ Email validation fails

### Personal Info Step

- ✓ All fields required validation
- ✓ Phone regex validation
- ✓ Division/District dependency
- ✓ Navigate back to auth
- ✓ Navigate forward to payment

### Payment Step

- ✓ bKash number validation (digits only)
- ✓ Transaction ID uppercase conversion
- ✓ Form submission success
- ✓ Form submission error
- ✓ Network error handling

## Performance Considerations

- Form data updates don't trigger re-renders of entire form
- Step indicator updates efficiently
- Conditional rendering prevents unused DOM
- useSession hook integrated with NextAuth
- Error state isolated by field

## Accessibility Features

- Proper label-for associations
- Icon + text on buttons
- Error messages linked to fields
- Disabled states clearly marked
- Keyboard navigation support (native HTML)
- Color + text for status (red for errors)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires Next.js 13+
- NextAuth.js support
- Tailwind CSS for styling

## Related Files

- Page wrapper: `/src/app/(client)/courses/enroll/[slug]/page.tsx`
- API endpoint: `/src/app/api/enrollments` (POST)
- Types: Defined in component file
- Data file: `/src/data/courses.ts` (Course type)

---

## Quick Snippets

### Add a new validation field

```typescript
if (!formData.newField) {
  newErrors.newField = "Error message";
}
```

### Add a new form field

```typescript
<input
  value={formData.newField}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, newField: e.target.value }))
  }
/>;
{
  errors.newField && <p className="text-red-600 text-sm">{errors.newField}</p>;
}
```

### Add a new step

```typescript
// 1. Update Step Indicator array to [0, 1, 2, 3]
// 2. Create NewStep component
// 3. Add validation in validateStep()
// 4. Add conditional render: {currentStep === 3 && <NewStep />}
```

### Modify bKash number in env

```env
NEXT_PUBLIC_BKASH_NUMBER="+880 1XXXXXXXXX"  # Update this
```
