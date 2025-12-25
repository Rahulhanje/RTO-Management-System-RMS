import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services';
import { Payment } from '@/types';
import { Wallet, CreditCard, Loader2, CheckCircle2, XCircle, Clock, ArrowDownRight, ArrowUpRight, Download, Info } from 'lucide-react';

// Mock data for demo mode
const mockPayments: Payment[] = [
  { id: 'PAY001', user_id: 'user1', amount: 1000, payment_type: 'CHALLAN', status: 'COMPLETED', payment_method: 'UPI', transaction_id: 'TXN2024123001', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'PAY002', user_id: 'user1', amount: 500, payment_type: 'DL_FEE', status: 'COMPLETED', payment_method: 'Debit Card', transaction_id: 'TXN2024122901', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'PAY003', user_id: 'user1', amount: 2500, payment_type: 'VEHICLE_REG', status: 'COMPLETED', payment_method: 'Net Banking', transaction_id: 'TXN2024121501', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'PAY004', user_id: 'user1', amount: 300, payment_type: 'CHALLAN', status: 'PENDING', payment_method: 'UPI', transaction_id: null, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'PAY005', user_id: 'user1', amount: 1500, payment_type: 'DL_RENEWAL', status: 'REFUNDED', payment_method: 'Credit Card', transaction_id: 'TXN2024120101', refund_id: 'REF2024120501', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <Badge className="badge-success"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
    case 'PENDING': return <Badge className="badge-warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case 'FAILED': return <Badge className="badge-error"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
    case 'REFUNDED': return <Badge className="badge-info"><ArrowUpRight className="h-3 w-3 mr-1" />Refunded</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const paymentTypeLabels: Record<string, string> = {
  CHALLAN: 'Challan Payment',
  DL_FEE: 'DL Application Fee',
  DL_RENEWAL: 'DL Renewal Fee',
  VEHICLE_REG: 'Vehicle Registration',
  OTHER: 'Other',
};

const PaymentHistory: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getMyPaymentHistory().catch(() => ({ success: false, data: [] }));
      const data = response.success && Array.isArray(response.data) ? response.data : [];
      
      if (data.length === 0) {
        setPayments(mockPayments);
        setIsDemoMode(true);
      } else {
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments(mockPayments);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = (payment: Payment) => {
    toast({ title: isDemoMode ? 'Demo Mode' : 'Info', description: 'Receipt download will be implemented' });
  };

  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      {isDemoMode && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary">Demo Mode: Displaying sample payment history</span>
        </div>
      )}
      
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View your payment history and transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-success-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-warning to-destructive flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
            <p className="text-muted-foreground">You haven't made any payments yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, index) => (
            <motion.div key={payment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="glass-card-hover">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${payment.status === 'COMPLETED' ? 'bg-success/20 text-success' : payment.status === 'PENDING' ? 'bg-warning/20 text-warning' : payment.status === 'REFUNDED' ? 'bg-info/20 text-info' : 'bg-destructive/20 text-destructive'}`}>
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{paymentTypeLabels[payment.payment_type] || payment.payment_type}</p>
                        <p className="text-sm text-muted-foreground">{payment.payment_method || 'N/A'} • {new Date(payment.created_at).toLocaleDateString()}</p>
                        {payment.transaction_id && <p className="text-xs text-muted-foreground">TXN: {payment.transaction_id}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{payment.amount.toLocaleString()}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      {payment.status === 'COMPLETED' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(payment)}><Download className="h-4 w-4" /></Button>
                      )}
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

export default PaymentHistory;
