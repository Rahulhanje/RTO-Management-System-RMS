import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { vehicleService } from '@/services';
import { Vehicle } from '@/types';
import { Car, Search, CheckCircle2, XCircle, Clock, Loader2, Trash2, Info } from 'lucide-react';

// Mock data for demo mode
const mockVehicles: Vehicle[] = [
  { id: 'v1', owner_id: 'user1', vehicle_type: 'CAR', make: 'Maruti Suzuki', model: 'Swift', year: 2023, color: 'White', engine_number: 'K12N1234567', chassis_number: 'MA3FJEB1S00123456', fuel_type: 'PETROL', registration_number: 'MH12AB1234', rto_office_id: 'rto1', status: 'APPROVED', verified: true, created_at: '2023-06-15', updated_at: '2023-06-20' },
  { id: 'v2', owner_id: 'user2', vehicle_type: 'MOTORCYCLE', make: 'Honda', model: 'Activa 6G', year: 2024, color: 'Black', engine_number: 'JF50E1234567', chassis_number: 'ME4JF501ELT123456', fuel_type: 'PETROL', registration_number: null, rto_office_id: 'rto1', status: 'PENDING', verified: true, created_at: '2024-12-10', updated_at: '2024-12-15' },
  { id: 'v3', owner_id: 'user3', vehicle_type: 'CAR', make: 'Hyundai', model: 'Creta', year: 2022, color: 'Blue', engine_number: 'G4NH1234567', chassis_number: 'MALC381CLNM123456', fuel_type: 'DIESEL', registration_number: 'MH14CD5678', rto_office_id: 'rto2', status: 'APPROVED', verified: true, created_at: '2022-03-10', updated_at: '2022-03-15' },
  { id: 'v4', owner_id: 'user4', vehicle_type: 'TRUCK', make: 'Tata', model: 'Ace', year: 2023, color: 'Red', engine_number: 'RT1234567890', chassis_number: 'MAT453234LM123456', fuel_type: 'DIESEL', registration_number: null, rto_office_id: 'rto1', status: 'PENDING', verified: true, created_at: '2024-12-18', updated_at: '2024-12-20' },
  { id: 'v5', owner_id: 'user1', vehicle_type: 'CAR', make: 'Toyota', model: 'Fortuner', year: 2021, color: 'Silver', engine_number: 'GD1234567890', chassis_number: 'MBJBB8CS1KF123456', fuel_type: 'DIESEL', registration_number: 'MH12XY9999', rto_office_id: 'rto1', status: 'SCRAPPED', verified: true, created_at: '2021-05-10', updated_at: '2024-06-15' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'REJECTED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    case 'SCRAPPED': return <Badge variant="outline"><Trash2 className="h-3 w-3 mr-1" />Scrapped</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const VehicleManagement: React.FC = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [regNumber, setRegNumber] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.listVehicles().catch(() => ({ success: false, data: [] }));
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      
      if (data.length === 0) {
        setVehicles(mockVehicles);
        setIsDemoMode(true);
      } else {
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles(mockVehicles);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVehicle || !regNumber) return;
    setIsApproving(true);
    try {
      if (isDemoMode) {
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? { ...v, status: 'APPROVED' as const, registration_number: regNumber } : v));
        toast({ title: 'Demo Mode', description: 'Vehicle approved (Demo)' });
      } else {
        const response = await vehicleService.approveRegistration(selectedVehicle.id, regNumber);
        if (response.success) {
          toast({ title: 'Success', description: 'Vehicle approved successfully' });
          fetchVehicles();
        }
      }
      setSelectedVehicle(null);
      setRegNumber('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Approval failed', variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  const handleScrap = async (id: string) => {
    try {
      if (isDemoMode) {
        setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'SCRAPPED' as const } : v));
        toast({ title: 'Demo Mode', description: 'Vehicle marked as scrapped (Demo)' });
      } else {
        await vehicleService.markAsScrapped(id);
        toast({ title: 'Success', description: 'Vehicle marked as scrapped' });
        fetchVehicles();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to scrap', variant: 'destructive' });
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.registration_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVehicles = filteredVehicles.filter(v => v.status === 'PENDING' && v.verified);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Demo Mode: Displaying sample vehicle data</span>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <p className="text-muted-foreground">Approve and manage vehicle registrations</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{vehicles.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-warning">{vehicles.filter(v => v.status === 'PENDING').length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-success">{vehicles.filter(v => v.status === 'APPROVED').length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{vehicles.filter(v => v.status === 'SCRAPPED').length}</p><p className="text-xs text-muted-foreground">Scrapped</p></CardContent></Card>
      </div>

      {/* Pending Approvals */}
      {pendingVehicles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Pending Approvals ({pendingVehicles.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingVehicles.map((vehicle, i) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary-foreground" />
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.vehicle_type} • {vehicle.year}</p>
                    <p className="text-xs text-muted-foreground mt-2">Engine: {vehicle.engine_number}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="btn-gradient w-full mt-4" onClick={() => setSelectedVehicle(vehicle)}>Approve & Assign RC</Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card">
                        <DialogHeader><DialogTitle>Approve Vehicle Registration</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-muted/50">
                            <p className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                            <p className="text-sm text-muted-foreground">{vehicle.vehicle_type} • {vehicle.fuel_type}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Registration Number</Label>
                            <Input placeholder="e.g., MH01AB1234" value={regNumber} onChange={(e) => setRegNumber(e.target.value.toUpperCase())} className="bg-muted/50" />
                          </div>
                          <Button className="btn-gradient w-full" onClick={handleApprove} disabled={isApproving || !regNumber}>
                            {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve & Issue RC'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Vehicles Table */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vehicle</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reg. Number</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.slice(0, 10).map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-4"><div className="flex items-center gap-3"><Car className="h-5 w-5 text-primary" /><div><p className="font-medium">{vehicle.make} {vehicle.model}</p><p className="text-xs text-muted-foreground">{vehicle.year}</p></div></div></td>
                  <td className="p-4 font-mono">{vehicle.registration_number || 'Pending'}</td>
                  <td className="p-4 text-muted-foreground">{vehicle.vehicle_type}</td>
                  <td className="p-4">{getStatusBadge(vehicle.status)}</td>
                  <td className="p-4 text-right">
                    {vehicle.status === 'APPROVED' && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleScrap(vehicle.id)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VehicleManagement;
