import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../AuthContext';
import { useEffect, useState } from 'react';
import { getLecturer } from '../../services/db';
import { Lecturer } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Star, DollarSign, Calendar, Clock } from 'lucide-react';
import { useEffect } from 'react';

export default function LecturerDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      navigate('/login');
    }
  }, [user, navigate]);

  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  useEffect(() => {
    if (id) {
      getLecturer(id).then(setLecturer);
    }
  }, [id]);

  if (!lecturer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lecturer not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Lecturer Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <img
                src={lecturer.avatar}
                alt={lecturer.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <h2 className="text-2xl font-bold mb-1">{lecturer.name}</h2>
              <p className="text-lg" style={{ color: '#0066FF' }}>
                {lecturer.subject}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-current" style={{ color: '#FFD700' }} />
                  <span className="font-semibold">{lecturer.rating}</span>
                  <span className="text-sm text-gray-500">({lecturer.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2" style={{ color: '#0066FF' }}>
                About
              </h3>
              <p className="text-gray-700">{lecturer.bio}</p>
            </div>

            {/* Price & Availability */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f7ff' }}>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5" style={{ color: '#0066FF' }} />
                  <span className="text-sm text-gray-600">Hourly Rate</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#0066FF' }}>
                  ${lecturer.price}
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5" style={{ color: '#FFD700' }} />
                  <span className="text-sm text-gray-600">Available Days</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lecturer.availability.map((day) => (
                    <Badge
                      key={day}
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: '#FFD700', color: '#000' }}
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Button */}
            <Button
              className="w-full h-12 text-white text-lg"
              style={{ backgroundColor: '#0066FF' }}
              onClick={() => navigate(`/student/book/${lecturer.id}`)}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Class
            </Button>
          </CardContent>
        </Card>

        {/* Reviews Section (Mock) */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4" style={{ color: '#0066FF' }}>
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pb-4 border-b last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-current"
                          style={{ color: '#FFD700' }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">Student {i}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Excellent teaching style! Very patient and explains concepts clearly.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
