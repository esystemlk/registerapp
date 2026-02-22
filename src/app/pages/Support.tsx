import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';
import { createSupportTicket } from '../services/db';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import HeaderBar from '../components/HeaderBar';
import { toast } from 'sonner';

export default function SupportNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please provide subject and message');
      return;
    }
    await createSupportTicket(user!.id, subject.trim(), message.trim());
    toast.success('Support ticket submitted');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <HeaderBar title="Support" color="#0066FF" />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input className="border rounded px-3 py-2 w-full" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <textarea className="border rounded px-3 py-2 w-full min-h-32" placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} />
            <div className="flex justify-end">
              <Button onClick={submit}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
