import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { appointmentService, rtoService } from '@/services';
import { Appointment, RTOOffice, AppointmentPurpose } from '@/types';
import { Calendar, Plus, Clock, MapPin, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const purposeLabels: Record<AppointmentPurpose, string> = {
  DL_TEST: 'Driving License Test',
  VEHICLE_INSPECTION: 'Vehicle Inspection',
  DOCUMENT_VERIFICATION: 'Document Verification',
  OTHER: 'Other',
};



const getStatusBadge = (status: string) => {
  switch (status) {
    case 'SCHEDULED': return <Badge className="badge-info"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
    case 'COMPLETED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case 'CANCELLED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    case 'RESCHEDULED': return <Badge className="badge-warning"><RefreshCw className="h-3 w-3 mr-1" />Rescheduled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const MyAppointments: React.FC = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rtoOffices, setRtoOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rto_office_id: '',
    purpose: '' as AppointmentPurpose,
    appointment_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, officesRes] = await Promise.all([
        appointmentService.getMyAppointments().catch(() => ({ success: false, data: [] })),
        rtoService.listOffices().catch(() => ({ success: false, data: [] })),
      ]);
      
      // Extract appointments array from nested response
      if (apptRes.success && apptRes.data) {
        const apptData = (apptRes.data as any).appointments || apptRes.data || [];
        if (Array.isArray(apptData)) {
          setAppointments(apptData);
        }
      }
      
      // Extract RTO offices array from nested response
      if (officesRes.success && officesRes.data) {
        const officesData = (officesRes.data as any).rtoOffices || officesRes.data || [];
        if (Array.isArray(officesData)) {
          setRtoOffices(officesData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await appointmentService.bookAppointment({
        ...formData,
        appointment_date: new Date(formData.appointment_date).toISOString(),
      });
      if (response.success) {
        toast({ title: 'Success', description: 'Appointment booked successfully!' });
        fetchData();
      }
      setIsDialogOpen(false);
      setFormData({ rto_office_id: '', purpose: '' as AppointmentPurpose, appointment_date: '', notes: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Booking failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const response = await appointmentService.cancelAppointment(id);
      if (response.success) {
        toast({ title: 'Success', description: 'Appointment cancelled' });
        fetchData();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to cancel', variant: 'destructive' });
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'SCHEDULED' && new Date(a.appointment_date) > new Date());
  const pastAppointments = appointments.filter(a => a.status !== 'SCHEDULED' || new Date(a.appointment_date) <= new Date());

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your RTO appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient"><Plus className="h-4 w-4 mr-2" />Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v as AppointmentPurpose })}>
                  <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select purpose" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(purposeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>RTO Office</Label>
                <Select value={formData.rto_office_id} onValueChange={(v) => setFormData({ ...formData, rto_office_id: v })}>
                  <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select RTO office" /></SelectTrigger>
                  <SelectContent>{rtoOffices.map((o) => <SelectItem key={o.id} value={o.id}>{o.name} - {o.city}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} className="bg-muted/50" required />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea placeholder="Any additional notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="bg-muted/50" />
              </div>
              <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Book Appointment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingAppointments.map((appt, index) => (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="glass-card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-foreground" />
                      </div>
                      {getStatusBadge(appt.status)}
                    </div>
                    <h3 className="font-semibold mb-2">{purposeLabels[appt.purpose]}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4" />{new Date(appt.appointment_date).toLocaleString()}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />RTO Office</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1"><RefreshCw className="h-4 w-4 mr-1" />Reschedule</Button>
                      <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => handleCancel(appt.id)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
          <div className="space-y-3">
            {pastAppointments.map((appt) => (
              <Card key={appt.id} className="glass-card">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{purposeLabels[appt.purpose]}</p>
                        <p className="text-sm text-muted-foreground">{new Date(appt.appointment_date).toLocaleString()}</p>
                      </div>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appointments</h3>
            <p className="text-muted-foreground mb-4">Book an appointment to visit your nearest RTO office</p>
            <Button className="btn-gradient" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Book Appointment</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAppointments;
