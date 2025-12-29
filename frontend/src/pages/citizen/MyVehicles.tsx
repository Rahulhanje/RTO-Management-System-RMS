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
import { Car, Plus, Eye, RefreshCw, Trash2, Loader2, CheckCircle2, Clock, XCircle, AlertTriangle, QrCode } from 'lucide-react';

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
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
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
    setIsLoading(true);
    try {
      const [vehiclesRes, officesRes] = await Promise.all([
        vehicleService.getMyVehicles(),
        rtoService.listOffices(),
      ]);
      
      // Handle vehicles response
      if (vehiclesRes.success && vehiclesRes.data) {
        const vehiclesData = (vehiclesRes.data as any).vehicles || vehiclesRes.data || [];
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } else {
        setVehicles([]);
      }
      
      // Handle RTO offices response
      if (officesRes.success && officesRes.data) {
        const officesData = (officesRes.data as any).rtoOffices || officesRes.data || [];
        setRtoOffices(Array.isArray(officesData) ? officesData : []);
      } else {
        setRtoOffices([]);
        toast({
          title: 'Warning',
          description: 'Could not load RTO offices. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setVehicles([]);
      setRtoOffices([]);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.vehicle_type || !formData.fuel_type || !formData.make || !formData.model || 
        !formData.color || !formData.engine_number || !formData.chassis_number || !formData.rto_office_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await vehicleService.register(formData);
      if (response.success) {
        toast({ 
          title: 'Success', 
          description: 'Vehicle registration submitted successfully!' 
        });
        setIsDialogOpen(false);
        // Reset form
        setFormData({ 
          vehicle_type: '' as VehicleType, 
          make: '', 
          model: '', 
          year: new Date().getFullYear(), 
          color: '', 
          engine_number: '', 
          chassis_number: '', 
          fuel_type: '' as FuelType, 
          rto_office_id: '' 
        });
        // Refresh the vehicles list
        await fetchData();
      } else {
        toast({ 
          title: 'Error', 
          description: response.message || 'Registration failed', 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      console.error('Error registering vehicle:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to register vehicle. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewDialogOpen(true);
  };

  const handleTransferClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsTransferDialogOpen(true);
    setTransferUserId('');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || !transferUserId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the new owner\'s user ID',
        variant: 'destructive',
      });
      return;
    }
    
    setIsTransferring(true);
    try {
      const response = await vehicleService.transferOwnership(selectedVehicle.id, transferUserId);
      if (response.success) {
        toast({ 
          title: 'Success', 
          description: 'Vehicle transfer request submitted successfully!' 
        });
        setIsTransferDialogOpen(false);
        setTransferUserId('');
        setSelectedVehicle(null);
        // Refresh the vehicles list
        await fetchData();
      } else {
        toast({ 
          title: 'Error', 
          description: response.message || 'Transfer failed', 
          variant: 'destructive' 
        });
      }
    } catch (error: any) {
      console.error('Error transferring vehicle:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Failed to transfer vehicle. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsTransferring(false);
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewVehicle(vehicle)}><Eye className="h-4 w-4 mr-1" />View</Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleTransferClick(vehicle)}><RefreshCw className="h-4 w-4 mr-1" />Transfer</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Vehicle Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Vehicle ID</Label>
                  <p className="font-medium">{selectedVehicle.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Vehicle Type</Label>
                  <p className="font-medium">{selectedVehicle.vehicle_type}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(selectedVehicle.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Make</Label>
                  <p className="font-medium">{selectedVehicle.make}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{selectedVehicle.model}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Year</Label>
                  <p className="font-medium">{selectedVehicle.year}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Color</Label>
                  <p className="font-medium">{selectedVehicle.color}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Fuel Type</Label>
                  <p className="font-medium">{selectedVehicle.fuel_type}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Registration Number</Label>
                  <p className="font-medium">{selectedVehicle.registration_number || 'Pending'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Engine Number</Label>
                  <p className="font-medium">{selectedVehicle.engine_number}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Chassis Number</Label>
                  <p className="font-medium">{selectedVehicle.chassis_number}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Verified</Label>
                  <p className="font-medium">{selectedVehicle.verified ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">{new Date(selectedVehicle.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* QR Code and Digital Signature Section */}
              {selectedVehicle.status === 'APPROVED' && (selectedVehicle.qr_code_data || selectedVehicle.digital_signature) && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Verification Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedVehicle.qr_code_data && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">QR Code</Label>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <img 
                            src={selectedVehicle.qr_code_data} 
                            alt="Vehicle QR Code" 
                            className="w-48 h-48"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Scan to verify vehicle details</p>
                      </div>
                    )}
                    {selectedVehicle.digital_signature && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Digital Signature</Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="font-mono text-xs break-all">{selectedVehicle.digital_signature}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Cryptographic signature for authenticity</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Vehicle Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Vehicle Ownership</DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Vehicle</Label>
                <p className="font-medium">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registration_number || 'Pending'})</p>
              </div>
              <div className="space-y-2">
                <Label>New Owner User ID <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Enter the user ID of the new owner"
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  className="bg-muted/50"
                  required
                />
                <p className="text-xs text-muted-foreground">The new owner must be a registered user in the system</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setIsTransferDialogOpen(false);
                    setTransferUserId('');
                    setSelectedVehicle(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="btn-gradient flex-1" 
                  disabled={isTransferring}
                >
                  {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Transfer Ownership'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyVehicles;
