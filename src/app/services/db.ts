import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, setDoc, limit, runTransaction } from 'firebase/firestore';
import { db, storage, FIREBASE_ENABLED, functions as fbFunctions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
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

export const getLecturerByUser = async (userId: string): Promise<Lecturer | null> => {
  if (!FIREBASE_ENABLED) {
    const l = mockLecturers.find(x => x.userId === userId);
    return l || null;
  }
  const qy = query(collection(db, 'lecturers'), where('userId', '==', userId), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as any;
};

export const setLecturerCalendarUrl = async (lecturerId: string, url: string) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'lecturers', lecturerId), { calendarIcsUrl: url } as any);
};

export const setLecturerWeeklyTemplate = async (lecturerId: string, weeklyTemplate: Record<string, string[]>) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'lecturers', lecturerId), { weeklyTemplate } as any);
};

export const publishAvailabilityCallable = async (lecturerId: string, days: number = 7) => {
  if (!FIREBASE_ENABLED) return;
  const fn = httpsCallable(fbFunctions as any, 'publishAvailability');
  await fn({ lecturerId, days });
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
  try {
    await addDoc(collection(db, 'notificationEvents'), {
      type: 'BOOKING_CREATED',
      bookingId: docRef.id,
      at: now,
      payload: data,
    } as any);
    await addDoc(collection(db, 'emailOutbox'), {
      type: 'BOOKING_CREATED',
      toUserId: data.studentId,
      bookingId: docRef.id,
      at: now,
    } as any);
  } catch {}
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
    tx.set(bookingsRef, { ...data, availabilityId, slotId, createdAt: new Date().toISOString() });
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
  const bookingRef = doc(db, 'bookings', id);
  await updateDoc(bookingRef, patch as any);
  try {
    await addDoc(collection(bookingRef, 'activity'), {
      type: 'STATUS_UPDATE',
      patch,
      at: new Date().toISOString(),
    } as any);
    await addDoc(collection(db, 'notificationEvents'), {
      type: 'BOOKING_UPDATED',
      bookingId: id,
      at: new Date().toISOString(),
      patch,
    } as any);
    await addDoc(collection(db, 'emailOutbox'), {
      type: 'BOOKING_UPDATED',
      bookingId: id,
      at: new Date().toISOString(),
      patch,
    } as any);
  } catch {}
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

export const rescheduleBooking = async (
  bookingId: string,
  currentAvailabilityId: string | null,
  currentSlotId: string | null,
  newAvailabilityId: string,
  newSlotId: string,
  newDate: string,
  newTime: string
) => {
  if (!FIREBASE_ENABLED) return;
  const newAvailRef = doc(db, 'availability', newAvailabilityId);
  const bookingRef = doc(db, 'bookings', bookingId);
  await runTransaction(db, async (tx) => {
    const newSnap = await tx.get(newAvailRef);
    if (!newSnap.exists()) throw new Error('New availability not found');
    const newAvail = newSnap.data() as any;
    const nIdx = (newAvail.timeSlots || []).findIndex((s: any) => s.id === newSlotId && s.available);
    if (nIdx === -1) throw new Error('New slot unavailable');
    newAvail.timeSlots[nIdx].available = false;
    tx.update(newAvailRef, { timeSlots: newAvail.timeSlots });

    if (currentAvailabilityId && currentSlotId) {
      const oldAvailRef = doc(db, 'availability', currentAvailabilityId);
      const oldSnap = await tx.get(oldAvailRef);
      if (oldSnap.exists()) {
        const oldAvail = oldSnap.data() as any;
        const oIdx = (oldAvail.timeSlots || []).findIndex((s: any) => s.id === currentSlotId);
        if (oIdx !== -1) {
          oldAvail.timeSlots[oIdx].available = true;
          tx.update(oldAvailRef, { timeSlots: oldAvail.timeSlots });
        }
      }
    }

    tx.update(bookingRef, { date: newDate, time: newTime, availabilityId: newAvailabilityId, slotId: newSlotId, status: 'CONFIRMED' } as any);
  });
  try {
    await addDoc(collection(bookingRef, 'activity'), {
      type: 'RESCHEDULE',
      newDate,
      newTime,
      at: new Date().toISOString(),
    } as any);
  } catch {}
};

export const addActivity = async (bookingId: string, type: string, data: any) => {
  if (!FIREBASE_ENABLED) return;
  await addDoc(collection(doc(db, 'bookings', bookingId), 'activity'), {
    type,
    data,
    at: new Date().toISOString(),
  } as any);
};

export const saveFcmToken = async (userId: string, token: string) => {
  if (!FIREBASE_ENABLED) return;
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmTokens: { [token]: true },
      lastTokenAt: new Date().toISOString(),
    } as any);
  } catch {
    // ignore
  }
};

export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  if (!FIREBASE_ENABLED) return null;
  const snap = await getDoc(doc(db, 'bookings', bookingId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
};

export const getBookingActivity = async (bookingId: string): Promise<Array<{ id: string; type: string; at: string; [k: string]: any }>> => {
  if (!FIREBASE_ENABLED) return [];
  const snap = await getDocs(query(collection(db, 'bookings', bookingId, 'activity'), orderBy('at', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const listKycApplicants = async (): Promise<Array<{ id: string; name: string; email: string; kycStatus?: string; kycFiles?: string[] }>> => {
  if (!FIREBASE_ENABLED) return [];
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map(d => ({ id: d.id, ...(d.data() as any) }))
    .filter((u: any) => !!u.kycStatus);
};

export const setKycStatus = async (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'users', userId), { kycStatus: status } as any);
  try {
    await addDoc(collection(db, 'users', userId, 'kycAudit'), {
      status,
      reason: reason || null,
      at: new Date().toISOString(),
    } as any);
    await addDoc(collection(db, 'emailOutbox'), {
      type: 'KYC_' + status,
      toUserId: userId,
      at: new Date().toISOString(),
      reason: reason || null,
    } as any);
  } catch {}
};

export const createSupportTicket = async (userId: string, subject: string, message: string) => {
  if (!FIREBASE_ENABLED) return;
  await addDoc(collection(db, 'support'), {
    userId,
    subject,
    message,
    status: 'OPEN',
    tags: [],
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any);
};

export const listSupportTickets = async (): Promise<any[]> => {
  if (!FIREBASE_ENABLED) return [];
  const snap = await getDocs(collection(db, 'support'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
};

export const updateSupportTicket = async (id: string, patch: any) => {
  if (!FIREBASE_ENABLED) return;
  await updateDoc(doc(db, 'support', id), { ...patch, updatedAt: new Date().toISOString() } as any);
};
