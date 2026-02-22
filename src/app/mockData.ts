import { User, Lecturer, Booking, Availability, TimeSlot } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@demo.com',
    name: 'John Student',
    role: 'STUDENT',
    password: 'student123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  {
    id: '2',
    email: 'lecturer@demo.com',
    name: 'Dr. Sarah Johnson',
    role: 'LECTURER',
    password: 'lecturer123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '3',
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: 'admin123',
  },
  {
    id: '4',
    email: 'superadmin@demo.com',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    password: 'super123',
  },
  {
    id: '5',
    email: 'dev@demo.com',
    name: 'Developer',
    role: 'DEVELOPER',
    password: 'dev123',
  },
];

// Mock Lecturers
export const mockLecturers: Lecturer[] = [
  {
    id: 'l1',
    userId: '2',
    name: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    price: 45,
    bio: 'PhD in Mathematics with 10+ years of teaching experience. Specialized in Calculus and Linear Algebra.',
    rating: 4.8,
    totalReviews: 124,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    availability: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'l2',
    userId: '6',
    name: 'Prof. Michael Chen',
    subject: 'Physics',
    price: 50,
    bio: 'Expert in Quantum Physics and Mechanics. Published researcher and passionate educator.',
    rating: 4.9,
    totalReviews: 98,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    availability: ['Tue', 'Thu', 'Sat'],
  },
  {
    id: 'l3',
    userId: '7',
    name: 'Dr. Emily Davis',
    subject: 'Chemistry',
    price: 40,
    bio: 'Organic Chemistry specialist with hands-on lab experience. Making chemistry fun and easy!',
    rating: 4.7,
    totalReviews: 156,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    availability: ['Mon', 'Tue', 'Thu'],
  },
  {
    id: 'l4',
    userId: '8',
    name: 'James Wilson',
    subject: 'Computer Science',
    price: 55,
    bio: 'Full-stack developer and CS educator. Specializing in Python, JavaScript, and Data Structures.',
    rating: 4.9,
    totalReviews: 203,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
  },
  {
    id: 'l5',
    userId: '9',
    name: 'Dr. Maria Garcia',
    subject: 'Biology',
    price: 42,
    bio: 'Molecular Biology PhD. Passionate about genetics and cell biology. Patient and thorough teaching style.',
    rating: 4.6,
    totalReviews: 87,
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150',
    availability: ['Tue', 'Wed', 'Fri'],
  },
  {
    id: 'l6',
    userId: '10',
    name: 'David Brown',
    subject: 'English Literature',
    price: 38,
    bio: 'MA in English Literature. Specializing in Shakespeare, Poetry, and Essay Writing.',
    rating: 4.8,
    totalReviews: 142,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    availability: ['Mon', 'Tue', 'Thu', 'Sat'],
  },
];

// Mock Time Slots
const generateTimeSlots = (): TimeSlot[] => {
  const slots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  ];
  return slots.map((time, index) => ({
    id: `slot-${index}`,
    time,
    available: Math.random() > 0.3,
  }));
};

// Mock Availability
export const mockAvailability: Availability[] = mockLecturers.flatMap((lecturer) => {
  const dates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      id: `avail-${lecturer.id}-${i}`,
      lecturerId: lecturer.id,
      date: date.toISOString().split('T')[0],
      timeSlots: generateTimeSlots(),
    });
  }
  return dates;
});

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'b1',
    studentId: '1',
    studentName: 'John Student',
    lecturerId: 'l1',
    lecturerName: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    date: '2026-02-25',
    time: '10:00 AM',
    status: 'CONFIRMED',
    paymentMethod: 'VISA',
    paymentStatus: 'APPROVED',
    price: 45,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'b2',
    studentId: '1',
    studentName: 'John Student',
    lecturerId: 'l4',
    lecturerName: 'James Wilson',
    subject: 'Computer Science',
    date: '2026-02-28',
    time: '02:00 PM',
    status: 'PENDING',
    paymentMethod: 'RECEIPT',
    paymentStatus: 'PENDING',
    receiptUrl: 'https://example.com/receipt.pdf',
    price: 55,
    createdAt: '2026-02-22T14:00:00Z',
  },
  {
    id: 'b3',
    studentId: '1',
    studentName: 'John Student',
    lecturerId: 'l2',
    lecturerName: 'Prof. Michael Chen',
    subject: 'Physics',
    date: '2026-02-20',
    time: '11:00 AM',
    status: 'CONFIRMED',
    paymentMethod: 'VISA',
    paymentStatus: 'APPROVED',
    price: 50,
    createdAt: '2026-02-15T09:00:00Z',
  },
];

// Auth Helper
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers.find((u) => u.email === email && u.password === password);
  return user || null;
};

// Get dashboard route based on role
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'STUDENT':
      return '/student/dashboard';
    case 'LECTURER':
      return '/lecturer/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    case 'DEVELOPER':
      return '/developer/dashboard';
    default:
      return '/login';
  }
};
