# Multi-Step Enrollment Form - Visual Flow Diagrams

## Complete User Journey Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      User Visits Enrollment Page                  │
│                                                                    │
│              ↓ Check NextAuth Session Status                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼─────────┐        ┌───────▼──────────┐
        │ Authenticated?  │        │ Not Logged In?   │
        │    (YES)        │        │     (NO)         │
        └───────┬─────────┘        └───────┬──────────┘
                │                           │
        ┌───────▼─────────────────┐        │
        │ STEP 0: Authentication  │        │
        │ ═════════════════════  │        │
        │ • Show: Logged-In Card  │        │
        │ • Email: Auto-filled    │        │
        │ • Button: Continue →    │        │
        │ Status: SKIP to Step 1  │        │
        └───────┬─────────────────┘        │
                │                           │
                │               ┌───────────▼──────────┐
                │               │ Ask: Do you have     │
                │               │       an account?    │
                │               │ • Yes / No buttons   │
                │               └───────┬──────────────┘
                │                       │
                │           ┌───────────┴───────────┐
                │           │                       │
        ┌───────▼─────────┐  │  ┌──────────────────┐
        │ Sign In Form    │  │  │ Sign Up Form      │
        │ ═══════════════ │  │  │ ═════════════════ │
        │ • Email         │  │  │ • Email          │
        │ • Password      │  │  │ • Password       │
        │ • Show/Hide     │  │  │ • Confirm Pass   │
        │ • Sign In       │  │  │ • Create Account │
        │ Error: Red msg  │  │  │ Error: Inline    │
        └───────┬─────────┘  │  └──────────┬───────┘
                │            │             │
                │            │             │
        ┌───────▼────────────▼─────────────▼──────┐
        │                                           │
        │         ✓ Validation Passed              │
        │         NextAuth Session Updated         │
        │                                           │
        └───────────────────┬──────────────────────┘
                            │
                    ┌───────▼─────────┐
                    │   STEP 1        │
                    │ Personal Info   │
                    │ ═══════════════ │
                    │ • Phone         │
                    │ • Current Job   │
                    │ • Career Goal   │
                    │ • Division      │
                    │ • District      │
                    │ Button: Next →  │
                    └───────┬─────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            │ Validate all fields           │
            │ • Check required              │
            │ • Format validation           │
            │ • Show errors (red)           │
            │                               │
            └───────────────┬───────────────┘
                            │
                    ┌───────▼─────────┐
                    │   STEP 2        │
                    │   Payment       │
                    │ ═══════════════ │
                    │ • bKash Number  │
                    │ • Instruction   │
                    │ • Transaction   │
                    │ • Submit        │
                    └───────┬─────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            │ Validate payment fields       │
            │ • Check required              │
            │ • Format validation           │
            │ • Show errors (red)           │
            │                               │
            └───────────────┬───────────────┘
                            │
                    ┌───────▼─────────────┐
                    │  Submit Form        │
                    │  ═════════════════  │
                    │ • POST to API       │
                    │ • Show: Processing  │
                    │ • Disable button    │
                    │ • Show spinner      │
                    └───────┬─────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐    ┌────────▼──────────┐
        │ Success (200)  │    │ Error (4xx/5xx)   │
        │ ══════════════ │    │ ═════════════════ │
        │ Redirect to:   │    │ Show error msg    │
        │ /courses/      │    │ Red alert box     │
        │  {slug}?       │    │ Allow retry       │
        │  enrolled=true │    │ Button enabled    │
        │                │    │                   │
        │ ✓ Enrollment   │    │ ✗ Enrollment      │
        │   Complete     │    │   Failed          │
        └────────────────┘    └───────────────────┘
```

---

## Step 0: Authentication Detailed Flow

```
STEP 0: Authentication
═════════════════════════════════════════════════════════════

                Check Session Status
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        │               │            (Loading)
        │               │
   (Authenticated)  (Unauthenticated)
        │               │
        │           ┌───▼───────────────┐
        │           │ Display Options:  │
        │           │ • Yes/No Buttons  │
        │           └───┬───────────────┘
        │               │
        │       ┌───────┴────────┐
        │       │                │
        │   (YES)            (NO)
        │       │                │
        │       ▼                ▼
        │   Sign In          Sign Up
        │   ─────────        ──────────
        │   Form:            Form:
        │   • Email          • Email
        │   • Password       • Password
        │   • Submit         • Confirm Pass
        │                    • Submit
        │       │                │
        │   ┌───┴──────────────┬─┘
        │   │   Validate       │
        │   └───┬──────────────┘
        │       │
        │   ┌───▼──────────────┐
        │   │ Valid?           │
        │   │ (Yes) → (No)     │
        │   │   │        │     │
        │   │   │    Show Err  │
        │   │   │    (Red)     │
        │   │   │        │     │
        │   └───┘────────┘─────┘
        │       │
        ▼       ▼
        ┌──────────────────────┐
        │ Update Session       │
        │ Auto-fill Email      │
        │ Advance to Step 1    │
        └──────────────────────┘
```

---

## Step 1: Personal Information Flow

```
STEP 1: Personal Information
═════════════════════════════════════════════════════════════

            Personal Info Form
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Phone  │ │ Job    │ │ Career │
    └───┬────┘ └───┬────┘ └───┬────┘
        │          │          │
        │ Regex    │ Not      │ Enum
        │ Valid    │ Empty    │ Valid
        │          │          │
        ├──────────┴──────────┤
        │                     │
        │          ┌──────────┴─────────┐
        │          │                    │
        ▼          ▼                    ▼
    Division   District
      Menu      Menu
       │         │
       │ Div     │ Dependent
       │ Sel     │ on Division
       │ │       │
       └─┼───────┤
         │       │
         ▼       ▼
    ┌────────────────────┐
    │ All Fields Valid?  │
    ├────────┬───────────┤
    │ Yes    │ No        │
    │ ↓      │ ↓         │
    │ Next   │ Show Errs │
    │ (Step) │ (Red)     │
    │        │ Retry     │
    └────────┴───────────┘
```

---

## Step 2: Payment Flow

```
STEP 2: Payment (bKash)
═════════════════════════════════════════════════════════════

        ┌────────────────────────────────┐
        │ Display Payment Instructions:  │
        │ ────────────────────────────── │
        │ "Send fee to: [bKash Number]"  │
        │ (From ENV variable)            │
        └────────────────────────────────┘
                     │
            ┌────────▼─────────┐
            │ Input Form       │
            │ ───────────────  │
            │ • Your bKash No  │
            │ • Transaction ID │
            └────────┬─────────┘
                     │
            ┌────────▼──────────────┐
            │ Validation:           │
            ├──────────┬────────────┤
            │ bKash:   │ Transaction:
            │ 10-11    │ Min 5 chars
            │ digits   │ Alphanumeric
            │          │ Auto-upper
            └────┬─────┴────┬───────┘
                 │          │
             (Valid)    (Invalid)
                 │          │
                 │      Show Error
                 │      (Red Box)
                 │          │
            ┌────▼──────────┘
            │
            ▼
        ┌────────────────────┐
        │ Submit Button      │
        │ "Complete Enroll"  │
        │                    │
        │ POST to API:       │
        │ /api/enrollments   │
        │                    │
        │ Show: Processing   │
        │ Disabled: True     │
        │ Spinner: Animated  │
        └────┬───────────────┘
             │
        ┌────┴───────────┐
        │                │
    (Success)      (Error)
        │                │
        ▼                ▼
    ┌──────────────┐ ┌──────────────┐
    │ Redirect to: │ │ Show Error   │
    │ /courses/    │ │ Alert (Red)  │
    │ {slug}?      │ │              │
    │ enrolled=    │ │ Allow Retry  │
    │ true         │ │ Button Ready │
    │              │ │              │
    │ ✓ Success    │ │ ✗ Failed     │
    └──────────────┘ └──────────────┘
```

---

## State Diagram

```
Component State Lifecycle
═════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────┐
│ INITIAL STATE                                            │
├──────────────────────────────────────┬──────────────────┤
│ • currentStep: 0                     │ • errors: {}     │
│ • formData: (empty)                  │ • loading: false │
│ • status: "loading"                  │                  │
└──────────────────────────────────────┴──────────────────┘
              │
              │ useEffect runs
              │ Check session
              │
        ┌─────┴──────────┐
        │                │
   ┌────▼──────┐   ┌─────▼─────────┐
   │ Logged In │   │ Not Logged In  │
   │ ──────── │   │ ───────────── │
   │ status:  │   │ status:       │
   │ auth     │   │ unauth        │
   │ step: 0  │   │ step: 0       │
   │ email:   │   │ email: empty  │
   │ filled   │   │               │
   └────┬─────┘   └────┬──────────┘
        │              │
        │ Next/Change  │ Next/Change
        │              │
        ▼              ▼
   ┌────────────────────────────────┐
   │ ON INPUT CHANGE                │
   │ ──────────────────            │
   │ formData update (field change) │
   │ errors cleared (auto)          │
   └────────────────────────────────┘
        │
        │ On Next/Submit
        │
   ┌────▼──────────────────────────┐
   │ VALIDATION STATE              │
   │ ──────────────────           │
   │ • errors populated            │
   │ • Show inline errors          │
   │ • Block progression           │
   └────┬───────────────────────────┘
        │
        │ If Valid → Next
        │ If Invalid → Show Errors
        │
   ┌────▼──────────────────────────┐
   │ LOADING STATE (on submit)     │
   │ ──────────────────────────────│
   │ • loading: true              │
   │ • Button disabled             │
   │ • Spinner shown              │
   └────┬───────────────────────────┘
        │
        │ API Response
        │
   ┌────┴──────────────┐
   │                   │
┌──▼────────────────┐ ┌──▼────────────────┐
│ SUCCESS           │ │ ERROR             │
│ ──────────────── │ │ ─────────────────│
│ • loading: false │ │ • loading: false  │
│ • Redirect       │ │ • errors show     │
│ • New page load  │ │ • User can retry  │
└──────────────────┘ └───────────────────┘
```

---

## Error Handling Flow

```
Error Handling Strategy
═════════════════════════════════════════════════════════════

              Error Occurs
                    │
        ┌───────────┼───────────┐
        │           │           │
    Validation    Network    Server
    Error         Error      Error
        │           │           │
        ▼           ▼           ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │ Field  │ │ Retry  │ │ Retry  │
    │ Error  │ │ Btn    │ │ Btn    │
    │ (Red)  │ │ Show   │ │ Show   │
    │ Display│ │ Error  │ │ Error  │
    │ Msg    │ │ Msg    │ │ Msg    │
    └────────┘ └────────┘ └────────┘
        │           │           │
        │ User      │ User      │ User
        │ corrects  │ retries   │ retries
        │           │           │
        └───────────┴───────────┘
                    │
            ┌───────▼────────┐
            │ Resubmit Form  │
            │ or Edit        │
            └────────────────┘
```

---

## Database Schema Flow

```
Enrollment Data Flow
═════════════════════════════════════════════════════════════

Form Data → Validation → Construction → Database
  ↓          ↓             ↓              ↓
─────────────────────────────────────────────────

User Input:
  • email (from session/signup)
  • phone
  • currentJob
  • careerGoal
  • division
  • district
  • bkashNumber
  • transactionId
        │
        ▼ (Validated)
        │
Enrollment Object:
  {
    userId: ref(User._id)
    courseId: ref(Course._id)
    courseSlug: string
    status: "pending"
    enrollmentData: {
      phone: string
      currentJob: string
      careerGoal: enum
      address: {
        division: string
        district: string
      }
    }
    paymentData: {
      method: "bkash"
      bkashNumber: string
      transactionId: string
      verificationStatus: "pending"
    }
    enrolledAt: timestamp
    createdAt: timestamp
    updatedAt: timestamp
  }
        │
        ▼ (Save to DB)
        │
Database Record Created
  │
  ├─ Admin can verify payment
  ├─ Status changes: pending → approved/rejected
  ├─ User gets email notification
  └─ Student gains course access
```

---

## Dependency Diagram

```
Component Dependencies
═════════════════════════════════════════════════════════════

MultiStepEnrollmentForm
  ├─ NextAuth (useSession)
  ├─ Next Router (useRouter)
  ├─ Lucide Icons
  ├─ Tailwind CSS
  │
  ├─ AuthenticationStep
  │  ├─ Email validation
  │  ├─ Password validation
  │  ├─ Form submission
  │  └─ Error handling
  │
  ├─ PersonalInfoStep
  │  ├─ Phone validation (regex)
  │  ├─ Bangladesh location data
  │  ├─ Division/District dependency
  │  └─ Form submission
  │
  ├─ PaymentStep
  │  ├─ bKash number validation
  │  ├─ Transaction ID validation
  │  ├─ Form submission
  │  └─ API call (/api/enrollments)
  │
  └─ StepIndicator
     └─ Visual progress display

Related Components:
  ├─ Enrollment Page (wrapper)
  ├─ Course Details Page (links to)
  └─ Course Page (redirect target)

API Dependencies:
  ├─ POST /api/enrollments
  ├─ NextAuth endpoints
  └─ Database queries

Data Flow:
  User Input
    ↓
  Validation
    ↓
  State Update
    ↓
  UI Render
    ↓
  User Interaction
    ↓
  (Loop until submission)
    ↓
  API Call
    ↓
  Response
    ↓
  Redirect/Error
```

---

## Location Hierarchy

```
Bangladesh Divisions & Districts
═════════════════════════════════════════════════════════════

Dhaka
├─ Dhaka
├─ Gazipur
├─ Narayanganj
├─ Tangail
├─ Sherpur
├─ Jashore
└─ Kishoreganj

Chattogram
├─ Chattogram
├─ Comilla
├─ Cox's Bazar
├─ Feni
├─ Khagrachhari
├─ Rangamati
└─ Bandarban

Sylhet
├─ Sylhet
├─ Moulvibazar
├─ Sunamganj
└─ Habiganj

Khulna
├─ Khulna
├─ Barisal
├─ Patuakhali
├─ Pirojpur
├─ Jhalokati
└─ Bhola

Rajshahi
├─ Rajshahi
├─ Bogra
├─ Natore
├─ Naogaon
├─ Pabna
└─ Sirajganj

Rangpur
├─ Rangpur
├─ Dinajpur
├─ Kurigram
├─ Lalmonirhat
├─ Nilphamari
└─ Thakurgaon
```

---

**Last Updated**: November 19, 2025
**Component Version**: 1.0.0
