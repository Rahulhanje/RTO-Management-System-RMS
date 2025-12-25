import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Shield, UserCheck, AlertTriangle, Check, X, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

interface RoleRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  current_role: UserRole;
  requested_role: UserRole;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

const mockRoleRequests: RoleRequest[] = [
  {
    id: '1',
    user_id: 'u1',
    user_name: 'Rahul Sharma',
    user_email: 'rahul.sharma@email.com',
    current_role: 'CITIZEN',
    requested_role: 'POLICE',
    reason: 'I am a newly appointed traffic police officer at Mumbai Division',
    status: 'PENDING',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    user_id: 'u2',
    user_name: 'Priya Patel',
    user_email: 'priya.patel@rto.gov.in',
    current_role: 'RTO_OFFICER',
    requested_role: 'RTO_ADMIN',
    reason: 'Promoted to Regional Transport Administrator for Gujarat zone',
    status: 'PENDING',
    created_at: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    user_id: 'u3',
    user_name: 'Amit Kumar',
    user_email: 'amit.kumar@audit.gov.in',
    current_role: 'CITIZEN',
    requested_role: 'AUDITOR',
    reason: 'Assigned as external auditor for RTO financial review',
    status: 'APPROVED',
    created_at: '2024-01-10T09:00:00Z',
    reviewed_at: '2024-01-11T11:30:00Z',
    reviewed_by: 'Super Admin',
  },
  {
    id: '4',
    user_id: 'u4',
    user_name: 'Sneha Reddy',
    user_email: 'sneha.reddy@email.com',
    current_role: 'CITIZEN',
    requested_role: 'RTO_OFFICER',
    reason: 'No valid documentation provided',
    status: 'REJECTED',
    created_at: '2024-01-08T16:45:00Z',
    reviewed_at: '2024-01-09T10:00:00Z',
    reviewed_by: 'Super Admin',
  },
];

const roleLabels: Record<UserRole, string> = {
  CITIZEN: 'Citizen',
  POLICE: 'Police Officer',
  RTO_OFFICER: 'RTO Officer',
  RTO_ADMIN: 'RTO Admin',
  SUPER_ADMIN: 'Super Admin',
  AUDITOR: 'Auditor',
};

const roleBadgeColors: Record<UserRole, string> = {
  CITIZEN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  POLICE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  RTO_OFFICER: 'bg-green-500/20 text-green-400 border-green-500/30',
  RTO_ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SUPER_ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
  AUDITOR: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusBadgeColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const RoleAssignment: React.FC = () => {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequests(mockRoleRequests);
      setLoading(false);
    }, 500);
  }, []);

  const handleApprove = (request: RoleRequest) => {
    setRequests(prev => 
      prev.map(r => r.id === request.id 
        ? { ...r, status: 'APPROVED' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Super Admin' }
        : r
      )
    );
    toast.success(`Role change approved for ${request.user_name}`);
    setReviewDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (request: RoleRequest) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setRequests(prev => 
      prev.map(r => r.id === request.id 
        ? { ...r, status: 'REJECTED' as const, reviewed_at: new Date().toISOString(), reviewed_by: 'Super Admin' }
        : r
      )
    );
    toast.success(`Role request rejected for ${request.user_name}`);
    setReviewDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Role Assignment</h1>
        <p className="text-muted-foreground">
          Review and manage user role change requests
        </p>
        <Badge variant="outline" className="w-fit bg-amber-500/10 text-amber-400 border-amber-500/30">
          Demo Mode - Using Mock Data
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20">
                  <X className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Change Requests
          </CardTitle>
          <CardDescription>
            Review and process user role change requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No role requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.user_name}</p>
                          <p className="text-sm text-muted-foreground">{request.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadgeColors[request.current_role]}>
                          {roleLabels[request.current_role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleBadgeColors[request.requested_role]}>
                          {roleLabels[request.requested_role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeColors[request.status]}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-400 hover:bg-green-500/20"
                              onClick={() => handleApprove(request)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-400 hover:bg-red-500/20"
                              onClick={() => {
                                setSelectedRequest(request);
                                setReviewDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Reject Role Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this role change request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p><strong>User:</strong> {selectedRequest.user_name}</p>
                <p><strong>Requested Role:</strong> {roleLabels[selectedRequest.requested_role]}</p>
                <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Input
                  id="rejection-reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleReject(selectedRequest)}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleAssignment;