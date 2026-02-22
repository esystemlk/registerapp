import { useState } from 'react';
import { useNavigate } from 'react-router';
import { auth, FIREBASE_ENABLED, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!FIREBASE_ENABLED) {
      toast.error('Firebase not configured');
      return;
    }
    if (email !== email2) {
      toast.error('Emails do not match');
      return;
    }
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      await sendEmailVerification(cred.user);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name: name || email,
        role: 'STUDENT',
        emailVerified: false,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      toast.success('Account created. Verification email sent.');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ffffff' }}>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle style={{ color: '#0066FF' }}>Create Account</CardTitle>
          <CardDescription>Register and complete your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email2">Confirm Email</Label>
              <Input id="email2" type="email" value={email2} onChange={(e) => setEmail2(e.target.value)} placeholder="Confirm email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2">Confirm Password</Label>
              <Input id="password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Repeat password" required />
            </div>
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#0066FF' }}>
              Register
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
