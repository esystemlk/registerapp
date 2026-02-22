export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  avatar?: string;
}

export interface Lecturer {
  id: string;
  userId: string;
  subject: string;
  price: number;
  bio: string;
  rating: number;
  totalReviews: number;
  avatar: string;
  name: string;
  availability: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Availability {
  id: string;
  lecturerId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'VISA' | 'RECEIPT';

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  lecturerId: string;
  lecturerName: string;
  subject: string;
  date: string;
  time: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  receiptUrl?: string;
  price: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  receiptUrl?: string;
  status: PaymentStatus;
  amount: number;
}
