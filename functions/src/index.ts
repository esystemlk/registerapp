import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
import sgMail from '@sendgrid/mail';
import { google } from 'googleapis';

admin.initializeApp();
const db = admin.firestore();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const onNotificationEvent = functions.firestore
  .document('notificationEvents/{eventId}')
  .onCreate(async (snap) => {
    const event = snap.data() as any;
    const bookingId = event.bookingId;
    if (!bookingId) return;
    try {
      const bookingSnap = await db.doc(`bookings/${bookingId}`).get();
      if (!bookingSnap.exists) return;
      const booking = bookingSnap.data() as any;
      const studentId = booking.studentId;
      const lecturerId = booking.lecturerId;
      let lecturerUserId: string | null = null;
      try {
        const lecSnap = await db.doc(`lecturers/${lecturerId}`).get();
        lecturerUserId = (lecSnap.exists && (lecSnap.data() as any)?.userId) || null;
      } catch {}
      const userIds = [studentId, lecturerUserId].filter(Boolean) as string[];
      const tokens: string[] = [];
      for (const uid of userIds) {
        const uSnap = await db.doc(`users/${uid}`).get();
        const data = uSnap.data() || {};
        const map = (data.fcmTokens || {}) as Record<string, boolean>;
        tokens.push(...Object.keys(map));
      }
      if (!tokens.length) return;
      const title =
        event.type === 'BOOKING_CREATED'
          ? `Booking confirmed with ${booking.lecturerName}`
          : `Booking updated: ${booking.subject}`;
      const body =
        event.type === 'BOOKING_CREATED'
          ? `${booking.date} at ${booking.time}`
          : `Status/time changed`;
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data: {
          bookingId: bookingId,
          type: event.type,
        },
      };
      await admin.messaging().sendEachForMulticast(message);
    } catch (e) {
      console.error('onNotificationEvent error', e);
    }
  });

export const onEmailOutbox = functions.firestore
  .document('emailOutbox/{id}')
  .onCreate(async (snap) => {
    const item = snap.data() as any;
    if (!SENDGRID_API_KEY) {
      console.log('SendGrid key not set; skipping email send');
      return;
    }
    try {
      let to = '';
      if (item.toUserId) {
        const uSnap = await db.doc(`users/${item.toUserId}`).get();
        to = (uSnap.data() as any)?.email || '';
      }
      if (!to) return;
      const subject =
        item.type === 'BOOKING_CREATED'
          ? 'Your booking is confirmed'
          : item.type === 'BOOKING_UPDATED'
          ? 'Your booking was updated'
          : item.type?.replace('_', ' ') || 'Notification';
      const html = `<p>Hello,</p><p>${subject}.</p><p>Reference: ${
        item.bookingId || ''
      }</p>`;
      await sgMail.send({ to, from: process.env.SENDGRID_FROM || 'no-reply@smartlabs.local', subject, html });
    } catch (e) {
      console.error('onEmailOutbox error', e);
    }
  });

const OAUTH_CLIENT_ID = process.env.GCAL_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.GCAL_CLIENT_SECRET || '';
const OAUTH_REDIRECT = process.env.GCAL_REDIRECT || 'https://us-central1-<project-id>.cloudfunctions.net/calendarOauthCallback';

function getOAuth2() {
  return new google.auth.OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT);
}

export const calendarAuthUrl = functions.https.onRequest(async (req, res) => {
  try {
    const { lecturerId, userId } = req.query as any;
    if (!lecturerId || !userId) return res.status(400).send('Missing lecturerId/userId');
    const oauth2 = getOAuth2();
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      prompt: 'consent',
      state: JSON.stringify({ lecturerId, userId }),
    });
    res.redirect(url);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error creating auth URL');
  }
});

export const calendarOauthCallback = functions.https.onRequest(async (req, res) => {
  try {
    const { code, state } = req.query as any;
    if (!code || !state) return res.status(400).send('Missing code/state');
    const parsed = JSON.parse(state);
    const { lecturerId } = parsed;
    const oauth2 = getOAuth2();
    const { tokens } = await oauth2.getToken(code as string);
    await db.doc(`lecturers/${lecturerId}`).set({ googleTokens: tokens }, { merge: true });
    res.send('Google Calendar linked. You can close this window.');
  } catch (e) {
    console.error(e);
    res.status(500).send('OAuth error');
  }
});

export const checkFreeBusy = functions.https.onCall(async (data, context) => {
  const lecturerId = data.lecturerId as string;
  const timeMin = data.timeMin as string;
  const timeMax = data.timeMax as string;
  if (!lecturerId || !timeMin || !timeMax) throw new functions.https.HttpsError('invalid-argument', 'Missing args');
  const lecSnap = await db.doc(`lecturers/${lecturerId}`).get();
  const lec = lecSnap.data() || {};
  // Prefer Google API if tokens exist; else try ICS URL
  if (lec.googleTokens?.access_token) {
    const oauth2 = getOAuth2();
    oauth2.setCredentials(lec.googleTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        items: [{ id: 'primary' }],
      },
    });
    const busy = fb.data.calendars?.primary?.busy || [];
    return busy;
  } else if (lec.calendarIcsUrl) {
    const response = await fetch(lec.calendarIcsUrl as string);
    const ics = await response.text();
    const lines = ics.split(/\r?\n/);
    const events: Array<{ start: string; end: string }> = [];
    let inEvent = false;
    let dtStart: string | null = null;
    let dtEnd: string | null = null;
    for (const raw of lines) {
      const line = raw.trim();
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        dtStart = null;
        dtEnd = null;
      } else if (line === 'END:VEVENT') {
        if (inEvent && dtStart && dtEnd) events.push({ start: dtStart, end: dtEnd });
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('DTSTART')) dtStart = line.split(':').pop() || null;
        if (line.startsWith('DTEND')) dtEnd = line.split(':').pop() || null;
      }
    }
    return events;
  }
  return [];
});

export const publishAvailability = functions.https.onCall(async (data, context) => {
  const lecturerId = data.lecturerId as string;
  const days = (data.days as number) || 7;
  if (!lecturerId) throw new functions.https.HttpsError('invalid-argument', 'Missing lecturerId');
  const lecSnap = await db.doc(`lecturers/${lecturerId}`).get();
  const lec = lecSnap.data() || {};
  const weekly = (lec as any).weeklyTemplate as Record<string, string[]> | undefined; // { Monday: ["09:00","10:00"], ... }
  if (!weekly) throw new functions.https.HttpsError('failed-precondition', 'No weeklyTemplate on lecturer');
  const now = new Date();
  const horizon: Date[] = [...Array(days)].map((_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
  // Build conflict set using Google if available
  let busy: Array<{ start: Date; end: Date }> = [];
  if (lec.googleTokens?.access_token) {
    const oauth2 = getOAuth2();
    oauth2.setCredentials(lec.googleTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2 });
    const timeMin = horizon[0].toISOString();
    const timeMax = horizon[horizon.length - 1].toISOString();
    const fb = await calendar.freebusy.query({
      requestBody: { timeMin, timeMax, items: [{ id: 'primary' }] },
    });
    busy = (fb.data.calendars?.primary?.busy || []).map((b: any) => ({ start: new Date(b.start), end: new Date(b.end) }));
  } else if (lec.calendarIcsUrl) {
    try {
      const r = await fetch(lec.calendarIcsUrl as string);
      const txt = await r.text();
      const lines = txt.split(/\r?\n/);
      let inEvent = false;
      let s: string | null = null;
      let e: string | null = null;
      for (const raw of lines) {
        const line = raw.trim();
        if (line === 'BEGIN:VEVENT') { inEvent = true; s = null; e = null; }
        else if (line === 'END:VEVENT') {
          if (inEvent && s && e) busy.push({ start: new Date(s), end: new Date(e) });
          inEvent = false;
        } else if (inEvent) {
          if (line.startsWith('DTSTART')) s = (line.split(':').pop() || '').replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z');
          if (line.startsWith('DTEND')) e = (line.split(':').pop() || '').replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6Z');
        }
      }
    } catch (e) {
      console.warn('ICS fetch failed', e);
    }
  }
  const overlap = (start: Date, end: Date) => busy.some((b) => b.end > start && b.start < end);
  const batch = db.batch();
  for (const d of horizon) {
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const times = weekly[dayName] || [];
    if (!times.length) continue;
    const docRef = db.collection('availability').doc();
    const timeSlots = times.map((t) => {
      const [hh, mm] = t.split(':').map((n) => parseInt(n, 10));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const available = !overlap(start, end);
      return { id: `${t}`, time: t, available };
    });
    batch.set(docRef, { lecturerId, date: d.toISOString().slice(0, 10), timeSlots });
  }
  await batch.commit();
  return { ok: true };
});
