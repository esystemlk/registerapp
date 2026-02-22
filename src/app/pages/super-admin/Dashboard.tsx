import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { listUsers, updateUserRole, listAllBookings, listLecturers } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BookOpen, LogOut, Users, BookMarked, TrendingUp, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [lecturerCount, setLecturerCount] = useState(0);

  useEffect(() => {
    if (!user || !['SUPER_ADMIN','DEVELOPER'].includes(user.role)) {
      navigate('/login');
    }
    listUsers().then(setUsers);
    listAllBookings().then((bks) => {
      setBookings(bks);
      setTotalBookings(bks.length);
      setRevenue(bks.reduce((sum, b) => sum + (b.price || 0), 0));
    });
    listLecturers().then((ls) => setLecturerCount(ls.length));
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole as any);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
    );
    toast.success('User role updated successfully!');
  };

  const stats = {
    totalUsers: users.length,
    students: users.filter((u) => u.role === 'STUDENT').length,
    lecturers: lecturerCount,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    totalBookings,
    revenue,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { backgroundColor: '#8b5cf6', color: 'white' };
      case 'ADMIN':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'LECTURER':
        return { backgroundColor: '#0066FF', color: 'white' };
      case 'DEVELOPER':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'STUDENT':
        return { backgroundColor: '#FFD700', color: '#000' };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#8b5cf6' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="smartlabs" className="w-10 h-10 rounded-full bg-white object-cover" />
              <p className="text-white/80 text-xs">Super Admin Portal</p>
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
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#8b5cf6' }}>
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">Full system control and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0f7ff' }}>
                  <Users className="w-6 h-6" style={{ color: '#0066FF' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                  <BookMarked className="w-6 h-6" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-xs text-gray-600">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fffbeb' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#FFD700' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.revenue}</p>
                  <p className="text-xs text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f3ff' }}>
                  <Settings className="w-6 h-6" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.lecturers}</p>
                  <p className="text-xs text-gray-600">Active Lecturers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#8b5cf6' }}>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="p-3 rounded-lg border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {u.avatar && (
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full" />
                        )}
                        {!u.avatar && (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0f7ff' }}>
                            <Users className="w-5 h-5" style={{ color: '#0066FF' }} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="text-xs text-gray-600">{u.email}</p>
                        </div>
                      </div>
                      <Select
                        value={u.role}
                        onValueChange={(value) => handleRoleChange(u.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="LECTURER">Lecturer</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#8b5cf6' }}>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{booking.studentName}</p>
                          <p className="text-xs" style={{ color: '#0066FF' }}>
                            {booking.lecturerName} - {booking.subject}
                          </p>
                        </div>
                        <Badge>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time} • ${booking.price}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#8b5cf6' }}>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f7ff' }}>
                    <h4 className="font-semibold mb-1" style={{ color: '#0066FF' }}>
                      Platform Commission
                    </h4>
                    <p className="text-sm text-gray-600">15% per booking</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                    <h4 className="font-semibold mb-1" style={{ color: '#FFD700' }}>
                      Payment Gateway
                    </h4>
                    <p className="text-sm text-gray-600">Visa • Manual Receipt</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                    <h4 className="font-semibold mb-1" style={{ color: '#10b981' }}>
                      System Status
                    </h4>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
