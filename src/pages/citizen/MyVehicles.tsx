import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { vehicleService, rtoService } from '@/services';
import { Vehicle, RTOOffice, VehicleType, FuelType } from '@/types';
import { Car, Plus, Eye, RefreshCw, Trash2, Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

const vehicleTypes: VehicleType[] = ['CAR', 'MOTORCYCLE', 'TRUCK', 'BUS', 'AUTO', 'OTHER'];
const fuelTypes: FuelType[] = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'REJECTED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    case 'SCRAPPED': return <Badge variant="outline"><Trash2 className="h-3 w-3 mr-1" />Scrapped</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const MyVehicles: React.FC = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rtoOffices, setRtoOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: '' as VehicleType,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    engine_number: '',
    chassis_number: '',
    fuel_type: '' as FuelType,
    rto_office_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesRes, officesRes] = await Promise.all([
        vehicleService.getMyVehicles().catch(() => ({ success: false, data: [] })),
        rtoService.listOffices().catch(() => ({ success: false, data: [] })),
      ]);
      if (vehiclesRes.success && Array.isArray(vehiclesRes.data)) {
        setVehicles(vehiclesRes.data);
      } else {
        setVehicles([]);
      }
      if (officesRes.success && Array.isArray(officesRes.data)) {
        setRtoOffices(officesRes.data);
      } else {
        setRtoOffices([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setVehicles([]);
      setRtoOffices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await vehicleService.register(formData);
      if (response.success) {
        toast({ title: 'Success', description: 'Vehicle registration submitted!' });
        setIsDialogOpen(false);
        fetchData();
        setFormData({ vehicle_type: '' as VehicleType, make: '', model: '', year: new Date().getFullYear(), color: '', engine_number: '', chassis_number: '', fuel_type: '' as FuelType, rto_office_id: '' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Registration failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Vehicles</h1>
          <p className="text-muted-foreground">Manage your registered vehicles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient"><Plus className="h-4 w-4 mr-2" />Register Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={formData.vehicle_type} onValueChange={(v) => setFormData({ ...formData, vehicle_type: v as VehicleType })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{vehicleTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={formData.fuel_type} onValueChange={(v) => setFormData({ ...formData, fuel_type: v as FuelType })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select fuel" /></SelectTrigger>
                    <SelectContent>{fuelTypes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Make</Label><Input placeholder="e.g., Maruti" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} className="bg-muted/50" required /></div>
                <div className="space-y-2"><Label>Model</Label><Input placeholder="e.g., Swift" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="bg-muted/50" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Year</Label><Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="bg-muted/50" required /></div>
                <div className="space-y-2"><Label>Color</Label><Input placeholder="e.g., Red" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="bg-muted/50" required /></div>
              </div>
              <div className="space-y-2"><Label>Engine Number</Label><Input placeholder="Enter engine number" value={formData.engine_number} onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })} className="bg-muted/50" required /></div>
              <div className="space-y-2"><Label>Chassis Number</Label><Input placeholder="Enter chassis number" value={formData.chassis_number} onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })} className="bg-muted/50" required /></div>
              <div className="space-y-2">
                <Label>RTO Office</Label>
                <Select value={formData.rto_office_id} onValueChange={(v) => setFormData({ ...formData, rto_office_id: v })}>
                  <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select RTO office" /></SelectTrigger>
                  <SelectContent>{rtoOffices.map((o) => <SelectItem key={o.id} value={o.id}>{o.name} - {o.city}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Registration'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vehicles.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Vehicles Registered</h3>
            <p className="text-muted-foreground mb-4">Get started by registering your first vehicle</p>
            <Button className="btn-gradient" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Register Vehicle</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-card-hover h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Car className="h-6 w-6 text-primary-foreground" />
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>
                  <CardTitle className="text-lg mt-3">{vehicle.make} {vehicle.model}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Reg. No:</span><p className="font-medium">{vehicle.registration_number || 'Pending'}</p></div>
                    <div><span className="text-muted-foreground">Year:</span><p className="font-medium">{vehicle.year}</p></div>
                    <div><span className="text-muted-foreground">Type:</span><p className="font-medium">{vehicle.vehicle_type}</p></div>
                    <div><span className="text-muted-foreground">Fuel:</span><p className="font-medium">{vehicle.fuel_type}</p></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1"><Eye className="h-4 w-4 mr-1" />View</Button>
                    <Button variant="outline" size="sm" className="flex-1"><RefreshCw className="h-4 w-4 mr-1" />Transfer</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVehicles;
