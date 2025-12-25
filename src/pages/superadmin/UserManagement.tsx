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
import { userService, rtoService } from '@/services';
import { User, UserRole, RTOOffice } from '@/types';
import { Users, Search, Edit, Trash2, Loader2, CheckCircle2, XCircle, Shield, UserPlus, Ban } from 'lucide-react';

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  POLICE: 'Police Officer',
  RTO_OFFICER: 'RTO Officer',
  RTO_ADMIN: 'RTO Admin',
  SUPER_ADMIN: 'Super Admin',
  AUDITOR: 'Auditor',
};

const roleBadgeColors: Record<UserRole, string> = {
  CITIZEN: 'bg-muted text-muted-foreground',
  POLICE: 'bg-warning/20 text-warning',
  RTO_OFFICER: 'bg-secondary/20 text-secondary',
  RTO_ADMIN: 'bg-primary/20 text-primary',
  SUPER_ADMIN: 'bg-destructive/20 text-destructive',
  AUDITOR: 'bg-accent/20 text-accent',
};

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [rtoOffices, setRtoOffices] = useState<RTOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    role: '' as UserRole,
    rto_office_id: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
  });

  const mockUsers: User[] = [
    { id: '1', name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', address: 'Mumbai', date_of_birth: '1990-05-15', aadhaar_number: '123456789012', role: 'CITIZEN', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '2', name: 'Priya Patel', email: 'priya@rto.gov.in', phone: '9876543211', address: 'Pune', date_of_birth: '1985-08-20', aadhaar_number: '123456789013', role: 'RTO_OFFICER', status: 'ACTIVE', rto_office_id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '3', name: 'Amit Kumar', email: 'amit@police.gov.in', phone: '9876543212', address: 'Nagpur', date_of_birth: '1988-03-10', aadhaar_number: '123456789014', role: 'POLICE', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '4', name: 'Sneha Reddy', email: 'sneha@admin.gov.in', phone: '9876543213', address: 'Nashik', date_of_birth: '1982-12-05', aadhaar_number: '123456789015', role: 'RTO_ADMIN', status: 'ACTIVE', rto_office_id: '2', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '5', name: 'Vikram Singh', email: 'vikram@audit.gov.in', phone: '9876543214', address: 'Thane', date_of_birth: '1975-07-25', aadhaar_number: '123456789016', role: 'AUDITOR', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  const mockRTOOffices: RTOOffice[] = [
    { id: '1', name: 'RTO Mumbai Central', code: 'MH-01', address: 'Tardeo Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400034', phone: '022-23456789', email: 'rto.mumbai@gov.in', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
    { id: '2', name: 'RTO Pune', code: 'MH-12', address: 'Sangamwadi', city: 'Pune', state: 'Maharashtra', pincode: '411001', phone: '020-26123456', email: 'rto.pune@gov.in', status: 'ACTIVE', created_at: '2024-01-01', updated_at: '2024-01-01' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, officesRes] = await Promise.all([
        userService.listUsers(),
        rtoService.listOffices(),
      ]);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      else setUsers(mockUsers);
      if (officesRes.success && officesRes.data) setRtoOffices(officesRes.data);
      else setRtoOffices(mockRTOOffices);
    } catch (error) {
      setUsers(mockUsers);
      setRtoOffices(mockRTOOffices);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const response = await userService.assignRole(editingUser.id, formData.role, formData.rto_office_id || undefined);
      if (response.success) {
        toast({ title: 'Success', description: 'User role updated successfully' });
        setIsDialogOpen(false);
        setEditingUser(null);
        fetchData();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update role', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
      rto_office_id: user.rto_office_id || '',
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all system users and their roles</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-muted/50" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 bg-muted/50"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            {Object.entries(roleLabels).map(([role, label]) => (
              <SelectItem key={role} value={role}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(roleLabels).map(([role, label]) => (
          <Card key={role} className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{users.filter(u => u.role === role).length}</p>
              <p className="text-xs text-muted-foreground">{label}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>RTO Office</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${roleBadgeColors[user.role]} border-0`}>
                        <Shield className="h-3 w-3 mr-1" />{roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === 'ACTIVE' ? (
                        <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>
                      ) : user.status === 'SUSPENDED' ? (
                        <Badge className="badge-error"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>
                      ) : (
                        <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.rto_office_id ? (
                        <span className="text-sm">{rtoOffices.find(o => o.id === user.rto_office_id)?.name || 'Unknown'}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); setEditingUser(null); } }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card">
                          <DialogHeader>
                            <DialogTitle>Edit User Role</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleUpdateRole} className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="font-medium">{editingUser?.name}</p>
                              <p className="text-sm text-muted-foreground">{editingUser?.email}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(roleLabels).map(([role, label]) => (
                                    <SelectItem key={role} value={role}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {['RTO_OFFICER', 'RTO_ADMIN'].includes(formData.role) && (
                              <div className="space-y-2">
                                <Label>Assign to RTO Office</Label>
                                <Select value={formData.rto_office_id} onValueChange={(v) => setFormData({ ...formData, rto_office_id: v })}>
                                  <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select office" /></SelectTrigger>
                                  <SelectContent>
                                    {rtoOffices.map((office) => (
                                      <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Role'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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

export default UserManagement;
