import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  time: string;
  enabled: boolean;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

export default function LecturerAvailability() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'LECTURER') {
      navigate('/login');
    }
  }, [user, navigate]);

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Tuesday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Wednesday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Thursday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Friday',
      enabled: true,
      slots: timeSlots.map((time) => ({ time, enabled: true })),
    },
    {
      day: 'Saturday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
    {
      day: 'Sunday',
      enabled: false,
      slots: timeSlots.map((time) => ({ time, enabled: false })),
    },
  ]);

  const toggleDay = (dayIndex: number) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dayIndex].enabled = !newAvailability[dayIndex].enabled;
      return newAvailability;
    });
  };

  const toggleSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) => {
      const newAvailability = [...prev];
      newAvailability[dayIndex].slots[slotIndex].enabled =
        !newAvailability[dayIndex].slots[slotIndex].enabled;
      return newAvailability;
    });
  };

  const handleSave = () => {
    toast.success('Availability updated successfully!');
    navigate('/lecturer/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#0066FF' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/lecturer/dashboard')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Set Availability</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <Card className="mb-6" style={{ backgroundColor: '#f0f7ff', borderColor: '#0066FF' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5" style={{ color: '#0066FF' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#0066FF' }}>
                  Configure Your Schedule
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Enable days and select time slots when you're available for classes. Students can only book during these times.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <div className="space-y-4">
          {availability.map((dayAvail, dayIndex) => (
            <Card key={dayAvail.day}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dayAvail.day}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`day-${dayIndex}`} className="text-sm text-gray-600">
                      {dayAvail.enabled ? 'Available' : 'Not Available'}
                    </Label>
                    <Switch
                      id={`day-${dayIndex}`}
                      checked={dayAvail.enabled}
                      onCheckedChange={() => toggleDay(dayIndex)}
                    />
                  </div>
                </div>
              </CardHeader>
              {dayAvail.enabled && (
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {dayAvail.slots.map((slot, slotIndex) => (
                      <Button
                        key={slot.time}
                        variant={slot.enabled ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        style={
                          slot.enabled
                            ? { backgroundColor: '#0066FF', color: 'white' }
                            : {}
                        }
                        onClick={() => toggleSlot(dayIndex, slotIndex)}
                      >
                        {slot.enabled && <Check className="w-3 h-3 mr-1" />}
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 pt-6 pb-6" style={{ backgroundColor: '#f8f9fa' }}>
          <Button
            className="w-full h-12 text-white text-lg"
            style={{ backgroundColor: '#0066FF' }}
            onClick={handleSave}
          >
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
