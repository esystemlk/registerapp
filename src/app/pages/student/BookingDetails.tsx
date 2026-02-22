import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../AuthContext';
import { getBooking, getBookingActivity, listAvailabilityByLecturer, rescheduleBooking } from '../../services/db';
import { Booking } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react';
import { bookingToICS } from '../../utils/calendar';
import { toast } from 'sonner';

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [options, setOptions] = useState<Array<{ availabilityId: string; date: string; slotId: string; time: string }>>([]);
  const [selected, setSelected] = useState<{ availabilityId: string; slotId: string; date: string; time: string } | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    if (!id) return;
    getBooking(id).then((b) => setBooking(b));
    getBookingActivity(id).then(setActivity);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { backgroundColor: '#10b981', color: 'white' };
      case 'PENDING': return { backgroundColor: '#FFD700', color: '#000' };
      case 'CANCELLED': return { backgroundColor: '#ef4444', color: 'white' };
      default: return {};
    }
  };

  const openReschedule = async () => {
    if (!booking) return;
    try {
      const av = await listAvailabilityByLecturer(booking.lecturerId);
      const opts: any[] = [];
      av.forEach(a => (a.timeSlots || []).forEach((s: any) => {
        if (s.available) opts.push({ availabilityId: a.id, date: a.date, slotId: s.id, time: s.time || s.id });
      }));
      setOptions(opts);
      setRescheduleOpen(true);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load availability');
    }
  };

  const confirmReschedule = async () => {
    if (!booking || !selected) return;
    try {
      await rescheduleBooking(
        booking.id,
        booking.availabilityId || null,
        booking.slotId || null,
        selected.availabilityId,
        selected.slotId,
        selected.date,
        selected.time
      );
      setBooking({ ...booking, date: selected.date, time: selected.time, availabilityId: selected.availabilityId, slotId: selected.slotId, status: 'CONFIRMED' });
      setRescheduleOpen(false);
      setSelected(null);
      toast.success('Booking rescheduled');
    } catch (e: any) {
      toast.error(e?.message || 'Reschedule failed');
    }
  };

  if (!booking) {
    return <div className="p-6">Loading booking…</div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/student/bookings')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Booking Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{booking.subject} with {booking.lecturerName}</span>
              <Badge style={getStatusColor(booking.status)}>{booking.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {new Date(booking.date).toLocaleDateString()} 
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> {booking.time}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> ${booking.price}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const blob = bookingToICS(booking);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `booking-${booking.id}.ics`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Add to Calendar
              </Button>
              <Button size="sm" onClick={openReschedule}>Reschedule</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activity.length ? activity.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium">{a.type}</span>
                  <span className="text-gray-500"> — {new Date(a.at).toLocaleString()}</span>
                </li>
              )) : <li className="text-sm text-gray-500">No activity yet.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      {rescheduleOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0066FF' }}>
              Choose a new available slot
            </h3>
            <div className="max-h-64 overflow-auto border rounded-lg">
              {options.length ? (
                <ul>
                  {options.map((o) => (
                    <li key={`${o.availabilityId}-${o.slotId}`}>
                      <label className="flex items-center gap-3 p-2 hover:bg-gray-50">
                        <input
                          type="radio"
                          name="slot"
                          checked={selected?.availabilityId === o.availabilityId && selected?.slotId === o.slotId}
                          onChange={() => setSelected(o)}
                        />
                        <span>{new Date(o.date).toLocaleDateString()} — {o.time}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-sm text-gray-600">No free slots available for this lecturer.</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={() => { setRescheduleOpen(false); setSelected(null); }}>Cancel</Button>
              <Button onClick={confirmReschedule} disabled={!selected}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
