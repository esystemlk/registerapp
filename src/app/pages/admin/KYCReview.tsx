import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { listKycApplicants, setKycStatus } from '../../services/db';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import HeaderBar from '../../components/HeaderBar';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCReview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [reasonText, setReasonText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !['ADMIN','SUPER_ADMIN','DEVELOPER'].includes(user.role)) {
      navigate('/login');
      return;
    }
    listKycApplicants().then(setRows);
  }, [user]);

  const data = rows.filter((r) => filter === 'ALL' ? true : (r.kycStatus === filter));

  const approve = async (uid: string) => {
    await setKycStatus(uid, 'APPROVED');
    toast.success('KYC approved');
    listKycApplicants().then(setRows);
  };
  const reject = async (uid: string) => {
    const reason = reasonText[uid] || '';
    await setKycStatus(uid, 'REJECTED', reason);
    toast.error('KYC rejected');
    listKycApplicants().then(setRows);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderBar title="Admin • KYC Review" color="#0066FF" />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold" style={{ color: '#0066FF' }}>Lecturer Verification</h1>
          <select className="border rounded px-2 py-1 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="space-y-3">
          {data.map((u) => (
            <Card key={u.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{u.name || u.email}</span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: u.kycStatus === 'APPROVED' ? '#10b981' : u.kycStatus === 'REJECTED' ? '#ef4444' : '#FFD700', color: u.kycStatus === 'PENDING' ? '#000' : '#fff' }}>
                    {u.kycStatus || 'N/A'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(u.kycFiles || []).map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" className="text-sm underline" rel="noreferrer">Document {idx + 1}</a>
                  ))}
                  {(!u.kycFiles || u.kycFiles.length === 0) && (
                    <span className="text-sm text-gray-500">No files</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => approve(u.id)} className="text-white" style={{ backgroundColor: '#10b981' }}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reject(u.id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <input
                    className="border rounded px-2 py-1 text-sm flex-1"
                    placeholder="Rejection reason (optional)"
                    value={reasonText[u.id] || ''}
                    onChange={(e) => setReasonText({ ...reasonText, [u.id]: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {data.length === 0 && (
            <div className="text-sm text-gray-600">No applicants found for this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}
