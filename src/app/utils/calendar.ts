import { Booking } from '../types';

export function bookingToICS(booking: Booking) {
  // Assume booking.date is ISO or parseable date; booking.time is "HH:MM"
  const start = new Date(`${booking.date}T${booking.time}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour block
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${booking.id}@smartlabs`;
  const summary = `Class with ${booking.lecturerName} - ${booking.subject}`;
  const description = `Booking ${booking.id}\nStudent: ${booking.studentName}\nLecturer: ${booking.lecturerName}\nSubject: ${booking.subject}`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SMARTLABS//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  return new Blob([ics], { type: 'text/calendar;charset=utf-8' });
}

export type BusyInterval = { start: Date; end: Date };

export async function fetchIcsBusy(url: string): Promise<BusyInterval[]> {
  const res = await fetch(url);
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const events: BusyInterval[] = [];
  let inEvent = false;
  let dtStart: Date | null = null;
  let dtEnd: Date | null = null;
  const parseIcsDate = (v: string) => {
    const val = v.split(':').pop() || v;
    const clean = val.replace(/[^0-9TZ]/g, '');
    if (clean.length === 8) {
      // DATE only (all day) -> treat as whole day
      const y = clean.substring(0, 4);
      const m = clean.substring(4, 6);
      const d = clean.substring(6, 8);
      return new Date(`${y}-${m}-${d}T00:00:00Z`);
    }
    // e.g., 20260101T090000Z
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    const hh = clean.substring(9, 11);
    const mm = clean.substring(11, 13);
    const ss = clean.substring(13, 15) || '00';
    // Assume Z or UTC-like; let browser convert to local
    return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      dtStart = null;
      dtEnd = null;
    } else if (line === 'END:VEVENT') {
      if (inEvent && dtStart && dtEnd) {
        events.push({ start: dtStart, end: dtEnd });
      }
      inEvent = false;
      dtStart = null;
      dtEnd = null;
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        dtStart = parseIcsDate(line);
      } else if (line.startsWith('DTEND')) {
        dtEnd = parseIcsDate(line);
      }
    }
  }
  return events;
}
