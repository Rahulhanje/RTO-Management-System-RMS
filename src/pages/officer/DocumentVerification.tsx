import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dlService, vehicleService } from '@/services';
import { DLApplication, Vehicle } from '@/types';
import { Search, FileCheck, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, Eye, Info } from 'lucide-react';

// Mock data for demo mode
const mockDLApplications: DLApplication[] = [
  { id: 'DL001', user_id: 'user1', rto_office_id: 'rto1', license_type: 'LMV', status: 'PENDING', documents_verified: false, created_at: '2024-12-15', updated_at: '2024-12-15' },
  { id: 'DL002', user_id: 'user2', rto_office_id: 'rto1', license_type: 'MCWG', status: 'PENDING', documents_verified: false, created_at: '2024-12-18', updated_at: '2024-12-18' },
  { id: 'DL003', user_id: 'user3', rto_office_id: 'rto1', license_type: 'HMV', status: 'PENDING', documents_verified: false, created_at: '2024-12-20', updated_at: '2024-12-20' },
];

const mockVehicles: Vehicle[] = [
  { id: 'v1', owner_id: 'user1', vehicle_type: 'CAR', make: 'Maruti Suzuki', model: 'Swift', year: 2024, color: 'White', engine_number: 'K12N1234567', chassis_number: 'MA3FJEB1S00123456', fuel_type: 'PETROL', registration_number: null, rto_office_id: 'rto1', status: 'PENDING', verified: false, created_at: '2024-12-10', updated_at: '2024-12-10' },
  { id: 'v2', owner_id: 'user2', vehicle_type: 'MOTORCYCLE', make: 'Honda', model: 'CB350', year: 2024, color: 'Black', engine_number: 'CB350E1234567', chassis_number: 'ME4CB350ELT123456', fuel_type: 'PETROL', registration_number: null, rto_office_id: 'rto1', status: 'PENDING', verified: false, created_at: '2024-12-12', updated_at: '2024-12-12' },
];

const getStatusBadge = (status: string) => {
  if (status.includes('VERIFIED') || status === 'APPROVED') return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
  if (status === 'PENDING') return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  if (status === 'REJECTED') return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
  return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
};

const DocumentVerification: React.FC = () => {
  const { toast } = useToast();
  const [dlApplications, setDlApplications] = useState<DLApplication[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dlRes, vehRes] = await Promise.all([
        dlService.listApplications().catch(() => ({ success: false, data: [] })),
        vehicleService.listVehicles().catch(() => ({ success: false, data: [] })),
      ]);
      
      const dlData = dlRes.success && Array.isArray(dlRes.data) ? dlRes.data.filter((a: DLApplication) => !a.documents_verified) : [];
      const vehData = vehRes.success && Array.isArray(vehRes.data) ? vehRes.data.filter((v: Vehicle) => !v.verified && v.status === 'PENDING') : [];
      
      if (dlData.length === 0 && vehData.length === 0) {
        setDlApplications(mockDLApplications);
        setVehicles(mockVehicles);
        setIsDemoMode(true);
      } else {
        setDlApplications(dlData);
        setVehicles(vehData);
      }
    } catch (error) {
      console.error(error);
      setDlApplications(mockDLApplications);
      setVehicles(mockVehicles);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (type: 'dl' | 'vehicle', id: string, verified: boolean) => {
    setIsVerifying(true);
    try {
      if (isDemoMode) {
        if (type === 'dl') {
          setDlApplications(prev => prev.map(a => a.id === id ? { ...a, documents_verified: verified, status: verified ? 'DOCUMENTS_VERIFIED' as const : 'REJECTED' as const } : a));
        } else {
          setVehicles(prev => prev.map(v => v.id === id ? { ...v, verified, status: verified ? 'PENDING' as const : 'REJECTED' as const } : v));
        }
        toast({ title: 'Demo Mode', description: `Documents ${verified ? 'verified' : 'rejected'} (Demo)` });
      } else {
        if (type === 'dl') {
          await dlService.verifyDocuments(id, verified, verifyNotes);
        } else {
          await vehicleService.verifyDocuments(id, verified, verifyNotes);
        }
        toast({ title: 'Success', description: `Documents ${verified ? 'verified' : 'rejected'} successfully` });
        fetchData();
      }
      setSelectedItem(null);
      setVerifyNotes('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Verification failed', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Demo Mode: Displaying sample applications for verification</span>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground">Verify application documents</p>
      </div>

      <Tabs defaultValue="dl" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="dl" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            DL Applications ({dlApplications.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Vehicle Registrations ({vehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dl" className="space-y-4">
          {dlApplications.length === 0 ? (
            <Card className="glass-card"><CardContent className="py-12 text-center"><CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" /><p className="text-muted-foreground">All DL documents verified!</p></CardContent></Card>
          ) : (
            dlApplications.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <FileCheck className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{app.license_type} License Application</p>
                          <p className="text-sm text-muted-foreground">ID: {app.id.slice(0, 8)}... • Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(app.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedItem({ type: 'dl', ...app })}><Eye className="h-4 w-4 mr-2" />Review</Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card">
                            <DialogHeader><DialogTitle>Verify DL Application</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">License Type</p>
                                <p className="font-semibold">{app.license_type}</p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-2">Documents to Verify</p>
                                <ul className="text-sm space-y-1">
                                  <li>✓ Aadhaar Card</li>
                                  <li>✓ Address Proof</li>
                                  <li>✓ Passport Photo</li>
                                  <li>✓ Medical Certificate</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <Label>Verification Notes</Label>
                                <Textarea placeholder="Add notes about document verification..." value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} className="bg-muted/50" />
                              </div>
                              <div className="flex gap-3">
                                <Button className="flex-1" variant="outline" onClick={() => handleVerify('dl', app.id, false)} disabled={isVerifying}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                                <Button className="flex-1 btn-gradient" onClick={() => handleVerify('dl', app.id, true)} disabled={isVerifying}>{isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" />Verify</>}</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          {vehicles.length === 0 ? (
            <Card className="glass-card"><CardContent className="py-12 text-center"><CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" /><p className="text-muted-foreground">All vehicle documents verified!</p></CardContent></Card>
          ) : (
            vehicles.map((vehicle, i) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                          <FileCheck className="h-6 w-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                          <p className="text-sm text-muted-foreground">{vehicle.vehicle_type} • {vehicle.fuel_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(vehicle.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline"><Eye className="h-4 w-4 mr-2" />Review</Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card">
                            <DialogHeader><DialogTitle>Verify Vehicle Documents</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-muted-foreground">{vehicle.vehicle_type} • {vehicle.year} • {vehicle.fuel_type}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-muted-foreground">Engine No:</span><p className="font-mono">{vehicle.engine_number}</p></div>
                                <div><span className="text-muted-foreground">Chassis No:</span><p className="font-mono">{vehicle.chassis_number}</p></div>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground mb-2">Documents to Verify</p>
                                <ul className="text-sm space-y-1">
                                  <li>✓ Invoice / Sale Deed</li>
                                  <li>✓ Insurance Certificate</li>
                                  <li>✓ PUC Certificate</li>
                                  <li>✓ Owner ID Proof</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <Label>Verification Notes</Label>
                                <Textarea placeholder="Add notes..." value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} className="bg-muted/50" />
                              </div>
                              <div className="flex gap-3">
                                <Button className="flex-1" variant="outline" onClick={() => handleVerify('vehicle', vehicle.id, false)} disabled={isVerifying}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                                <Button className="flex-1 btn-gradient" onClick={() => handleVerify('vehicle', vehicle.id, true)} disabled={isVerifying}>{isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-2" />Verify</>}</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentVerification;
