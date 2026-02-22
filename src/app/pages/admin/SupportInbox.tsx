import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { listSupportTickets, updateSupportTicket } from '../../services/db';
import HeaderBar from '../../components/HeaderBar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function SupportInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'ASSIGNED' | 'RESOLVED'>('ALL');

  useEffect(() => {
    if (!user || !['ADMIN','SUPER_ADMIN','DEVELOPER'].includes(user.role)) {
      navigate('/login');
      return;
    }
    listSupportTickets().then(setTickets);
  }, [user]);

  const data = tickets.filter(t => filter === 'ALL' ? true : t.status === filter);

  const assignToMe = async (id: string) => {
    await updateSupportTicket(id, { status: 'ASSIGNED', assignedTo: user!.id });
    setTickets(await listSupportTickets());
  };
  const resolve = async (id: string) => {
    await updateSupportTicket(id, { status: 'RESOLVED' });
    setTickets(await listSupportTickets());
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderBar title="Admin • Support Inbox" color="#0066FF" />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{ color: '#0066FF' }}>Tickets</h1>
          <select className="border rounded px-2 py-1 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div className="space-y-3">
          {data.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t.subject}</span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: t.status === 'RESOLVED' ? '#10b981' : t.status === 'ASSIGNED' ? '#FFD700' : '#e5e7eb' }}>
                    {t.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{t.message}</p>
                <p className="text-xs text-gray-500">From: {t.userId} • {new Date(t.createdAt).toLocaleString()}</p>
                <div className="flex gap-2">
                  {t.status === 'OPEN' && <Button size="sm" onClick={() => assignToMe(t.id)}>Assign to me</Button>}
                  {t.status !== 'RESOLVED' && <Button size="sm" variant="outline" onClick={() => resolve(t.id)}>Mark Resolved</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
          {data.length === 0 && <div className="text-sm text-gray-600">No tickets for this filter.</div>}
        </div>
      </div>
    </div>
  );
}
