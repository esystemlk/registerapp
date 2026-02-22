# ClassBook - Screen Flow Guide

## 📱 Complete User Journeys

### 🎓 STUDENT JOURNEY

#### 1. Login → Student Dashboard
**Login Page** (`/login`)
- Enter credentials or use quick login
- System authenticates and redirects to role-specific dashboard

**Student Dashboard** (`/student/dashboard`)
```
┌─────────────────────────────────┐
│ 🔵 ClassBook - Student Portal   │
│                                 │
│ Welcome, John Student!          │
│ Find and book classes with...  │
│                                 │
│ [📅 My Bookings] [⭐ Favorites]│
│                                 │
│ 🔍 Search lecturers...          │
│                                 │
│ Available Lecturers:            │
│ ┌─────────────────────────────┐ │
│ │ 👤 Dr. Sarah Johnson        │ │
│ │ Mathematics                 │ │
│ │ ⭐ 4.8 (124) • $45/hr      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 Prof. Michael Chen       │ │
│ │ Physics                     │ │
│ │ ⭐ 4.9 (98) • $50/hr       │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 2. Browse → Lecturer Profile
**Lecturer Details** (`/student/lecturer/:id`)
```
┌─────────────────────────────────┐
│ ← Lecturer Profile              │
│                                 │
│        👤 Profile Image         │
│     Dr. Sarah Johnson           │
│       Mathematics               │
│     ⭐ 4.8 (124 reviews)        │
│                                 │
│ About:                          │
│ PhD in Mathematics with 10+...  │
│                                 │
│ ┌─────────┐  ┌──────────────┐  │
│ │ $45     │  │ Mon Wed Fri  │  │
│ │ /hour   │  │ Available    │  │
│ └─────────┘  └──────────────┘  │
│                                 │
│ [📅 Book a Class]              │
│                                 │
│ Recent Reviews:                 │
│ ⭐⭐⭐⭐⭐ Student 1          │
│ "Excellent teaching style..."   │
└─────────────────────────────────┘
```

#### 3. Book → Select Date & Time
**Book Class** (`/student/book/:lecturerId`)
```
┌─────────────────────────────────┐
│ ← Book a Class                  │
│                                 │
│ 👤 Dr. Sarah Johnson            │
│    Mathematics • $45/hr         │
│                                 │
│ 📅 Select Date:                │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │Mon │ │Tue │ │Wed │ │Thu │   │
│ │2/24│ │2/25│ │2/26│ │2/27│   │
│ └────┘ └────┘ └────┘ └────┘   │
│                                 │
│ ⏰ Select Time:                │
│ [09:00 AM] [10:00 AM] [11:00AM]│
│ [01:00 PM] [02:00 PM] [03:00PM]│
│                                 │
│ [Proceed to Payment] 🔵         │
└─────────────────────────────────┘
```

#### 4. Payment → Choose Method
**Payment Dialog**
```
┌─────────────────────────────────┐
│ Complete Payment                │
│ Total Amount: $45               │
│                                 │
│ Payment Method:                 │
│ ○ 💳 Pay with Visa Card        │
│ ○ 📄 Upload Payment Receipt    │
│                                 │
│ ┌─ Visa Card Option ─────────┐ │
│ │ Card Number: ______________ │ │
│ │ Expiry: ____  CVV: ____    │ │
│ │ [Pay Now] 🔵               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Receipt Upload Option ────┐ │
│ │ [Choose File] receipt.pdf  │ │
│ │ ⚠️  Pending admin approval  │ │
│ │ [Submit Booking] 🟡        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 5. View Bookings
**My Bookings** (`/student/bookings`)
```
┌─────────────────────────────────┐
│ ← My Bookings                   │
│                                 │
│ [Upcoming (2)] [Past (1)]       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📅 Dr. Sarah Johnson        │ │
│ │    Mathematics              │ │
│ │    Wed, Feb 25, 2026        │ │
│ │    10:00 AM                 │ │
│ │    $45                      │ │
│ │    💳 Card Payment          │ │
│ │    ✅ CONFIRMED • APPROVED │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 📅 James Wilson             │ │
│ │    Computer Science         │ │
│ │    Fri, Feb 28, 2026        │ │
│ │    02:00 PM                 │ │
│ │    $55                      │ │
│ │    📄 Manual Payment        │ │
│ │    🟡 PENDING • PENDING    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 👨‍🏫 LECTURER JOURNEY

#### 1. Lecturer Dashboard
**Dashboard** (`/lecturer/dashboard`)
```
┌─────────────────────────────────┐
│ 🔵 ClassBook - Lecturer Portal  │
│                                 │
│ Welcome, Dr. Sarah Johnson!     │
│ Manage your classes and...      │
│                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │  3   │ │  5   │ │ 124  │     │
│ │Today │ │Coming│ │Total │     │
│ └──────┘ └──────┘ └──────┘     │
│                                 │
│ [⚙️  Set Availability]         │
│ [👥 My Students]               │
│                                 │
│ 📅 Calendar - February 2026    │
│ Su Mo Tu We Th Fr Sa            │
│           1  2  3  4  5  6     │
│  7  8  9 10 11 12 13           │
│ 14 15 16 17 18 19 20           │
│ 21 22 23 🔵 🔵 26 27          │
│ (blue = bookings)               │
│                                 │
│ Today's Classes:                │
│ ┌─────────────────────────────┐ │
│ │ John Student • 10:00 AM ✅  │ │
│ │ Mathematics                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 2. Set Availability
**Availability Management** (`/lecturer/availability`)
```
┌─────────────────────────────────┐
│ ← Set Availability              │
│                                 │
│ ℹ️  Configure Your Schedule     │
│ Enable days and select times... │
│                                 │
│ Monday                [ON] ✅   │
│ [✓09:00] [✓10:00] [✓11:00]    │
│ [✓01:00] [✓02:00] [ 03:00]    │
│                                 │
│ Tuesday               [OFF]     │
│                                 │
│ Wednesday             [ON] ✅   │
│ [✓09:00] [✓10:00] [✓11:00]    │
│ [✓01:00] [✓02:00] [✓03:00]    │
│                                 │
│ ... (continues for all days)    │
│                                 │
│ [Save Availability] 🔵          │
└─────────────────────────────────┘
```

---

### 🛡️ ADMIN JOURNEY

#### Admin Dashboard
**Payment Approval** (`/admin/dashboard`)
```
┌─────────────────────────────────┐
│ 🔵 ClassBook - Admin Portal     │
│                                 │
│ Welcome, Admin User!            │
│ Manage payments and bookings    │
│                                 │
│ ┌──────┐ ┌──────┐ ┌──────┐     │
│ │  2   │ │  5   │ │ 234  │     │
│ │Pend. │ │Apprvd│ │Total │     │
│ └──────┘ └──────┘ └──────┘     │
│                                 │
│ [Pending (2)] [Approved] [Rej.] │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ John Student                │ │
│ │ James Wilson - CS           │ │
│ │ Date: Fri, Feb 28          │ │
│ │ Time: 02:00 PM             │ │
│ │ Amount: $55                │ │
│ │ 📄 Receipt uploaded        │ │
│ │ [View receipt →]           │ │
│ │                            │ │
│ │ [✅ Approve] [❌ Reject]  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

### 👑 SUPER ADMIN JOURNEY

#### Super Admin Dashboard
**Full System Control** (`/super-admin/dashboard`)
```
┌─────────────────────────────────┐
│ 🟣 ClassBook - Super Admin      │
│                                 │
│ Welcome, Super Admin!           │
│ Full system control and...      │
│                                 │
│ Stats:                          │
│ [50 Users] [234 Bookings]       │
│ [$11,700] [6 Lecturers]         │
│                                 │
│ [Users] [Bookings] [Settings]   │
│                                 │
│ User Management:                │
│ ┌─────────────────────────────┐ │
│ │ 👤 John Student             │ │
│ │    student@demo.com         │ │
│ │    [Change Role ▼] STUDENT  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ 👤 Dr. Sarah Johnson        │ │
│ │    lecturer@demo.com        │ │
│ │    [Change Role ▼] LECTURER │ │
│ └─────────────────────────────┘ │
│                                 │
│ • Assign roles to users         │
│ • View all bookings             │
│ • System settings               │
└─────────────────────────────────┘
```

---

### 💻 DEVELOPER JOURNEY

#### Developer Dashboard
**System Documentation** (`/developer/dashboard`)
```
┌─────────────────────────────────┐
│ 🟢 ClassBook - Developer Portal │
│                                 │
│ Welcome, Developer!             │
│ System architecture and API...  │
│                                 │
│ ⚡ System Metrics:              │
│ [99.98% Uptime] [145ms Resp.]   │
│ [42 Active] [94.2% Cache]       │
│                                 │
│ 🔌 REST API Endpoints:          │
│ [POST] /api/auth/login          │
│        User authentication      │
│ [GET]  /api/lecturers           │
│        Get all lecturers        │
│ [POST] /api/bookings            │
│        Create booking           │
│                                 │
│ 🗄️ Database Schema:            │
│ 💾 users     50 records 2.4MB  │
│ 💾 bookings  234 records 5.8MB │
│ 💾 payments  234 records 4.1MB │
│                                 │
│ 🔒 Security:                    │
│ • JWT Authentication            │
│ • Role-Based Access Control     │
│ • Payment Security              │
└─────────────────────────────────┘
```

---

## 🔄 Complete Booking Flow

```
STUDENT SIDE                    LECTURER SIDE               ADMIN SIDE
═══════════════════════════════════════════════════════════════════════

1. Browse Lecturers            | Sets Availability         |
   ↓                          | (Days & Time Slots)       |
                              |         ↓                 |
2. View Profile & Rating      | Available slots visible   |
   ↓                          | to students               |
                              |                           |
3. Select Date & Time         |                           |
   (Only available slots)     |                           |
   ↓                          |                           |
                              |                           |
4A. Pay with Visa            4B. Upload Receipt          |
    ↓                            ↓                        |
    Instant Confirmation         Booking PENDING ────────→ Review Receipt
    Status: CONFIRMED                                         ↓
    Payment: APPROVED                                         |
         ↓                                                Approve/Reject
         │                                                    ↓
         │                      ┌─────────────────────────────┘
         │                      │
         │                      ↓
         │              If APPROVED:
         │              Status → CONFIRMED ──────→ Shows in Lecturer
         │              Payment → APPROVED         Calendar
         │                      │
         │                      ↓
         └──────────────────────┤
                                │
5. View in "My Bookings"       Sees booking on           Admin sees
   • Status: CONFIRMED         Dashboard Calendar        in Approved
   • Payment: APPROVED          • Student name           list
                               • Time & Subject
                               • Can prepare for class
```

---

## 🎯 Navigation Map

```
/login (Entry Point)
  │
  ├─→ STUDENT
  │    ├─ /student/dashboard (Home)
  │    ├─ /student/lecturer/:id (Profile)
  │    ├─ /student/book/:lecturerId (Booking)
  │    └─ /student/bookings (History)
  │
  ├─→ LECTURER
  │    ├─ /lecturer/dashboard (Calendar)
  │    └─ /lecturer/availability (Schedule)
  │
  ├─→ ADMIN
  │    └─ /admin/dashboard (Approvals)
  │
  ├─→ SUPER_ADMIN
  │    └─ /super-admin/dashboard (Management)
  │
  └─→ DEVELOPER
       └─ /developer/dashboard (Docs)
```

---

## 🎨 UI Components Used

- **Cards**: Information containers
- **Badges**: Status indicators
- **Buttons**: Primary (Blue), Secondary (Outline), Success (Green)
- **Dialogs**: Payment modal, confirmations
- **Tabs**: Multi-view content (bookings, admin reviews)
- **Tables**: User management, bookings list
- **Calendar**: Custom grid view with booking highlights
- **Toast**: Success/error notifications
- **Forms**: Input fields with validation
- **Select**: Dropdown for role management
- **Switch**: Toggle availability

---

## ⚡ Key Interactions

### Touch/Click Events
- Lecturer card → View profile
- Book button → Start booking flow
- Time slot → Select for booking
- Approve/Reject → Admin action with feedback
- Role dropdown → Change user permissions

### Real-time Feedback
- ✅ Toast on successful actions
- ❌ Error messages for validation
- 🟡 Pending status indicators
- ⏳ Loading states during actions

### State Management
- Auth state persists in localStorage
- Bookings update dynamically
- Role changes reflect immediately
- Payment status updates cascade

---

## 🚀 Quick Start Guide

1. **Open app** → Shows login page
2. **Click any role button** → Quick login
3. **Explore features** → Role-specific UI
4. **Test booking** → Full end-to-end flow
5. **Switch roles** → Logout and login as different role
6. **Approve payment** → Login as admin to approve student's receipt

---

## 🎓 Best Practices Demonstrated

✅ Role-based routing and authorization
✅ Component reusability
✅ Consistent design system
✅ Mobile-first responsive design
✅ Clear user feedback
✅ Intuitive navigation
✅ Accessible form controls
✅ Status management
✅ Error handling
✅ Mock data structure ready for backend
