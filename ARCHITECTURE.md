# ClassBook - Mobile Booking App Architecture

## 🎯 Overview
ClassBook is a modern mobile-first booking application with a role-based access control system for managing class bookings between students and lecturers.

## 🎭 User Roles

### 1. **Student** (Default)
- Browse lecturers with profile details
- View lecturer ratings, prices, and availability
- Book classes by selecting date and time
- Pay via Visa card or upload payment receipt
- View upcoming and past bookings
- Check booking status (Pending/Confirmed/Cancelled)

**Demo Login:**
- Email: student@demo.com
- Password: student123

### 2. **Lecturer**
- View personal dashboard with calendar
- Manage availability (days and time slots)
- View student bookings in calendar format
- Automatic double-booking prevention
- Track today's and upcoming classes

**Demo Login:**
- Email: lecturer@demo.com
- Password: lecturer123

### 3. **Admin**
- View all users and bookings
- Approve or reject payment receipts
- Manage payment approvals dashboard
- Track pending, approved, and rejected payments

**Demo Login:**
- Email: admin@demo.com
- Password: admin123

### 4. **Super Admin**
- Full system control
- Assign and change user roles
- View system analytics
- Manage all users, bookings, and settings
- Access revenue and metrics dashboard

**Demo Login:**
- Email: superadmin@demo.com
- Password: super123

### 5. **Developer**
- Access API documentation
- View system metrics and performance
- Database schema overview
- Security and authentication details

**Demo Login:**
- Email: dev@demo.com
- Password: dev123

## 🗂️ File Structure

```
/src/app/
├── App.tsx                    # Main app component with routing
├── AuthContext.tsx            # Authentication context and state
├── routes.tsx                 # React Router configuration
├── types.ts                   # TypeScript interfaces
├── mockData.ts                # Mock data and helper functions
├── pages/
│   ├── Login.tsx              # Login page with quick access
│   ├── NotFound.tsx           # 404 error page
│   ├── student/
│   │   ├── Dashboard.tsx      # Student home with lecturer list
│   │   ├── LecturerDetails.tsx # Individual lecturer profile
│   │   ├── BookClass.tsx      # Booking flow with payment
│   │   └── MyBookings.tsx     # Student's bookings history
│   ├── lecturer/
│   │   ├── Dashboard.tsx      # Lecturer calendar view
│   │   └── Availability.tsx   # Set availability schedule
│   ├── admin/
│   │   └── Dashboard.tsx      # Payment approval system
│   ├── super-admin/
│   │   └── Dashboard.tsx      # Full system management
│   └── developer/
│       └── Dashboard.tsx      # API and system docs
└── components/
    └── ui/                    # Reusable UI components
```

## 🗄️ Database Schema (Mock)

### users
- id: string
- email: string
- name: string
- role: UserRole (STUDENT | LECTURER | ADMIN | SUPER_ADMIN | DEVELOPER)
- password: string
- avatar: string (optional)

### lecturers
- id: string
- userId: string (FK to users)
- subject: string
- price: number
- bio: string
- rating: number
- totalReviews: number
- avatar: string
- availability: string[] (days of week)

### bookings
- id: string
- studentId: string (FK to users)
- studentName: string
- lecturerId: string (FK to lecturers)
- lecturerName: string
- subject: string
- date: string (ISO date)
- time: string
- status: BookingStatus (PENDING | CONFIRMED | CANCELLED)
- paymentMethod: PaymentMethod (VISA | RECEIPT)
- paymentStatus: PaymentStatus (PENDING | APPROVED | REJECTED)
- receiptUrl: string (optional)
- price: number
- createdAt: string (ISO timestamp)

### availability
- id: string
- lecturerId: string (FK to lecturers)
- date: string (ISO date)
- timeSlots: TimeSlot[]

### timeSlots
- id: string
- time: string (e.g., "09:00 AM")
- available: boolean

## 🔌 API Endpoints (Design)

### Authentication
- POST `/api/auth/login` - User login with JWT
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - Get all users (Admin+)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id/role` - Update user role (Super Admin only)

### Lecturers
- GET `/api/lecturers` - Get all lecturers
- GET `/api/lecturers/:id` - Get lecturer details
- PUT `/api/lecturers/:id` - Update lecturer profile

### Bookings
- POST `/api/bookings` - Create new booking
- GET `/api/bookings` - Get all bookings (filtered by role)
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking

### Availability
- GET `/api/availability/:lecturerId` - Get lecturer availability
- PUT `/api/availability` - Update availability (Lecturer only)

### Payments
- POST `/api/payments` - Process Visa payment
- POST `/api/receipts/upload` - Upload payment receipt
- PUT `/api/payments/:id/approve` - Approve payment (Admin only)
- PUT `/api/payments/:id/reject` - Reject payment (Admin only)

## 💳 Payment Flow

### Visa Card Payment
1. Student selects date and time
2. Proceeds to payment dialog
3. Selects "Pay with Visa Card"
4. Enters card details (simulated)
5. Payment processed instantly
6. Booking status: CONFIRMED
7. Payment status: APPROVED

### Manual Receipt Upload
1. Student selects date and time
2. Proceeds to payment dialog
3. Selects "Upload Payment Receipt"
4. Uploads image or PDF file
5. Booking created with PENDING status
6. Admin receives notification
7. Admin approves or rejects
8. Booking status updated accordingly

## 🔐 Security Features

### JWT Authentication
- Token-based authentication
- 24-hour token expiry
- Secure password storage (hashed)

### Role-Based Access Control (RBAC)
- Strict permission validation
- Role-specific routes and UI
- API endpoint protection

### Payment Security
- PCI-DSS compliant (simulated)
- SSL/TLS encryption
- Secure file upload validation

### File Upload Security
- File type validation (images, PDF only)
- File size limit (5MB max)
- Malicious file scanning

## 🎨 Design System

### Color Palette
- **Primary Blue**: #0066FF (headers, buttons, primary actions)
- **Yellow**: #FFD700 (highlights, warnings, status badges)
- **White**: #FFFFFF (background, cards)
- **Gray Scale**: #f8f9fa, #6b7280, #1f2937
- **Success Green**: #10b981
- **Error Red**: #ef4444
- **Purple**: #8b5cf6 (Super Admin theme)

### Typography
- System fonts with fallbacks
- Responsive text sizing
- Clear hierarchy with font weights

### Components
- Cards with shadows for elevation
- Rounded corners (border-radius)
- Consistent spacing (Tailwind)
- Accessible form inputs
- Toast notifications for feedback

## 📱 Mobile-First Design

### Responsive Breakpoints
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Mobile Optimizations
- Touch-friendly buttons (min 44px height)
- Bottom-sticky action buttons
- Swipeable tabs
- Optimized images
- Fast loading with lazy loading

## 🚀 Key Features

### Student Experience
✅ Browse and search lecturers
✅ View detailed profiles with ratings
✅ Interactive calendar booking
✅ Dual payment options (Visa/Receipt)
✅ Booking history with status tracking

### Lecturer Experience
✅ Calendar dashboard
✅ Flexible availability management
✅ Student booking overview
✅ Automatic double-booking prevention

### Admin Experience
✅ Payment approval workflow
✅ Receipt verification system
✅ Booking management dashboard

### Super Admin Experience
✅ User role management
✅ System analytics
✅ Revenue tracking
✅ Full platform control

### Developer Experience
✅ API documentation
✅ System metrics
✅ Database schema reference
✅ Security overview

## 🔄 Booking Workflow

1. **Discovery**: Student browses lecturers
2. **Selection**: Views lecturer profile and availability
3. **Booking**: Selects date and time slot
4. **Payment**: Chooses payment method
5. **Confirmation**: Receives booking confirmation
6. **Admin Approval**: (if receipt upload) Admin reviews
7. **Class**: Lecturer views confirmed booking
8. **Completion**: Booking marked as past

## 📊 Status Management

### Booking Status
- **PENDING**: Awaiting payment approval (receipt uploads)
- **CONFIRMED**: Payment approved, class scheduled
- **CANCELLED**: Booking cancelled by user or admin

### Payment Status
- **PENDING**: Receipt uploaded, awaiting admin review
- **APPROVED**: Payment verified and accepted
- **REJECTED**: Payment rejected, booking cancelled

## 🛠️ Technology Stack

### Frontend
- React 18.3.1
- TypeScript
- React Router 7
- Tailwind CSS 4
- Radix UI Components
- Lucide React Icons
- Sonner (Toast notifications)

### State Management
- React Context API (Auth)
- Local Storage (Persistence)
- useState/useEffect hooks

### Mock Backend
- Static JSON data
- LocalStorage for demo persistence
- Client-side validation

## 📝 Demo Credentials Summary

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Student | student@demo.com | student123 | Browse, Book, Pay |
| Lecturer | lecturer@demo.com | lecturer123 | Calendar, Availability |
| Admin | admin@demo.com | admin123 | Approve Payments |
| Super Admin | superadmin@demo.com | super123 | Full Control |
| Developer | dev@demo.com | dev123 | System Docs |

## 🚦 Getting Started

1. **Login**: Use any demo credentials from the login page
2. **Explore**: Each role shows different UI and features
3. **Test**: Try booking as student, then approve as admin
4. **Manage**: Switch to lecturer to set availability
5. **Control**: Use Super Admin for user management

## 🔮 Future Enhancements

- Real-time notifications
- Video call integration
- Review and rating system
- Recurring bookings
- Email confirmations
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-language support
- Calendar sync (Google, Outlook)
- Refund management
