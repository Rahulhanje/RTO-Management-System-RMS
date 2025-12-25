import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { challanService } from '@/services';
import { Challan } from '@/types';
import { AlertTriangle, CreditCard, FileText, Loader2, CheckCircle2, Clock, XCircle, MapPin } from 'lucide-react';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PAID': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
    case 'UNPAID': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Unpaid</Badge>;
    case 'DISPUTED': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Disputed</Badge>;
    case 'RESOLVED': return <Badge className="badge-info"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const violationLabels: Record<string, string> = {
  OVER_SPEEDING: 'Over Speeding',
  SIGNAL_JUMP: 'Signal Jump',
  NO_HELMET: 'No Helmet',
  NO_SEATBELT: 'No Seatbelt',
  DRUNK_DRIVING: 'Drunk Driving',
  WRONG_PARKING: 'Wrong Parking',
  NO_LICENSE: 'No License',
  NO_INSURANCE: 'No Insurance',
  OTHER: 'Other',
};

const MyChallans: React.FC = () => {
  const { toast } = useToast();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await challanService.getMyChallans();
      if (response.success) setChallans(response.data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load challans', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!selectedChallan || !disputeReason) return;
    setIsDisputing(true);
    try {
      const response = await challanService.disputeChallan(selectedChallan.id, disputeReason);
      if (response.success) {
        toast({ title: 'Success', description: 'Dispute submitted successfully' });
        setSelectedChallan(null);
        setDisputeReason('');
        fetchChallans();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to submit dispute', variant: 'destructive' });
    } finally {
      setIsDisputing(false);
    }
  };

  const totalUnpaid = challans.filter(c => c.status === 'UNPAID').reduce((sum, c) => sum + c.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">My Challans</h1>
        <p className="text-muted-foreground">View and pay your traffic challans</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Challans</p>
                <p className="text-2xl font-bold">{challans.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid Amount</p>
                <p className="text-2xl font-bold text-destructive">₹{totalUnpaid.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success">{challans.filter(c => c.status === 'PAID').length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challans List */}
      {challans.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Challans!</h3>
            <p className="text-muted-foreground">You have no traffic challans. Keep driving safely!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {challans.map((challan, index) => (
            <motion.div key={challan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="glass-card-hover">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${challan.status === 'UNPAID' ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{violationLabels[challan.violation_type] || challan.violation_type}</p>
                        <p className="text-sm text-muted-foreground">Challan ID: {challan.id.slice(0, 8)}...</p>
                        {challan.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{challan.location}</p>}
                        <p className="text-sm text-muted-foreground">{new Date(challan.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">₹{challan.amount.toLocaleString()}</p>
                        {getStatusBadge(challan.status)}
                      </div>
                      <div className="flex gap-2">
                        {challan.status === 'UNPAID' && (
                          <>
                            <Button className="btn-gradient"><CreditCard className="h-4 w-4 mr-2" />Pay Now</Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedChallan(challan)}>Dispute</Button>
                              </DialogTrigger>
                              <DialogContent className="glass-card">
                                <DialogHeader>
                                  <DialogTitle>Dispute Challan</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 rounded-lg bg-muted/50">
                                    <p className="font-medium">{violationLabels[challan.violation_type]}</p>
                                    <p className="text-sm text-muted-foreground">Amount: ₹{challan.amount}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Reason for Dispute</Label>
                                    <Textarea placeholder="Explain why you are disputing this challan..." value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} className="bg-muted/50" rows={4} />
                                  </div>
                                  <Button className="btn-gradient w-full" onClick={handleDispute} disabled={isDisputing || !disputeReason}>
                                    {isDisputing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Dispute'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChallans;
