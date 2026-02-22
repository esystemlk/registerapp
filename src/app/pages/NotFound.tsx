import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fef2f2' }}>
            <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0066FF' }}>404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <Button
            onClick={() => navigate('/login')}
            className="text-white"
            style={{ backgroundColor: '#0066FF' }}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
