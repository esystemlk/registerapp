import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../AuthContext';
import { getDashboardRoute } from '../mockData';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      toast.success('Signed in successfully');
      // onAuthStateChanged will route after user object updates
    } catch (err: any) {
      toast.error(err?.message || 'Sign in failed');
    }
  };

  if (user) {
    navigate(getDashboardRoute(user.role));
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#ffffff' }}>
      {/* Logo/Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="smartlabs" className="h-12 w-auto" />
        <p className="text-sm text-gray-600">Book your classes instantly</p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle style={{ color: '#0066FF' }}>Welcome Back</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-white"
              style={{ backgroundColor: '#0066FF' }}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (err: any) {
                  toast.error(err?.message || 'Google sign-in failed');
                }
              }}
            >
              Continue with Google
            </Button>
            <div className="text-center text-xs text-gray-600 mt-3">
              Don&apos;t have an account?{' '}
              <button className="underline" onClick={() => navigate('/register')}>Register</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-500 max-w-md">
        <p>Demo app with role-based access control</p>
        <p className="mt-1">Each role has different permissions and features</p>
      </div>
    </div>
  );
}
