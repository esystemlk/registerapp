import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router';
import { listAllBookings } from '../../services/db';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ statusCounts: [], revenueBySubject: [] });

  useEffect(() => {
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(user.role)) {
      navigate('/login');
      return;
    }
    listAllBookings().then((b) => {
      const statusCountsMap: Record<string, number> = {};
      const revenueMap: Record<string, number> = {};
      b.forEach((x) => {
        statusCountsMap[x.status] = (statusCountsMap[x.status] || 0) + 1;
        if (x.paymentStatus === 'APPROVED') {
          revenueMap[x.subject] = (revenueMap[x.subject] || 0) + (x.price || 0);
        }
      });
      setData({
        statusCounts: Object.entries(statusCountsMap).map(([k, v]) => ({ status: k, count: v })),
        revenueBySubject: Object.entries(revenueMap).map(([k, v]) => ({ subject: k, revenue: v })),
      });
    });
  }, [user]);

  const colors = ['#0066FF', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: '#0066FF' }}>Analytics</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>Back to Admin</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusCounts}>
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0066FF" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Subject</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.revenueBySubject} dataKey="revenue" nameKey="subject" outerRadius={90} label>
                    {data.revenueBySubject.map((_: any, idx: number) => (
                      <Cell key={`c-${idx}`} fill={colors[idx % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
