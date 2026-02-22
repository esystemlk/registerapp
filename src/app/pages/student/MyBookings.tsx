import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { useEffect, useState } from 'react';
import { listBookingsByStudent } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Calendar, Clock, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Booking } from '../../types';

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
                <h3 className="font-semibold">{booking.lecturerName}</h3>
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
              <Badge variant="outline" style={getPaymentStatusColor(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
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
    </div>
  );
}
