import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { dlService } from '@/services';
import { DLApplication } from '@/types';
import { CreditCard, Search, CheckCircle2, XCircle, Clock, Loader2, Calendar, FileCheck, Info } from 'lucide-react';

// Mock data for demo mode
const mockApplications: DLApplication[] = [
  { id: 'DL001', user_id: 'user1', rto_office_id: 'rto1', license_type: 'LMV', status: 'TEST_PASSED', documents_verified: true, test_date: '2024-12-20', test_result: 'PASSED', created_at: '2024-12-01', updated_at: '2024-12-20' },
  { id: 'DL002', user_id: 'user2', rto_office_id: 'rto1', license_type: 'MCWG', status: 'DOCUMENTS_VERIFIED', documents_verified: true, created_at: '2024-12-10', updated_at: '2024-12-15' },
  { id: 'DL003', user_id: 'user3', rto_office_id: 'rto2', license_type: 'HMV', status: 'PENDING', documents_verified: false, created_at: '2024-12-18', updated_at: '2024-12-18' },
  { id: 'DL004', user_id: 'user4', rto_office_id: 'rto1', license_type: 'LMV', status: 'TEST_SCHEDULED', documents_verified: true, test_date: '2024-12-28', created_at: '2024-12-05', updated_at: '2024-12-22' },
  { id: 'DL005', user_id: 'user5', rto_office_id: 'rto1', license_type: 'MCWOG', status: 'APPROVED', documents_verified: true, test_result: 'PASSED', dl_number: 'MH0120240005678', created_at: '2024-11-15', updated_at: '2024-12-01' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'DOCUMENTS_VERIFIED': return <Badge className="badge-info"><FileCheck className="h-3 w-3 mr-1" />Docs Verified</Badge>;
    case 'TEST_SCHEDULED': return <Badge className="badge-info"><Calendar className="h-3 w-3 mr-1" />Test Scheduled</Badge>;
    case 'TEST_PASSED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Test Passed</Badge>;
    case 'REJECTED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default: return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
  }
};

const DLManagement: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<DLApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<DLApplication | null>(null);
  const [dlNumber, setDlNumber] = useState('');
  const [testDate, setTestDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await dlService.listApplications().catch(() => ({ success: false, data: [] }));
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      
      if (data.length === 0) {
        setApplications(mockApplications);
        setIsDemoMode(true);
      } else {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications(mockApplications);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleTest = async (id: string) => {
    if (!testDate) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'TEST_SCHEDULED' as const, test_date: testDate } : a));
        toast({ title: 'Demo Mode', description: 'Test scheduled (Demo)' });
      } else {
        await dlService.scheduleTest(id, new Date(testDate).toISOString());
        toast({ title: 'Success', description: 'Test scheduled successfully' });
        fetchApplications();
      }
      setTestDate('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to schedule', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!dlNumber) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' as const, dl_number: dlNumber } : a));
        toast({ title: 'Demo Mode', description: 'DL approved and issued (Demo)' });
      } else {
        await dlService.approveApplication(id, dlNumber, 'PASSED');
        toast({ title: 'Success', description: 'DL approved and issued' });
        fetchApplications();
      }
      setSelectedApp(null);
      setDlNumber('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Approval failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' as const } : a));
        toast({ title: 'Demo Mode', description: 'Application rejected (Demo)' });
      } else {
        await dlService.rejectApplication(id, rejectReason);
        toast({ title: 'Rejected', description: 'Application has been rejected' });
        fetchApplications();
      }
      setSelectedApp(null);
      setRejectReason('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Rejection failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const readyForApproval = applications.filter(a => a.status === 'TEST_PASSED' || (a.status === 'DOCUMENTS_VERIFIED' && a.test_result === 'PASSED'));
  const readyForTest = applications.filter(a => a.status === 'DOCUMENTS_VERIFIED' && !a.test_date);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Demo Mode: Displaying sample DL applications</span>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold">DL Application Management</h1>
        <p className="text-muted-foreground">Manage driving license applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{applications.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-warning">{applications.filter(a => a.status === 'PENDING').length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-secondary">{readyForTest.length}</p><p className="text-xs text-muted-foreground">Ready for Test</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-primary">{readyForApproval.length}</p><p className="text-xs text-muted-foreground">Ready for Approval</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-success">{applications.filter(a => a.status === 'APPROVED').length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
      </div>

      {/* Ready for Approval */}
      {readyForApproval.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ready for Approval ({readyForApproval.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyForApproval.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-success-foreground" />
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <h3 className="font-semibold">{app.license_type} License</h3>
                    <p className="text-sm text-muted-foreground">App ID: {app.id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground mt-2">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="btn-gradient w-full mt-4" onClick={() => setSelectedApp(app)}>Issue DL</Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card">
                        <DialogHeader><DialogTitle>Issue Driving License</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-muted/50">
                            <p className="font-semibold">{app.license_type} License Application</p>
                            <p className="text-sm text-muted-foreground">Test Result: PASSED</p>
                          </div>
                          <div className="space-y-2">
                            <Label>DL Number</Label>
                            <Input placeholder="e.g., MH0120250001234" value={dlNumber} onChange={(e) => setDlNumber(e.target.value.toUpperCase())} className="bg-muted/50" />
                          </div>
                          <div className="flex gap-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1"><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                              </DialogTrigger>
                              <DialogContent className="glass-card">
                                <DialogHeader><DialogTitle>Reject Application</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                  <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="bg-muted/50" />
                                  <Button variant="destructive" className="w-full" onClick={() => handleReject(app.id)} disabled={isSubmitting || !rejectReason}>Confirm Rejection</Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button className="flex-1 btn-gradient" onClick={() => handleApprove(app.id)} disabled={isSubmitting || !dlNumber}>
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Issue DL'}
                            </Button>
                          </div>
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

      {/* All Applications Table */}
      <Card className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Application ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">License Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Applied Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Test Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 10).map((app) => (
                <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-4 font-mono text-sm">{app.id.slice(0, 8)}...</td>
                  <td className="p-4">{app.license_type}</td>
                  <td className="p-4 text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-muted-foreground">{app.test_date ? new Date(app.test_date).toLocaleDateString() : '-'}</td>
                  <td className="p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-4 text-right">
                    {app.status === 'DOCUMENTS_VERIFIED' && !app.test_date && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" />Schedule Test</Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card">
                          <DialogHeader><DialogTitle>Schedule Driving Test</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Test Date & Time</Label>
                              <Input type="datetime-local" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="bg-muted/50" />
                            </div>
                            <Button className="btn-gradient w-full" onClick={() => handleScheduleTest(app.id)} disabled={isSubmitting || !testDate}>
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Schedule Test'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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

export default DLManagement;
