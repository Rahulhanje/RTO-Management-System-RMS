import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dlService, rtoService } from '@/services';
import { DrivingLicense, DLApplication, RTOOffice, LicenseType } from '@/types';
import { CreditCard, Plus, QrCode, RefreshCw, Loader2, CheckCircle2, Clock, XCircle, FileText, Calendar } from 'lucide-react';

const licenseTypes: LicenseType[] = ['LMV', 'HMV', 'MCWG', 'MCWOG', 'TRANS'];
const licenseTypeLabels: Record<LicenseType, string> = {
  LMV: 'Light Motor Vehicle',
  HMV: 'Heavy Motor Vehicle',
  MCWG: 'Motorcycle with Gear',
  MCWOG: 'Motorcycle without Gear',
  TRANS: 'Transport Vehicle',
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': case 'ACTIVE': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
    case 'PENDING': case 'DOCUMENTS_VERIFIED': case 'TEST_SCHEDULED': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />{status.replace('_', ' ')}</Badge>;
    case 'REJECTED': case 'EXPIRED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const DrivingLicensePage: React.FC = () => {
  const { toast } = useToast();
  const [license, setLicense] = useState<DrivingLicense | null>(null);
  const [applications, setApplications] = useState<DLApplication[]>([]);
  const [rtoOffices, setRtoOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rto_office_id: '', license_type: '' as LicenseType });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [licenseRes, applicationsRes, officesRes] = await Promise.all([
        dlService.getMyLicense().catch(() => ({ success: false, data: null })),
        dlService.getMyApplications().catch(() => ({ success: false, data: [] })),
        rtoService.listOffices().catch(() => ({ success: false, data: [] })),
      ]);
      if (licenseRes.success && licenseRes.data) {
        setLicense(licenseRes.data);
      }
      if (applicationsRes.success && Array.isArray(applicationsRes.data)) {
        setApplications(applicationsRes.data);
      } else {
        setApplications([]);
      }
      if (officesRes.success && Array.isArray(officesRes.data)) {
        setRtoOffices(officesRes.data);
      } else {
        setRtoOffices([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setApplications([]);
      setRtoOffices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await dlService.apply(formData.rto_office_id, formData.license_type);
      if (response.success) {
        toast({ title: 'Success', description: 'DL application submitted!' });
        setIsDialogOpen(false);
        fetchData();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Application failed', variant: 'destructive' });
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
          <h1 className="text-2xl font-bold">Driving License</h1>
          <p className="text-muted-foreground">Manage your driving license</p>
        </div>
        {!license && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient"><Plus className="h-4 w-4 mr-2" />Apply for DL</Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Apply for Driving License</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-2">
                  <Label>License Type</Label>
                  <Select value={formData.license_type} onValueChange={(v) => setFormData({ ...formData, license_type: v as LicenseType })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select license type" /></SelectTrigger>
                    <SelectContent>{licenseTypes.map((t) => <SelectItem key={t} value={t}>{t} - {licenseTypeLabels[t]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>RTO Office</Label>
                  <Select value={formData.rto_office_id} onValueChange={(v) => setFormData({ ...formData, rto_office_id: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select RTO office" /></SelectTrigger>
                    <SelectContent>{rtoOffices.map((o) => <SelectItem key={o.id} value={o.id}>{o.name} - {o.city}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active License Card */}
      {license && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent" />
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <CreditCard className="h-16 w-16 text-primary-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Driving License Number</p>
                      <p className="text-2xl font-bold gradient-text">{license.dl_number}</p>
                    </div>
                    {getStatusBadge(license.status)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground">License Type</span><p className="font-medium">{license.license_type}</p></div>
                    <div><span className="text-muted-foreground">Issue Date</span><p className="font-medium">{new Date(license.issue_date).toLocaleDateString()}</p></div>
                    <div><span className="text-muted-foreground">Expiry Date</span><p className="font-medium">{new Date(license.expiry_date).toLocaleDateString()}</p></div>
                    <div><span className="text-muted-foreground">RTO</span><p className="font-medium">{license.rto_office_id.slice(0, 8)}...</p></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline"><QrCode className="h-4 w-4 mr-2" />View Digital DL</Button>
                    <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Renew License</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Applications */}
      {applications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">My Applications</h2>
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="glass-card">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{app.license_type} License Application</p>
                          <p className="text-sm text-muted-foreground">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.test_date && (
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Test Date:</span>
                            <p className="font-medium flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(app.test_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!license && applications.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Driving License</h3>
            <p className="text-muted-foreground mb-4">Apply for your driving license to get started</p>
            <Button className="btn-gradient" onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Apply for DL</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrivingLicensePage;
