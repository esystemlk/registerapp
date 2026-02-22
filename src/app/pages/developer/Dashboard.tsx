import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BookOpen, LogOut, Code, Database, Server, Lock, Zap, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listUsers, listAllBookings, listLecturers, updateUserRole } from '../../services/db';
import HeaderBar from '../../components/HeaderBar';

export default function DeveloperDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'DEVELOPER') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/login', description: 'User authentication' },
    { method: 'GET', path: '/api/users', description: 'Get all users' },
    { method: 'GET', path: '/api/lecturers', description: 'Get all lecturers' },
    { method: 'POST', path: '/api/bookings', description: 'Create booking' },
    { method: 'GET', path: '/api/bookings/:id', description: 'Get booking details' },
    { method: 'PUT', path: '/api/bookings/:id', description: 'Update booking' },
    { method: 'POST', path: '/api/payments', description: 'Process payment' },
    { method: 'POST', path: '/api/receipts/upload', description: 'Upload receipt' },
    { method: 'GET', path: '/api/availability/:lecturerId', description: 'Get availability' },
    { method: 'PUT', path: '/api/availability', description: 'Update availability' },
  ];

  const [dbTables, setDbTables] = useState<Array<{ name: string; records: number; size: string }>>([]);
  useEffect(() => {
    Promise.all([listUsers(), listAllBookings(), listLecturers()]).then(([users, bookings, lecturers]) => {
      setDbTables([
        { name: 'users', records: users.length, size: '-' },
        { name: 'lecturers', records: lecturers.length, size: '-' },
        { name: 'bookings', records: bookings.length, size: '-' },
        { name: 'availability', records: 0, size: '-' },
        { name: 'receipts (storage)', records: 0, size: '-' },
      ]);
    });
  }, []);

  const systemMetrics = {
    uptime: '99.98%',
    avgResponseTime: '145ms',
    activeConnections: 42,
    cacheHitRate: '94.2%',
    errorRate: '0.02%',
  };

  const [usersList, setUsersList] = useState<any[]>([]);
  useEffect(() => {
    listUsers().then(setUsersList);
  }, []);
  const onRoleChange = async (id: string, role: string) => {
    await updateUserRole(id, role as any);
    setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderBar title="Developer Portal" color="#10b981" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#10b981' }}>
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">System architecture and API documentation</p>
        </div>

        {/* Portals */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" style={{ color: '#10b981' }} />
              Portals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="h-12 rounded-lg border flex items-center justify-center gap-2"
                onClick={() => navigate('/student/dashboard')}
              >
                <BookOpen className="w-4 h-4" style={{ color: '# shading' as any }} />
                <span className="text-sm">Student</span>
              </button>
              <button
                className="h-12 rounded-lg border flex items-center justify-center gap-2"
                onClick={() => navigate('/lecturer/dashboard')}
              >
                <Database className="w-4 h-4" style={{ color: '#10b981' }} />
                <span className="text-sm">Lecturer</span>
              </button>
              <button
                className="h-12 rounded-lg border flex items-center justify-center gap-2"
                onClick={() => navigate('/admin/dashboard')}
              >
                <Server className="w-4 h-4" style={{ color: '#0066FF' }} />
                <span className="text-sm">Admin</span>
              </button>
              <button
                className="h-12 rounded-lg border flex items-center justify-center gap-2"
                onClick={() => navigate('/super-admin/dashboard')}
              >
                <Users className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                <span className="text-sm">Super Admin</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#10b981' }} />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                <p className="text-xs text-gray-600">Uptime</p>
                <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                  {systemMetrics.uptime}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f0f7ff' }}>
                <p className="text-xs text-gray-600">Avg Response</p>
                <p className="text-lg font-bold" style={{ color: '#0066FF' }}>
                  {systemMetrics.avgResponseTime}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                <p className="text-xs text-gray-600">Active Connections</p>
                <p className="text-lg font-bold" style={{ color: '#FFD700' }}>
                  {systemMetrics.activeConnections}
                </p>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef2f2' }}>
                <p className="text-xs text-gray-600">Error Rate</p>
                <p className="text-lg font-bold" style={{ color: '#ef4444' }}>
                  {systemMetrics.errorRate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" style={{ color: '#10b981' }} />
              REST API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="flex items-start gap-2 mb-1">
                    <Badge
                      style={{
                        backgroundColor:
                          endpoint.method === 'GET'
                            ? '#10b981'
                            : endpoint.method === 'POST'
                            ? '#0066FF'
                            : '#FFD700',
                        color: endpoint.method === 'PUT' ? '#000' : 'white',
                      }}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-xs flex-1 font-mono" style={{ color: '#0066FF' }}>
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 ml-14">{endpoint.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Tables */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" style={{ color: '#10b981' }} />
              Database Schema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dbTables.map((table) => (
                <div
                  key={table.name}
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: '#f0fdf4' }}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" style={{ color: '#10b981' }} />
                    <code className="text-sm font-mono font-semibold">{table.name}</code>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{table.records} records</span>
                    <span>{table.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" style={{ color: '#10b981' }} />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usersList.map((u) => (
                <div key={u.id} className="p-3 rounded-lg border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                  </div>
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={u.role}
                    onChange={(e) => onRoleChange(u.id, e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="LECTURER">Lecturer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" style={{ color: '#10b981' }} />
              Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border">
                <p className="font-semibold text-sm mb-1">JWT Authentication</p>
                <p className="text-xs text-gray-600">
                  Token-based authentication with 24-hour expiry
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="font-semibold text-sm mb-1">Role-Based Access Control</p>
                <p className="text-xs text-gray-600">
                  5 roles: Student, Lecturer, Admin, Super Admin, Developer
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="font-semibold text-sm mb-1">Payment Security</p>
                <p className="text-xs text-gray-600">
                  PCI-DSS compliant payment gateway with SSL/TLS encryption
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="font-semibold text-sm mb-1">File Upload Validation</p>
                <p className="text-xs text-gray-600">
                  Receipt uploads limited to images and PDFs, max 5MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
