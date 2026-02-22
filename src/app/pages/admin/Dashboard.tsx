import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { listBookingsPending, updateBookingStatus, listUsers, updateUserRole, listAllBookings } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BookOpen, LogOut, FileText, CheckCircle, XCircle, Clock, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'REJECTED' | 'CANCELLED'>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'VISA' | 'RECEIPT'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || !['ADMIN','SUPER_ADMIN','DEVELOPER'].includes(user.role)) {
      navigate('/login');
    }
    listBookingsPending().then(setBookings);
    listUsers().then((us) => {
      setUsers(us.filter((u) => !['SUPER_ADMIN','DEVELOPER'].includes(u.role)));
    });
    listAllBookings().then(setAllBookings);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pendingPayments = bookings.filter((b) => b.paymentStatus === 'PENDING' && b.paymentMethod === 'RECEIPT');
  const approvedPayments = bookings.filter((b) => b.paymentStatus === 'APPROVED');
  const rejectedPayments = bookings.filter((b) => b.paymentStatus === 'REJECTED');

  const handleApprove = async (bookingId: string) => {
    await updateBookingStatus(bookingId, { paymentStatus: 'APPROVED', status: 'CONFIRMED' } as any);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.success('Payment approved and booking confirmed!');
    listAllBookings().then(setAllBookings);
  };

  const handleReject = async (bookingId: string) => {
    await updateBookingStatus(bookingId, { paymentStatus: 'REJECTED', status: 'CANCELLED' } as any);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    toast.error('Payment rejected and booking cancelled.');
    listAllBookings().then(setAllBookings);
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (['SUPER_ADMIN','DEVELOPER'].includes(role)) return;
    await updateUserRole(userId, role as any);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    toast.success('Role updated');
  };

  const handleCancel = async (bookingId: string) => {
    await updateBookingStatus(bookingId, { status: 'CANCELLED' } as any);
    toast.success('Booking cancelled');
    listAllBookings().then(setAllBookings);
  };

  const filteredAll = allBookings.filter((b) => {
    const statusOk = statusFilter === 'ALL' ? true : b.status === statusFilter || b.paymentStatus === statusFilter;
    const methodOk = methodFilter === 'ALL' ? true : b.paymentMethod === methodFilter;
    const q = search.trim().toLowerCase();
    const textOk = !q || (b.studentName?.toLowerCase().includes(q) || b.lecturerName?.toLowerCase().includes(q) || b.subject?.toLowerCase().includes(q));
    return statusOk && methodOk && textOk;
  });

  const PaymentCard = ({ booking }: { booking: any }) => (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{booking.studentName}</h3>
              <p className="text-sm" style={{ color: '#0066FF' }}>
                {booking.lecturerName} - {booking.subject}
              </p>
            </div>
            <Badge style={{ backgroundColor: '#FFD700', color: '#000' }}>
              {booking.paymentStatus}
            </Badge>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Date:</strong>{' '}
              {new Date(booking.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p>
              <strong>Time:</strong> {booking.time}
            </p>
            <p>
              <strong>Amount:</strong> ${booking.price}
            </p>
          </div>

          {booking.receiptUrl && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" style={{ color: '#0066FF' }} />
                <span className="text-gray-600">Receipt uploaded</span>
              </div>
              <a
                href={booking.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-1 block"
                style={{ color: '#0066FF' }}
              >
                View receipt →
              </a>
            </div>
          )}

          {booking.paymentStatus === 'PENDING' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                size="sm"
                className="text-white"
                style={{ backgroundColor: '#10b981' }}
                onClick={() => handleApprove(booking.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => handleReject(booking.id)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="smartlabs" className="w-10 h-10 rounded-full bg-white object-cover" />
              <p className="text-white/80 text-xs">Admin Portal</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#0066FF' }}>
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">Manage payments and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#FFD700' }} />
              <p className="text-2xl font-bold">{pendingPayments.length}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2" style={{ color: '#10b981' }} />
              <p className="text-2xl font-bold">{approvedPayments.length}</p>
              <p className="text-xs text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2" style={{ color: '#0066FF' }} />
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              Pending ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedPayments.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((booking) => (
                <PaymentCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No pending payment approvals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedPayments.length > 0 ? (
              approvedPayments.map((booking) => (
                <PaymentCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No approved payments</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedPayments.length > 0 ? (
              rejectedPayments.map((booking) => (
                <PaymentCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">No rejected payments</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: '#0066FF' }}>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                className="border rounded px-2 py-1 text-sm"
                placeholder="Search student, lecturer, subject"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="border rounded px-2 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
              >
                <option value="ALL">All methods</option>
                <option value="VISA">Visa</option>
                <option value="RECEIPT">Receipt</option>
              </select>
              <Button variant="outline" onClick={() => listAllBookings().then(setAllBookings)}>Refresh</Button>
            </div>
            <div className="space-y-3">
              {filteredAll.map((b) => (
                <div key={b.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{b.studentName}</h3>
                      <p className="text-xs" style={{ color: '#0066FF' }}>
                        {b.lecturerName} • {b.subject}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(b.date).toLocaleDateString()} at {b.time} • ${b.price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {b.paymentMethod === 'RECEIPT' && b.paymentStatus === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(b.id)}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(b.id)}>Reject</Button>
                        </>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <Button size="sm" variant="outline" onClick={() => handleCancel(b.id)}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredAll.length === 0 && (
                <div className="text-sm text-gray-600">No bookings found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Management (Admin scope) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle style={{ color: '#0066FF' }}>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="p-3 rounded-lg border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                  </div>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
