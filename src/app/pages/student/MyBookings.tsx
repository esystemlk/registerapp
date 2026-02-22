import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { useEffect, useState } from 'react';
import { listBookingsByStudent, listAvailabilityByLecturer, rescheduleBooking } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Calendar, Clock, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Booking } from '../../types';
import { bookingToICS } from '../../utils/calendar';
import { toast } from 'sonner';

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  useEffect(() => {
    if (user?.id) {
      listBookingsByStudent(user.id).then(setUserBookings);
    }
  }, [user?.id]);

  const upcomingBookings = userBookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return bookingDate >= new Date() && b.status !== 'CANCELLED';
  });

  const pastBookings = userBookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return bookingDate < new Date() || b.status === 'CANCELLED';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'PENDING':
        return { backgroundColor: '#FFD700', color: '#000' };
      case 'CANCELLED':
        return { backgroundColor: '#ef4444', color: 'white' };
      default:
        return {};
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'PENDING':
        return { backgroundColor: '#FFD700', color: '#000' };
      case 'REJECTED':
        return { backgroundColor: '#ef4444', color: 'white' };
      default:
        return {};
    }
  };

  const [rescheduleFor, setRescheduleFor] = useState<Booking | null>(null);
  const [options, setOptions] = useState<Array<{ availabilityId: string; date: string; slotId: string; time: string }>>([]);
  const [selected, setSelected] = useState<{ availabilityId: string; slotId: string; date: string; time: string } | null>(null);

  const openReschedule = async (b: Booking) => {
    setRescheduleFor(b);
    try {
      const av = await listAvailabilityByLecturer(b.lecturerId);
      const opts: any[] = [];
      av.forEach(a => {
        (a.timeSlots || []).forEach((s: any) => {
          if (s.available) {
            opts.push({ availabilityId: a.id, date: a.date, slotId: s.id, time: s.time || s.id });
          }
        });
      });
      setOptions(opts);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load availability');
    }
  };

  const confirmReschedule = async () => {
    if (!rescheduleFor || !selected) return;
    try {
      await rescheduleBooking(
        rescheduleFor.id,
        (rescheduleFor as any).availabilityId || null,
        (rescheduleFor as any).slotId || null,
        selected.availabilityId,
        selected.slotId,
        selected.date,
        selected.time
      );
      toast.success('Booking rescheduled');
      setUserBookings((prev) => prev.map((x) =>
        x.id === rescheduleFor.id
          ? { ...x, date: selected.date, time: selected.time, availabilityId: selected.availabilityId, slotId: selected.slotId, status: 'CONFIRMED' }
          : x
      ));
      setRescheduleFor(null);
      setSelected(null);
      setOptions([]);
    } catch (e: any) {
      toast.error(e?.message || 'Reschedule failed');
    }
  };

  const BookingCard = ({ booking, isPast = false }: { booking: any; isPast?: boolean }) => (
    <Card className={isPast ? 'opacity-75' : ''}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f7ff' }}>
            <Calendar className="w-8 h-8" style={{ color: '#0066FF' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/student/booking/${booking.id}`)}>{booking.lecturerName}</h3>
                <p className="text-sm" style={{ color: '#0066FF' }}>
                  {booking.subject}
                </p>
              </div>
              <Badge style={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(booking.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {booking.time}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                ${booking.price}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                {booking.paymentMethod === 'VISA' ? (
                  <CreditCard className="w-4 h-4" style={{ color: '#0066FF' }} />
                ) : (
                  <FileText className="w-4 h-4" style={{ color: '#FFD700' }} />
                )}
                <span className="text-xs text-gray-600">
                  {booking.paymentMethod === 'VISA' ? 'Card Payment' : 'Manual Payment'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" style={getPaymentStatusColor(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
                {!isPast && (
                  <>
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
                    <Button size="sm" onClick={() => openReschedule(booking)}>Reschedule</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/chat/${booking.id}`)}
                    >
                      Chat
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">My Bookings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No upcoming bookings</p>
                  <Button
                    className="mt-4 text-white"
                    style={{ backgroundColor: '#0066FF' }}
                    onClick={() => navigate('/student/dashboard')}
                  >
                    Browse Lecturers
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No past bookings</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {rescheduleFor && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-4">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#0066FF' }}>
              Reschedule: {rescheduleFor.subject}
            </h3>
            <p className="text-sm text-gray-600 mb-3">Choose a new available slot</p>
            <div className="max-h-64 overflow-auto border rounded-lg">
              {options.length ? (
                <ul>
                  {options.map((o) => (
                    <li key={`${o.availabilityId}-${o.slotId}`}>
                      <label className="flex items-center gap-3 p-2 hover:bg-gray-50 roofs">
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
              <Button variant="outline" onClick={() => { setRescheduleFor(null); setSelected(null); }}>Cancel</Button>
              <Button onClick={confirmReschedule} disabled={!selected}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
