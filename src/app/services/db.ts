import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, setDoc, limit, runTransaction } from 'firebase/firestore';
import { db, storage, FIREBASE_ENABLED } from '../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Lecturer, Availability, Booking, UserRole } from '../types';
import { mockLecturers, mockAvailability } from '../mockData';

export const listLecturers = async (): Promise<Lecturer[]> => {
  if (!FIREBASE_ENABLED) return mockLecturers;
  const snap = await getDocs(collection(db, 'lecturers'));
  if (snap.empty) {
    for (const l of mockLecturers) {
      await setDoc(doc(collection(db, 'lecturers'), l.id), l as any);
    }
    const seeded = await getDocs(collection(db, 'lecturers'));
    return seeded.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const getLecturer = async (id: string): Promise<Lecturer | null> => {
  if (!FIREBASE_ENABLED) {
    const l = mockLecturers.find(x => x.id === id);
    return l || null;
    }
  const d = await getDoc(doc(db, 'lecturers', id));
  return d.exists() ? ({ id: d.id, ...(d.data() as any) }) : null;
};

export const listAvailabilityByLecturer = async (lecturerId: string): Promise<Availability[]> => {
  if (!FIREBASE_ENABLED) return mockAvailability.filter(a => a.lecturerId === lecturerId);
  const availCol = collection(db, 'availability');
  const q = query(availCol, where('lecturerId', '==', lecturerId), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  if (snap.empty) {
    const source = mockAvailability.filter(a => a.lecturerId === lecturerId);
    for (const a of source) {
      await addDoc(availCol, a as any);
    }
    const seeded = await getDocs(query(availCol, where('lecturerId', '==', lecturerId), orderBy('date', 'asc')));
    return seeded.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const createBooking = async (data: Omit<Booking, 'id' | 'createdAt'>): Promise<string> => {
  const now = new Date().toISOString();
  if (!FIREBASE_ENABLED) return `local-${now}`;
  const refCol = collection(db, 'bookings');
  const docRef = await addDoc(refCol, { ...data, createdAt: now });
  return docRef.id;
};

export const reserveSlotAndCreateBooking = async (availabilityId: string, slotId: string, data: Omit<Booking, 'id' | 'createdAt'>) => {
  if (!FIREBASE_ENABLED) return;
  const availRef = doc(db, 'availability', availabilityId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(availRef);
    if (!snap.exists()) throw new Error('Availability not found');
    const avail = snap.data() as any;
    const idx = (avail.timeSlots || []).findIndex((s: any) => s.id === slotId && s.available);
    if (idx === -1) throw new Error('Slot unavailable');
    avail.timeSlots[idx].available = false;
    tx.update(availRef, { timeSlots: avail.timeSlots });
    const bookingsRef = doc(collection(db, 'bookings'));
    tx.set(bookingsRef, { ...data, createdAt: new Date().toISOString() });
  });
};

export const uploadReceipt = async (userId: string, file: File): Promise<string> => {
  if (!FIREBASE_ENABLED) return '';
  const r = ref(storage, `receipts/${userId}/${Date.now()}-${file.name}`);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
};

export const listBookingsByStudent = async (studentId: string): Promise<Booking[]> => {
  if (!FIREBASE_ENABLED) return [];
  const qy = query(collection(db, 'bookings'), where('studentId', '==', studentId), orderBy('date', 'asc'));
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const listBookingsPending = async (): Promise<Booking[]> => {
  if (!FIREBASE_ENABLED) return [];
  const qy = query(collection(db, 'bookings'), where('paymentStatus', '==', 'PENDING'));
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const updateBookingStatus = async (id: string, patch: Partial<Booking>) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'bookings', id), patch as any);
};

export const listBookingsByLecturer = async (lecturerId: string): Promise<Booking[]> => {
  if (!FIREBASE_ENABLED) return [];
  const qy = query(collection(db, 'bookings'), where('lecturerId', '==', lecturerId), orderBy('date', 'asc'));
  const snap = await getDocs(qy);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const listUsers = async (): Promise<Array<{ id: string; email: string; name: string; role: UserRole; avatar?: string }>> => {
  if (!FIREBASE_ENABLED) return [];
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'users', userId), { role } as any);
};

export const listAllBookings = async (): Promise<Booking[]> => {
  if (!FIREBASE_ENABLED) return [];
  const snap = await getDocs(collection(db, 'bookings'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};
