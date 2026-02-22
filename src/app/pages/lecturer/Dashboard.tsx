import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { useEffect, useState } from 'react';
import { listBookingsByLecturer, listLecturers } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BookOpen, LogOut, Calendar as CalendarIcon, Settings, Clock, Users } from 'lucide-react';
import { Booking, Lecturer } from '../../types';
import HeaderBar from '../../components/HeaderBar';

export default function LecturerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!user || !['LECTURER','ADMIN','SUPER_ADMIN','DEVELOPER'].includes(user.role)) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [lecturerProfile, setLecturerProfile] = useState<Lecturer | undefined>(undefined);
  useEffect(() => {
    listLecturers().then((ls) => {
      const lp = ls.find((l) => l.userId === user?.id);
      setLecturerProfile(lp);
    });
  }, [user?.id]);

  const [lecturerBookings, setLecturerBookings] = useState<Booking[]>([]);
  useEffect(() => {
    const lid = lecturerProfile?.id;
    if (!lid) return;
    listBookingsByLecturer(lid).then(setLecturerBookings);
  }, [lecturerProfile?.id]);

  const todayBookings = lecturerBookings.filter((b) => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    return (
      bookingDate.toDateString() === today.toDateString() &&
      b.status === 'CONFIRMED'
    );
  });

  const upcomingBookings = lecturerBookings.filter((b) => {
    const bookingDate = new Date(b.date);
    return bookingDate > new Date() && b.status === 'CONFIRMED';
  });

  // Generate calendar for current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const hasBookingOnDate = (day: number | null) => {
    if (!day) return false;
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return lecturerBookings.some((b) => {
      const bookingDate = new Date(b.date);
      return bookingDate.toDateString() === date.toDateString() && b.status === 'CONFIRMED';
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderBar title="Lecturer Portal" color="#0066FF" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#0066FF' }}>
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">Manage your classes and availability</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <CalendarIcon className="w-6 h-6 mx-auto mb-2" style={{ color: '#0066FF' }} />
              <p className="text-2xl font-bold">{todayBookings.length}</p>
              <p className="text-xs text-gray-600">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#FFD700' }} />
              <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              <p className="text-xs text-gray-600">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#10b981' }} />
              <p className="text-2xl font-bold">{lecturerBookings.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => navigate('/lecturer/availability')}
            className="h-20 flex flex-col gap-2 text-white"
            style={{ backgroundColor: '#0066FF' }}
          >
            <Settings className="w-6 h-6" />
            <span>Set Availability</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            style={{ borderColor: '#FFD700', color: '#0066FF' }}
          >
            <Users className="w-6 h-6" />
            <span>My Students</span>
          </Button>
        </div>

        {/* Calendar View */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span style={{ color: '#0066FF' }}>Calendar</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  →
                </Button>
              </div>
            </CardTitle>
            <p className="text-sm text-gray-600">{monthName}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const hasBooking = hasBookingOnDate(day);
                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-sm rounded ${
                      day
                        ? hasBooking
                          ? 'font-semibold text-white'
                          : 'text-gray-700'
                        : ''
                    }`}
                    style={
                      hasBooking
                        ? { backgroundColor: '#0066FF' }
                        : day
                        ? { backgroundColor: '#f9fafb' }
                        : {}
                    }
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: '#0066FF' }}>Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div key={booking.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{booking.studentName}</h4>
                      <Badge style={{ backgroundColor: '#10b981', color: 'white' }}>
                        {booking.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{booking.subject}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No classes scheduled for today</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
