import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { documentService, type Document } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Upload, CheckCircle2, Clock, XCircle, Eye, Download, Trash2, Plus, Image, File, Loader2 } from 'lucide-react';

type DocumentType = 'AADHAAR' | 'PAN' | 'ADDRESS_PROOF' | 'PHOTO' | 'SIGNATURE' | 'INSURANCE' | 'OTHER';

const documentTypeLabels: Record<string, string> = {
  AADHAAR: 'Aadhaar Card',
  PAN: 'PAN Card',
  ADDRESS_PROOF: 'Address Proof',
  PHOTO: 'Passport Photo',
  SIGNATURE: 'Signature',
  OTHER: 'Other Document',
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'VERIFIED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'REJECTED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'PHOTO': return Image;
    case 'SIGNATURE': return FileText;
    default: return File;
  }
};

const MyDocuments: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('OTHER');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await documentService.getMyDocuments();
      if (response.success && response.data) {
        setDocuments(response.data.documents || []);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or PDF file',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await documentService.uploadDocument(
        selectedFile,
        'USER',
        user.id,
        selectedDocType
      );
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedDocType('OTHER');
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = async (doc: Document) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to open document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    try {
      await documentService.deleteDocument(doc.id);
      toast({
        title: 'Document Deleted',
        description: `${doc.file_name} has been removed`,
      });
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const verifiedCount = documents.filter(d => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter(d => d.status === 'PENDING').length;
  const rejectedCount = documents.filter(d => d.status === 'REJECTED').length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">Upload and manage your identity documents</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={selectedDocType} onValueChange={(v) => setSelectedDocType(v as DocumentType)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                  className="bg-muted/50"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPG, PNG, PDF (Max 5MB)
                </p>
              </div>
              <Button
                onClick={handleUpload}
                className="w-full btn-gradient"
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-success">{verifiedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Documents */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Upload these documents for vehicle registration and license applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['AADHAAR', 'PAN', 'ADDRESS_PROOF', 'PHOTO', 'SIGNATURE'].map((type) => {
              const doc = documents.find(d => d.document_type === type);
              return (
                <Card key={type} className={`glass-card-hover ${doc?.status === 'REJECTED' ? 'border-destructive/30' : doc?.status === 'VERIFIED' ? 'border-success/30' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${doc?.status === 'VERIFIED' ? 'bg-success/20 text-success' : doc?.status === 'REJECTED' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {React.createElement(getDocumentIcon(type), { className: 'h-5 w-5' })}
                        </div>
                        <div>
                          <p className="font-medium">{documentTypeLabels[type]}</p>
                          {doc && <p className="text-xs text-muted-foreground">Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>}
                        </div>
                      </div>
                    </div>
                    {doc ? (
                      <div className="space-y-3">
                        {getStatusBadge(doc.status)}
                        {doc.rejection_reason && (
                          <p className="text-xs text-destructive mt-2">{doc.rejection_reason}</p>
                        )}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
                            <Eye className="h-3 w-3 mr-1" />View
                          </Button>
                          {doc.status === 'REJECTED' && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedDocType(type as DocumentType); setIsUploadDialogOpen(true); }}>
                              <Upload className="h-3 w-3 mr-1" />Re-upload
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => { setSelectedDocType(type as DocumentType); setIsUploadDialogOpen(true); }}>
                        <Upload className="h-4 w-4 mr-2" />Upload
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Documents List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>Complete list of your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents</h3>
              <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />Upload Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc, index) => {
                const IconComponent = getDocumentIcon(doc.document_type);
                return (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${doc.status === 'VERIFIED' ? 'bg-success/20 text-success' : doc.status === 'REJECTED' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold">{doc.file_name}</p>
                          <p className="text-sm text-muted-foreground">{documentTypeLabels[doc.document_type]} • Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                          {doc.rejection_reason && <p className="text-xs text-destructive mt-1">{doc.rejection_reason}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc.status)}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleView(doc)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDocuments;
