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
import { dlService, documentService } from '@/services';
import { DLApplication } from '@/types';
import type { Document } from '@/services/documentService';
import { CreditCard, Search, CheckCircle2, XCircle, Clock, Loader2, Calendar, FileCheck, FileText, Eye, Download } from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'DOCUMENTS_VERIFIED': 
    case 'VERIFIED': return <Badge className="badge-info"><FileCheck className="h-3 w-3 mr-1" />Verified</Badge>;
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
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [selectedAppForDocs, setSelectedAppForDocs] = useState<DLApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await dlService.listApplications();
      // Handle nested response structure: { success: true, data: { applications: [...] } }
      const appData = (response.data as any)?.applications || response.data || [];
      setApplications(Array.isArray(appData) ? appData : []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch DL applications',
        variant: 'destructive',
      });
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleTest = async (id: string) => {
    if (!testDate) return;
    setIsSubmitting(true);
    try {
      await dlService.scheduleTest(id, new Date(testDate).toISOString());
      toast({
        title: 'Success',
        description: 'Driving test scheduled successfully',
      });
      await fetchApplications();
      setTestDate('');
      setScheduleDialogOpen(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to schedule test',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!dlNumber) return;
    setIsSubmitting(true);
    try {
      await dlService.approveApplication(id, dlNumber, 'PASSED');
      toast({
        title: 'Success',
        description: 'Driving license approved and issued successfully',
      });
      await fetchApplications();
      setSelectedApp(null);
      setDlNumber('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason) return;
    setIsSubmitting(true);
    try {
      await dlService.rejectApplication(id, rejectReason);
      toast({
        title: 'Rejected',
        description: 'Application has been rejected',
      });
      await fetchApplications();
      setSelectedApp(null);
      setRejectReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDocumentsForApplication = async (application: DLApplication) => {
    setIsLoadingDocuments(true);
    setSelectedAppForDocs(application);
    setIsDocumentsDialogOpen(true);
    
    try {
      // First, try to get documents uploaded during DL application
      const appDocsResponse = await documentService.getDocumentsByEntity(application.id);
      let appDocs = appDocsResponse.success && appDocsResponse.data ? appDocsResponse.data.documents : [];
      
      // If no documents found for the application, fetch user's general documents as fallback
      if (!appDocs || appDocs.length === 0) {
        const userDocsResponse = await documentService.getDocumentsByEntity(application.user_id);
        const userDocs = userDocsResponse.success && userDocsResponse.data ? userDocsResponse.data.documents : [];
        
        // Filter to only show relevant document types for DL
        appDocs = userDocs.filter(doc => 
          ['AADHAAR', 'PHOTO', 'ADDRESS_PROOF'].includes(doc.document_type)
        );
      }
      
      setDocuments(appDocs || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.license_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const readyForApproval = filteredApplications.filter(a => a.status === 'TEST_PASSED' || (a.status === 'DOCUMENTS_VERIFIED' && a.test_result === 'PASSED'));
  const readyForTest = filteredApplications.filter(a => (a.status === 'DOCUMENTS_VERIFIED' || a.status === 'VERIFIED') && !a.test_scheduled_at && !a.test_date);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">DL Application Management</h1>
        <p className="text-muted-foreground">Manage driving license applications</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID or license type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{filteredApplications.length}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-warning">{filteredApplications.filter(a => a.status === 'PENDING').length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-secondary">{readyForTest.length}</p><p className="text-xs text-muted-foreground">Ready for Test</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-primary">{readyForApproval.length}</p><p className="text-xs text-muted-foreground">Ready for Approval</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="py-4 text-center"><p className="text-2xl font-bold text-success">{filteredApplications.filter(a => a.status === 'APPROVED').length}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
      </div>

      {/* Ready for Test Scheduling */}
      {readyForTest.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Ready for Test Scheduling ({readyForTest.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyForTest.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <h3 className="font-semibold">{app.license_type} License</h3>
                    <p className="text-sm text-muted-foreground">App ID: {app.id.slice(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground mt-2">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                    <Dialog open={scheduleDialogOpen === app.id} onOpenChange={(open) => setScheduleDialogOpen(open ? app.id : null)}>
                      <DialogTrigger asChild>
                        <Button className="btn-gradient w-full mt-4">
                          <Calendar className="h-4 w-4 mr-2" />Schedule Test
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card">
                        <DialogHeader><DialogTitle>Schedule Driving Test</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-muted/50">
                            <p className="font-semibold">{app.license_type} License Application</p>
                            <p className="text-sm text-muted-foreground">Documents verified and ready for test</p>
                          </div>
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
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
              {filteredApplications.map((app) => (
                <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-4 font-mono text-sm">{app.id.slice(0, 8)}...</td>
                  <td className="p-4">{app.license_type}</td>
                  <td className="p-4 text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-muted-foreground">
                    {(app.test_scheduled_at || app.test_date) ? (
                      new Date(app.test_scheduled_at || app.test_date).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : '-'}
                  </td>
                  <td className="p-4">{getStatusBadge(app.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => fetchDocumentsForApplication(app)}>
                        <FileText className="h-4 w-4 mr-2" />View Documents
                      </Button>
                      {((app.status === 'DOCUMENTS_VERIFIED' || app.status === 'VERIFIED') && !app.test_scheduled_at && !app.test_date) && (
                        <Dialog open={scheduleDialogOpen === app.id} onOpenChange={(open) => setScheduleDialogOpen(open ? app.id : null)}>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Documents Dialog */}
      <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
        <DialogContent className="glass-card max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Documents</DialogTitle>
          </DialogHeader>
          {isLoadingDocuments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents Uploaded</h3>
              <p className="text-muted-foreground">
                The applicant hasn't uploaded any documents yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Application ID: {selectedAppForDocs?.id.slice(0, 8)}...</p>
                <p className="text-sm text-muted-foreground">License Type: {selectedAppForDocs?.license_type}</p>
              </div>
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="glass-card-hover">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${
                            doc.status === 'VERIFIED' ? 'bg-success/20 text-success' : 
                            doc.status === 'REJECTED' ? 'bg-destructive/20 text-destructive' : 
                            'bg-warning/20 text-warning'
                          }`}>
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{doc.document_type.replace('_', ' ')}</p>
                              {doc.status === 'VERIFIED' && <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>}
                              {doc.status === 'PENDING' && <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                              {doc.status === 'REJECTED' && <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                              {doc.entity_type === 'USER' && <span className="ml-2 text-primary">(From My Documents)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DLManagement;
