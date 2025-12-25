import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { rtoService } from '@/services';
import { RTOOffice } from '@/types';
import { Building2, Plus, Search, Edit, Trash2, Loader2, CheckCircle2, XCircle, MapPin, Phone, Mail } from 'lucide-react';

const RTOOfficeManagement: React.FC = () => {
  const { toast } = useToast();
  const [offices, setOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOffice, setEditingOffice] = useState<RTOOffice | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const mockOffices: RTOOffice[] = [
    { id: '1', name: 'RTO Mumbai Central', code: 'MH-01', address: 'Tardeo Road, Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400034', phone: '022-23456789', email: 'rto.mumbai@gov.in', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '2', name: 'RTO Pune', code: 'MH-12', address: 'Sangamwadi, Pune', city: 'Pune', state: 'Maharashtra', pincode: '411001', phone: '020-26123456', email: 'rto.pune@gov.in', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '3', name: 'RTO Nagpur', code: 'MH-31', address: 'Civil Lines, Nagpur', city: 'Nagpur', state: 'Maharashtra', pincode: '440001', phone: '0712-2523456', email: 'rto.nagpur@gov.in', status: 'INACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await rtoService.listOffices();
      if (response.success && response.data) setOffices(response.data);
      else setOffices(mockOffices);
    } catch (error) {
      setOffices(mockOffices);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingOffice) {
        const response = await rtoService.updateOffice(editingOffice.id, formData);
        if (response.success) {
          toast({ title: 'Success', description: 'Office updated successfully' });
        }
      } else {
        const response = await rtoService.createOffice(formData);
        if (response.success) {
          toast({ title: 'Success', description: 'Office created successfully' });
        }
      }
      setIsDialogOpen(false);
      setEditingOffice(null);
      resetForm();
      fetchOffices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Operation failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', address: '', city: '', state: '', pincode: '', phone: '', email: '', status: 'ACTIVE' });
  };

  const handleEdit = (office: RTOOffice) => {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      code: office.code,
      address: office.address,
      city: office.city,
      state: office.state,
      pincode: office.pincode,
      phone: office.phone,
      email: office.email,
      status: office.status,
    });
    setIsDialogOpen(true);
  };

  const filteredOffices = offices.filter(office =>
    office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RTO Office Management</h1>
          <p className="text-muted-foreground">Manage all RTO offices across the state</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingOffice(null); resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="btn-gradient"><Plus className="h-4 w-4 mr-2" />Add Office</Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffice ? 'Edit RTO Office' : 'Add New RTO Office'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Office Name</Label>
                  <Input placeholder="e.g., RTO Mumbai" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-muted/50" required />
                </div>
                <div className="space-y-2">
                  <Label>Office Code</Label>
                  <Input placeholder="e.g., MH-01" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="bg-muted/50" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Full address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-muted/50" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="bg-muted/50" required />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="bg-muted/50" required />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="bg-muted/50" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="Phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-muted/50" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-muted/50" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'ACTIVE' | 'INACTIVE' })}>
                  <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingOffice ? 'Update Office' : 'Create Office')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search offices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-muted/50" />
      </div>

      {/* Offices Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Office</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOffices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No offices found</TableCell>
                </TableRow>
              ) : (
                filteredOffices.map((office) => (
                  <TableRow key={office.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{office.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{office.address.slice(0, 30)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{office.code}</Badge></TableCell>
                    <TableCell>{office.city}, {office.state}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{office.phone}</p>
                        <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3 w-3" />{office.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {office.status === 'ACTIVE' ? (
                        <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
                      ) : (
                        <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(office)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RTOOfficeManagement;
