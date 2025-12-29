import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { dlService, rtoService, documentService } from '@/services';
import { DrivingLicense, DLApplication, RTOOffice, LicenseType, User } from '@/types';
import { CreditCard, Plus, QrCode, RefreshCw, Loader2, CheckCircle2, Clock, XCircle, FileText, Calendar, User as UserIcon, MapPin, Phone, Mail, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [license, setLicense] = useState<DrivingLicense | null>(null);
  const [applications, setApplications] = useState<DLApplication[]>([]);
  const [rtoOffices, setRtoOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [digitalDLOpen, setDigitalDLOpen] = useState(false);
  const [formData, setFormData] = useState({ rto_office_id: '', license_type: '' as LicenseType });
  const [documents, setDocuments] = useState<{
    aadhaar: File | null;
    photo: File | null;
    addressProof: File | null;
  }>({ aadhaar: null, photo: null, addressProof: null });

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
      
      // Extract license from nested response
      if (licenseRes.success && licenseRes.data) {
        const licenseData = (licenseRes.data as any).license || licenseRes.data;
        setLicense(licenseData);
      }
      
      // Extract applications array from nested response
      if (applicationsRes.success && applicationsRes.data) {
        const appsData = (applicationsRes.data as any).applications || applicationsRes.data || [];
        if (Array.isArray(appsData)) {
          setApplications(appsData);
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await dlService.apply(formData.rto_office_id, formData.license_type);
      if (response.success) {
        const applicationData = (response.data as any).application || response.data;
        const applicationId = applicationData?.id;
        
        // Upload documents if application was created successfully
        if (applicationId) {
          const uploadPromises = [];
          
          if (documents.aadhaar) {
            uploadPromises.push(
              documentService.uploadDocument(documents.aadhaar, 'DL_APPLICATION', applicationId, 'AADHAAR')
            );
          }
          if (documents.photo) {
            uploadPromises.push(
              documentService.uploadDocument(documents.photo, 'DL_APPLICATION', applicationId, 'PHOTO')
            );
          }
          if (documents.addressProof) {
            uploadPromises.push(
              documentService.uploadDocument(documents.addressProof, 'DL_APPLICATION', applicationId, 'ADDRESS_PROOF')
            );
          }
          
          if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises);
            toast({ title: 'Success', description: 'DL application and documents submitted successfully!' });
          } else {
            toast({ title: 'Success', description: 'DL application submitted! Please upload documents from your documents page.' });
          }
        } else {
          toast({ title: 'Success', description: 'DL application submitted!' });
        }
        
        fetchData();
      }
      setIsDialogOpen(false);
      setFormData({ rto_office_id: '', license_type: '' as LicenseType });
      setDocuments({ aadhaar: null, photo: null, addressProof: null });
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
                
                <div className="space-y-3 pt-2 border-t">
                  <p className="text-sm font-medium">Upload Documents (Optional)</p>
                  <p className="text-xs text-muted-foreground">You can upload documents now or later from your documents page</p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar" className="text-sm">Aadhaar Card</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="aadhaar"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setDocuments({ ...documents, aadhaar: e.target.files?.[0] || null })}
                        className="bg-muted/50"
                      />
                      {documents.aadhaar && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo" className="text-sm">Passport Photo</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setDocuments({ ...documents, photo: e.target.files?.[0] || null })}
                        className="bg-muted/50"
                      />
                      {documents.photo && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressProof" className="text-sm">Address Proof</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="addressProof"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setDocuments({ ...documents, addressProof: e.target.files?.[0] || null })}
                        className="bg-muted/50"
                      />
                      {documents.addressProof && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                    </div>
                  </div>
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
                    <div><span className="text-muted-foreground">RTO</span><p className="font-medium">{rtoOffices.find(o => o.id === license.rto_office_id)?.name || license.rto_office_id.slice(0, 8)}</p></div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Dialog open={digitalDLOpen} onOpenChange={setDigitalDLOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline"><QrCode className="h-4 w-4 mr-2" />View Digital DL</Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Digital Driving License</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Digital DL Card */}
                          <div className="relative bg-gradient-to-br from-primary via-secondary to-accent p-4 sm:p-6 rounded-xl sm:rounded-2xl text-white overflow-hidden">
                            <div className="absolute top-0 right-0 opacity-10">
                              <CreditCard className="h-24 w-24 sm:h-32 sm:w-32" />
                            </div>
                            <div className="relative space-y-3 sm:space-y-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-xs opacity-80">DRIVING LICENSE</p>
                                  <p className="text-lg sm:text-2xl font-bold tracking-wider break-all">{license.dl_number}</p>
                                </div>
                                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0 ml-2">
                                  <QrCode className="h-8 w-8 sm:h-12 sm:w-12" />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                                <div>
                                  <p className="text-xs opacity-80">Holder Name</p>
                                  <p className="font-semibold text-sm sm:text-base truncate">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-80">License Type</p>
                                  <p className="font-semibold text-sm sm:text-base">{license.license_type}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-80">Issue Date</p>
                                  <p className="font-semibold text-sm sm:text-base">{new Date(license.issue_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs opacity-80">Valid Until</p>
                                  <p className="font-semibold text-sm sm:text-base">{new Date(license.expiry_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Personal Details */}
                          <Card className="glass-card">
                            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Personal Information
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">Full Name</p>
                                  <p className="font-medium">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Date of Birth</p>
                                  <p className="font-medium">{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Phone Number</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <Phone className="h-3 w-3" />{user?.phone || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Email</p>
                                  <p className="font-medium flex items-center gap-1 break-all">
                                    <Mail className="h-3 w-3 shrink-0" /><span className="truncate">{user?.email || 'N/A'}</span>
                                  </p>
                                </div>
                                <div className="sm:col-span-2">
                                  <p className="text-muted-foreground text-xs">Address</p>
                                  <p className="font-medium flex items-start gap-1">
                                    <MapPin className="h-3 w-3 mt-1 shrink-0" /><span>{user?.address || 'N/A'}</span>
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* License Details */}
                          <Card className="glass-card">
                            <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                              <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                License Details
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground text-xs">License Number</p>
                                  <p className="font-medium font-mono text-xs sm:text-sm break-all">{license.dl_number}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">License Type</p>
                                  <p className="font-medium text-xs sm:text-sm">{license.license_type} - {licenseTypeLabels[license.license_type as LicenseType]}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Issue Date</p>
                                  <p className="font-medium">{new Date(license.issue_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Expiry Date</p>
                                  <p className="font-medium">{new Date(license.expiry_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">Status</p>
                                  <div>{getStatusBadge(license.status)}</div>
                                </div>
                                <div>
                                  <p className="text-muted-foreground text-xs">RTO Office</p>
                                  <p className="font-medium">{rtoOffices.find(o => o.id === license.rto_office_id)?.name || 'N/A'}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* QR Code and Digital Signature */}
                          {(license.qr_code_data || license.digital_signature) && (
                            <Card className="glass-card">
                              <CardContent className="pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                                  <QrCode className="h-4 w-4" />
                                  Verification
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {license.qr_code_data && (
                                    <div className="space-y-2">
                                      <p className="text-muted-foreground text-xs">QR Code</p>
                                      <div className="bg-white p-4 rounded-lg inline-block">
                                        <img 
                                          src={license.qr_code_data} 
                                          alt="License QR Code" 
                                          className="w-40 h-40"
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground">Scan to verify license</p>
                                    </div>
                                  )}
                                  {license.digital_signature && (
                                    <div className="space-y-2">
                                      <p className="text-muted-foreground text-xs">Digital Signature</p>
                                      <div className="bg-muted/50 p-3 rounded-lg">
                                        <p className="font-mono text-xs break-all">{license.digital_signature}</p>
                                      </div>
                                      <p className="text-xs text-muted-foreground">Cryptographic signature</p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          <div className="text-center text-xs text-muted-foreground px-2">
                            <p>This is a digitally verified driving license issued by RTO Portal</p>
                            <p className="mt-1">Valid across India • Keep this safe</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
                        {(app.test_scheduled_at || app.test_date) && (
                          <div className="text-right text-sm">
                            <span className="text-muted-foreground">Test Date:</span>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.test_scheduled_at || app.test_date).toLocaleString('en-US', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
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
