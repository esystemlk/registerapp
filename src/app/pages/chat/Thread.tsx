import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { db, storage } from '../../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ArrowLeft } from 'lucide-react';

type Msg = { id: string; senderId: string; text?: string; fileUrl?: string; at?: any };

export default function ChatThread() {
  const { bookingId } = useParams() as any;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const qy = query(collection(db, 'bookings', bookingId, 'messages'), orderBy('at', 'asc'));
    const unsub = onSnapshot(qy, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    return () => unsub();
  }, [bookingId, user]);

  const send = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
      senderId: user?.id,
      text,
      at: new Date().toISOString(),
    });
    setText('');
  };

  const sendFile = async (f: File) => {
    const r = ref(storage, `chat/${bookingId}/${Date.now()}-${f.name}`);
    await uploadBytes(r, f);
    const url = await getDownloadURL(r);
    await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
      senderId: user?.id,
      fileUrl: url,
      at: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Chat</h1>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl ${m.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-white/80 border'}`}>
                    {m.text && <div>{m.text}</div>}
                    {m.fileUrl && (
                      <a href={m.fileUrl} target="_blank" className="underline text-sm">Attachment</a>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => { if (e.key === 'Enter') send(); }} />
              <label className="px-3 py-2 border rounded-lg bg-white/60 backdrop-blur cursor-pointer">
                File
                <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) sendFile(f); }} />
              </label>
              <Button onClick={send}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
