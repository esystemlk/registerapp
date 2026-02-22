import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { useEffect, useState } from 'react';
import { listLecturers } from '../../services/db';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { BookOpen, LogOut, Search, Star, Calendar, DollarSign } from 'lucide-react';
import { Lecturer } from '../../types';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;
    listLecturers().then((ls) => {
      if (mounted) setLecturers(ls);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLecturers = lecturers.filter((lecturer) =>
    lecturer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecturer.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="smartlabs" className="w-10 h-10 rounded-full bg-white object-cover" />
              <p className="text-white/80 text-xs">Student Portal</p>
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
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#0066FF' }}>
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600">Find and book classes with expert lecturers</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => navigate('/student/bookings')}
            className="h-20 flex flex-col gap-2 text-white"
            style={{ backgroundColor: '#0066FF' }}
          >
            <Calendar className="w-6 h-6" />
            <span>My Bookings</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col gap-2"
            style={{ borderColor: '#FFD700', color: '#0066FF' }}
          >
            <Star className="w-6 h-6" style={{ color: '#FFD700' }} />
            <span>Favorites</span>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by subject or lecturer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lecturers Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#0066FF' }}>
            Available Lecturers
          </h3>
          <div className="grid gap-4">
            {filteredLecturers.map((lecturer) => (
              <Card
                key={lecturer.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/student/lecturer/${lecturer.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={lecturer.avatar}
                      alt={lecturer.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{lecturer.name}</h4>
                      <p className="text-sm" style={{ color: '#0066FF' }}>
                        {lecturer.subject}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {lecturer.bio}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" style={{ color: '#FFD700' }} />
                          <span className="text-sm font-medium">{lecturer.rating}</span>
                          <span className="text-xs text-gray-500">({lecturer.totalReviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#0066FF' }}>
                          <DollarSign className="w-4 h-4" />
                          {lecturer.price}/hr
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
