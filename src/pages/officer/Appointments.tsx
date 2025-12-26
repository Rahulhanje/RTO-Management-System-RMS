import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { appointmentService } from '@/services';
import { Appointment, AppointmentPurpose } from '@/types';
import { Calendar, Clock, MapPin, Loader2, CheckCircle2, XCircle, RefreshCw, User } from 'lucide-react';

const purposeLabels: Record<AppointmentPurpose, string> = {
  DL_TEST: 'Driving License Test',
  VEHICLE_INSPECTION: 'Vehicle Inspection',
  DOCUMENT_VERIFICATION: 'Document Verification',
  OTHER: 'Other',
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'BOOKED':
    case 'SCHEDULED': return <Badge className="badge-info"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
    case 'COMPLETED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case 'CANCELLED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
    case 'RESCHEDULED': return <Badge className="badge-warning"><RefreshCw className="h-3 w-3 mr-1" />Rescheduled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const Appointments: React.FC = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await appointmentService.listAppointments();
      if (response.success && response.data) {
        const apptData = (response.data as any).appointments || response.data || [];
        if (Array.isArray(apptData)) {
          setAppointments(apptData);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    
    setIsSubmitting(true);
    try {
      const response = await appointmentService.completeAppointment(
        selectedAppointment.id, 
        completionNotes
      );
      if (response.success) {
        toast({ title: 'Success', description: 'Appointment marked as completed!' });
        fetchAppointments();
        setIsCompleteDialogOpen(false);
        setSelectedAppointment(null);
        setCompletionNotes('');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to complete appointment', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCompleteDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCompletionNotes('');
    setIsCompleteDialogOpen(true);
  };

  const upcomingAppointments = appointments.filter(a => 
    (a.status === 'SCHEDULED' || a.status === 'BOOKED') && new Date(a.appointment_date) >= new Date()
  );
  const completedAppointments = appointments.filter(a => 
    a.status === 'COMPLETED' || a.status === 'CANCELLED'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">Manage citizen appointments</p>
      </div>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>Mark this appointment as completed and add any notes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-2">
              <Label>Appointment Details</Label>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{selectedAppointment && purposeLabels[selectedAppointment.purpose]}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAppointment && new Date(selectedAppointment.appointment_date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Completion Notes (Optional)</Label>
              <Textarea 
                placeholder="Add any notes about the appointment completion..." 
                value={completionNotes} 
                onChange={(e) => setCompletionNotes(e.target.value)} 
                className="bg-muted/50"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsCompleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-gradient flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Mark Complete'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Scheduled Appointments</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingAppointments.map((appt, index) => (
              <motion.div 
                key={appt.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-foreground" />
                      </div>
                      {getStatusBadge(appt.status)}
                    </div>
                    <h3 className="font-semibold mb-2">{purposeLabels[appt.purpose]}</h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(appt.appointment_date).toLocaleString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Citizen ID: {appt.user_id.substring(0, 8)}...
                      </p>
                    </div>
                    <Button 
                      className="btn-gradient w-full" 
                      size="sm" 
                      onClick={() => openCompleteDialog(appt)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Appointments */}
      {completedAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Completed Appointments</h2>
          <div className="space-y-3">
            {completedAppointments.map((appt) => (
              <Card key={appt.id} className="glass-card">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{purposeLabels[appt.purpose]}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appt.appointment_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>
                  {appt.notes && (
                    <div className="mt-3 p-2 rounded bg-muted/30 text-sm">
                      <p className="text-muted-foreground">Notes: {appt.notes}</p>
                    </div>
                  )}
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
            <p className="text-muted-foreground">No appointments scheduled yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Appointments;
