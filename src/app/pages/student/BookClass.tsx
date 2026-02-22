import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../../AuthContext';
import { getLecturer, listAvailabilityByLecturer, reserveSlotAndCreateBooking, uploadReceipt } from '../../services/db';
import { Lecturer, Availability } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { ArrowLeft, Calendar, CreditCard, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function BookClass() {
  const { lecturerId } = useParams<{ lecturerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'VISA' | 'RECEIPT'>('VISA');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);

  useEffect(() => {
    if (lecturerId) {
      getLecturer(lecturerId).then(setLecturer);
      listAvailabilityByLecturer(lecturerId).then(setAvailability);
    }
  }, [lecturerId]);

  if (!lecturer) {
    return <div>Lecturer not found</div>;
  }

  // Get next 7 days
  const dates = availability.slice(0, 7);

  const selectedAvailability = availability.find((a) => a.date === selectedDate);
  const availableSlots = selectedAvailability?.timeSlots.filter((slot) => slot.available) || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'VISA') {
      if (!cardNumber || cardNumber.length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      const bookingData = {
        studentId: user!.id,
        studentName: user!.name,
        lecturerId: lecturer.id,
        lecturerName: lecturer.name,
        subject: lecturer.subject,
        date: selectedDate,
        time: selectedTime,
        status: 'CONFIRMED' as const,
        paymentMethod: 'VISA' as const,
        paymentStatus: 'APPROVED' as const,
        price: lecturer.price,
      };
      if (selectedAvailability) {
        await reserveSlotAndCreateBooking(selectedAvailability.id, selectedSlotId, bookingData as any);
      }
      toast.success('Booking confirmed! Payment successful.');
      setShowPaymentDialog(false);
      navigate('/student/bookings');
    } else {
      if (!receiptFile) {
        toast.error('Please upload a payment receipt');
        return;
      }
      let url = '';
      try {
        url = await uploadReceipt(user!.id, receiptFile);
      } catch {}
      const bookingData = {
        studentId: user!.id,
        studentName: user!.name,
        lecturerId: lecturer.id,
        lecturerName: lecturer.name,
        subject: lecturer.subject,
        date: selectedDate,
        time: selectedTime,
        status: 'PENDING' as const,
        paymentMethod: 'RECEIPT' as const,
        paymentStatus: 'PENDING' as const,
        receiptUrl: url || undefined,
        price: lecturer.price,
      };
      if (selectedAvailability) {
        await reserveSlotAndCreateBooking(selectedAvailability.id, selectedSlotId, bookingData as any);
      }
      toast.success('Booking submitted! Waiting for admin approval.');
      setShowPaymentDialog(false);
      navigate('/student/bookings');
    }
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
              onClick={() => navigate(`/student/lecturer/${lecturerId}`)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold">Book a Class</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Lecturer Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={lecturer.avatar}
                alt={lecturer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-lg">{lecturer.name}</h2>
                <p className="text-sm" style={{ color: '#0066FF' }}>
                  {lecturer.subject}
                </p>
                <p className="text-sm font-semibold mt-1">
                  ${lecturer.price} / hour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#0066FF' }} />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {dates.map((avail) => {
                const date = new Date(avail.date);
                const isSelected = selectedDate === avail.date;
                return (
                  <Button
                    key={avail.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="h-auto py-3 flex flex-col"
                    style={
                      isSelected
                        ? { backgroundColor: '#0066FF', color: 'white' }
                        : {}
                    }
                    onClick={() => {
                      setSelectedDate(avail.date);
                      setSelectedTime('');
                    }}
                  >
                    <span className="text-sm font-semibold">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xs">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle style={{ color: '#0066FF' }}>Select Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <Button
                      key={slot.id}
                      variant={isSelected ? 'default' : 'outline'}
                      style={
                        isSelected
                          ? { backgroundColor: '#FFD700', color: '#000' }
                          : {}
                      }
                      onClick={() => {
                        setSelectedTime(slot.time);
                        setSelectedSlotId(slot.id);
                      }}
                    >
                      {slot.time}
                    </Button>
                  );
                })}
              </div>
              {availableSlots.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No available slots for this date
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Book Button */}
        {selectedDate && selectedTime && (
          <Button
            className="w-full h-12 text-white text-lg"
            style={{ backgroundColor: '#0066FF' }}
            onClick={handleBooking}
          >
            Proceed to Payment
          </Button>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#0066FF' }}>Complete Payment</DialogTitle>
            <DialogDescription>
              Total Amount: ${lecturer.price}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <Label className="mb-3 block">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'VISA' | 'RECEIPT')}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="VISA" id="visa" />
                  <Label htmlFor="visa" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" style={{ color: '#0066FF' }} />
                    Pay with Visa Card
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="RECEIPT" id="receipt" />
                  <Label htmlFor="receipt" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Upload className="w-5 h-5" style={{ color: '#FFD700' }} />
                    Upload Payment Receipt
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Input */}
            {paymentMethod === 'VISA' ? (
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  maxLength={16}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" maxLength={3} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Receipt (Image or PDF)</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                {receiptFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    {receiptFile.name}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Your booking will be pending until admin approves the payment
                </p>
              </div>
            )}

            {/* Confirm Button */}
            <Button
              className="w-full text-white"
              style={{ backgroundColor: '#0066FF' }}
              onClick={handlePayment}
            >
              {paymentMethod === 'VISA' ? 'Pay Now' : 'Submit Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
