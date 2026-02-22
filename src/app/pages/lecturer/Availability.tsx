import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Calendar, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getLecturerByUser, setLecturerCalendarUrl, setLecturerWeeklyTemplate, publishAvailabilityCallable } from '../../services/db';
import { fetchIcsBusy, BusyInterval } from '../../utils/calendar';

interface TimeSlot {
  time: string;
  enabled: boolean;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

export default function LecturerAvailability() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lecturerId, setLecturerId] = useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = useState<string>('');
  const [busy, setBusy] = useState<BusyInterval[]>([]);
  const [checking, setChecking] = useState(false);
  const [horizonDays, setHorizonDays] = useState<number>(14);

  useEffect(() => {
    if (!user || user.role !== 'LECTURER') {
      navigate('/login');
    }
    if (user?.id) {
      getLecturerByUser(user.id).then((lec) => {
        if (lec) {
          setLecturerId(lec.id);
          // @ts-ignore
          if ((lec as any).calendarIcsUrl) setCalendarUrl((lec as any).calendarIcsUrl);
        }
      });
    }
  }, [user, navigate]);

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Tuesday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Wednesday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Thursday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Friday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Saturday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Sunday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
  ]);

  const toggleDay = (dayIndex: number) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dayIndex].enabled = !newAvailability[dayIndex].enabled;
      return newAvailability;
    });
  };

  const toggleSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dayIndex].slots[slotIndex].enabled =
        !newAvailability[dayIndex].slots[slotIndex].enabled;
      return newAvailability;
    });
  };

  const to24 = (t: string) => {
    const [hhStr, mmStr, ap] = t.split(/[: ]/);
    let hh = parseInt(hhStr, 10) % 12;
    if (ap === 'PM') hh += 12;
    return `${String(hh).padStart(2, '0')}:${mmStr}`;
  };

  const handleSave = async () => {
    if (lecturerId && calendarUrl && calendarUrl.startsWith('http')) {
      try {
        await setLecturerCalendarUrl(lecturerId, calendarUrl);
      } catch {}
    }
    if (lecturerId) {
      const template: Record<string, string[]> = {};
      for (const day of availability) {
        if (!day.enabled) continue;
        template[day.day] = day.slots.filter(s => s.enabled).map(s => to24(s.time));
      }
      try {
        await setLecturerWeeklyTemplate(lecturerId, template);
        await publishAvailabilityCallable(lecturerId, Math.max(1, Math.min(60, horizonDays || 14)));
      } catch {}
    }
    if (busy.length) {
      toast.warning(`Conflicts detected with your calendar: ${busy.length} busy events in next 7 days. Slots that overlap should not be published.`);
    }
    toast.success('Availability updated successfully!');
    navigate('/lecturer/dashboard');
  };

  const checkConflicts = async () => {
    if (!calendarUrl || !calendarUrl.startsWith('http')) {
      toast.error('Enter a valid public ICS URL from your Google Calendar settings');
      return;
    }
    setChecking(true);
    try {
      const intervals = await fetchIcsBusy(calendarUrl);
      setBusy(intervals);
      const now = new Date();
      const next7: Date[] = [...Array(7)].map((_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
      let conflicts = 0;
      for (const d of next7) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const day = availability.find((x) => x.day === dayName && x.enabled);
        if (!day) continue;
        for (const s of day.slots.filter((sl) => sl.enabled)) {
          const [hh, mm, ap] = s.time.split(/[: ]/);
          let hour = parseInt(hh, 10) % 12;
          if (ap === 'PM') hour += 12;
          const slotStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, parseInt(mm, 10));
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
          const overlap = intervals.some((it) => it.end > slotStart && it.start < slotEnd);
          if (overlap) conflicts++;
        }
      }
      toast.message('Double-booking check', { description: `${conflicts} slot(s) overlap your Google Calendar in the next 7 days.` });
    } catch (e: any) {
      toast.error(e?.message || 'Failed to read ICS feed');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lecturer/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Set Availability</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6" style={{ backgroundColor: '#f0f7ff', borderColor: '#0066FF' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#0066FF' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#0066FF' }}>
                  Configure Your Schedule
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Enable days and select time slots when you're available for classes. Students can only book during these times.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Calendar Link */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: '#0066FF' }} />
              Avoid Double-booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Paste your Google Calendar public ICS URL. We’ll check the next 7 days for conflicts when you save.
            </p>
            {lecturerId && import.meta.env.VITE_FUNCTIONS_BASE_URL && (
              <div className="mb-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const base = import.meta.env.VITE_FUNCTIONS_BASE_URL as string;
                    const url = `${base}/calendarAuthUrl?lecturerId=${encodeURIComponent(lecturerId)}&userId=${encodeURIComponent(user!.id)}`;
                    window.open(url, '_blank');
                  }}
                >
                  Link Google Calendar (OAuth)
                </Button>
              </div>
            )}
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Publish days</label>
              <input
                type="number"
                min={1}
                max={60}
                value={horizonDays}
                onChange={(e) => setHorizonDays(parseInt(e.target.value || '14', 10))}
                className="border rounded px-2 py-1 w-24"
              />
              <span className="text-xs text-gray-500">Range for generated availability (max 60)</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={checkConflicts} disabled={checking}>
                {checking ? 'Checking…' : 'Check Conflicts'}
              </Button>
              <span className="text-xs text-gray-500">We don’t modify your calendar.</span>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <div className="space-y-4">
          {availability.map((dayAvail, dayIndex) => (
            <Card key={dayAvail.day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dayAvail.day}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`day-${dayIndex}`} className="text-sm text-gray-600">
                      {dayAvail.enabled ? 'Available' : 'Not Available'}
                    </Label>
                    <Switch
                      id={`day-${dayIndex}`}
                      checked={dayAvail.enabled}
                      onCheckedChange={() => toggleDay(dayIndex)}
                    />
                  </div>
                </div>
              </CardHeader>
              {dayAvail.enabled && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {dayAvail.slots.map((slot, slotIndex) => (
                      <Button
                        key={slot.time}
                        variant={slot.enabled ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        style={
                          slot.enabled
                            ? { backgroundColor: '#0066FF', color: 'white' }
                            : {}
                        }
                        onClick={() => toggleSlot(dayIndex, slotIndex)}
                      >
                        {slot.enabled && <Check className="w-3 h-3 mr-1" />}
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 pt-6 pb-6" style={{ backgroundColor: '#f8f9fa' }}>
          <Button
            className="w-full h-12 text-white text-lg"
            style={{ backgroundColor: '#0066FF' }}
            onClick={handleSave}
          >
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
