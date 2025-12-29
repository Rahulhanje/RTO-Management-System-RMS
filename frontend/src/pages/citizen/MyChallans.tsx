import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { challanService, paymentService } from '@/services';
import { Challan, PaymentMethod } from '@/types';
import jsPDF from 'jspdf';
import { 
  AlertTriangle, 
  CreditCard, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MapPin,
  Smartphone,
  Building2,
  Wallet,
  Shield,
  Eye,
  Download
} from 'lucide-react';



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

const paymentMethods = [
  { id: 'UPI', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'CARD', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'NETBANKING', name: 'Net Banking', icon: Building2, description: 'All major banks' },
  { id: 'WALLET', name: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
];

const MyChallans: React.FC = () => {
  const { toast } = useToast();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);
  
  // Payment states
  const [paymentChallan, setPaymentChallan] = useState<Challan | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  
  // Payment details dialog
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [viewingChallan, setViewingChallan] = useState<Challan | null>(null);

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      const response = await challanService.getMyChallans();
      if (response.success && response.data) {
        // Extract challans array from nested response structure
        const challansData = (response.data as any).challans || response.data || [];
        if (Array.isArray(challansData)) {
          setChallans(challansData);
        } else {
          setChallans([]);
        }
      } else {
        setChallans([]);
      }
    } catch (error) {
      console.error('Error fetching challans:', error);
      setChallans([]);
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
        fetchChallans();
      }
      setSelectedChallan(null);
      setDisputeReason('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to submit dispute', variant: 'destructive' });
    } finally {
      setIsDisputing(false);
    }
  };

  const handlePayClick = (challan: Challan) => {
    setPaymentChallan(challan);
    setPaymentStep('select');
    setPaymentMethod('UPI');
    setUpiId('');
    setCardNumber('');
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!paymentChallan) return;
    
    setIsProcessingPayment(true);
    setPaymentStep('processing');
    
    try {
      // Simulate payment gateway processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the backend to process payment
      const response = await paymentService.payChallan(
        paymentChallan.id, 
        paymentMethod,
        `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      );
      
      if (response.success) {
        setPaymentStep('success');
        // Wait a moment to show success state
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({ 
          title: 'Payment Successful!', 
          description: `₹${paymentChallan.amount} paid successfully via ${paymentMethod}` 
        });
        
        fetchChallans();
        setIsPaymentDialogOpen(false);
        setPaymentChallan(null);
      }
    } catch (error: any) {
      setPaymentStep('select');
      toast({ 
        title: 'Payment Failed', 
        description: error.response?.data?.message || 'Failed to process payment. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleViewPaymentDetails = (challan: Challan) => {
    setViewingChallan(challan);
    setIsPaymentDetailsOpen(true);
  };

  const handleDownloadReceipt = (challan: Challan) => {
    // Generate PDF receipt
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('RTO Management System', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Traffic Challan Payment Receipt', 105, 25, { align: 'center' });
    doc.text('Regional Transport Office', 105, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    let yPos = 50;
    
    // Payment Details Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS', 20, yPos);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`RTO-${challan.id.slice(0, 8).toUpperCase()}`, 120, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Date:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text((challan.paid_at ? new Date(challan.paid_at) : new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), 120, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Time:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text((challan.paid_at ? new Date(challan.paid_at) : new Date()).toLocaleTimeString('en-IN'), 120, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(challan.transaction_id || `TXN-${challan.id.slice(0, 12)}`, 120, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(challan.payment_method || 'UPI', 120, yPos);
    yPos += 15;
    
    // Challan Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CHALLAN INFORMATION', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Challan ID:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(challan.id, 120, yPos);
    doc.setFontSize(10);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Violation Type:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(violationLabels[challan.violation_type] || challan.violation_type, 120, yPos);
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Date Issued:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text((challan.issued_at || challan.created_at) ? new Date(challan.issued_at || challan.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A', 120, yPos);
    yPos += 7;
    
    if (challan.location) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Location:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(challan.location, 120, yPos);
      yPos += 7;
    }
    
    if (challan.vehicle_number) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Vehicle Number:`, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(challan.vehicle_number, 120, yPos);
      yPos += 7;
    }
    
    yPos += 8;
    
    // Amount Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AMOUNT PAID', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Challan Amount:`, 20, yPos);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`₹${Number(challan.amount).toLocaleString('en-IN')}`, 120, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status:`, 20, yPos);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('✓ PAID', 120, yPos);
    
    // Stamp
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    yPos += 20;
    doc.text('*** This is a computer-generated receipt ***', 105, yPos, { align: 'center' });
    doc.text('Digital Signature Applied', 105, yPos + 5, { align: 'center' });
    
    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 270, 210, 27, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Regional Transport Office - Government Initiative', 105, 278, { align: 'center' });
    doc.text('For queries, contact: support@rto.gov.in | Helpline: 1800-XXX-XXXX', 105, 283, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, 288, { align: 'center' });
    
    // Save PDF
    doc.save(`RTO_Receipt_${challan.id.slice(0, 8)}_${Date.now()}.pdf`);

    toast({ title: 'Receipt Downloaded', description: 'Your payment receipt has been downloaded as PDF' });
  };

  const totalUnpaid = challans.filter(c => c.status === 'UNPAID').reduce((sum, c) => sum + Number(c.amount), 0);

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
                        <p className="text-sm text-muted-foreground">Challan ID: {challan.id.slice(0, 12)}</p>
                        {challan.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{challan.location}</p>}
                        <p className="text-sm text-muted-foreground">
                          {(challan.issued_at || challan.created_at) 
                            ? new Date(challan.issued_at || challan.created_at).toLocaleDateString()
                            : 'N/A'
                          }
                        </p>
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
                            <Button className="btn-gradient" onClick={() => handlePayClick(challan)}><CreditCard className="h-4 w-4 mr-2" />Pay Now</Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedChallan(challan)}>Dispute</Button>
                              </DialogTrigger>
                              <DialogContent className="glass-card max-h-[90vh] overflow-y-auto">
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
                        {challan.status === 'PAID' && (
                          <>
                            <Button variant="outline" onClick={() => handleViewPaymentDetails(challan)}>
                              <Eye className="h-4 w-4 mr-2" />View
                            </Button>
                            <Button className="btn-gradient" onClick={() => handleDownloadReceipt(challan)}>
                              <Download className="h-4 w-4 mr-2" />Receipt
                            </Button>
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

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="glass-card max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === 'success' ? 'Payment Successful!' : 'Pay Challan'}
            </DialogTitle>
          </DialogHeader>
          
          {paymentStep === 'select' && paymentChallan && (
            <div className="space-y-6">
              {/* Challan Summary */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Violation</span>
                  <span className="font-medium">{violationLabels[paymentChallan.violation_type]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Challan ID</span>
                  <span className="font-mono text-sm">{paymentChallan.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Amount to Pay</span>
                  <span className="text-xl font-bold text-primary">₹{paymentChallan.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Select Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`} onClick={() => setPaymentMethod(method.id as PaymentMethod)}>
                      <RadioGroupItem value={method.id} id={method.id} />
                      <method.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="cursor-pointer font-medium">{method.name}</Label>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* UPI ID Input */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input 
                    placeholder="yourname@upi" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    className="bg-muted/50"
                  />
                </div>
              )}

              {/* Card Number Input */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    value={cardNumber} 
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} 
                    maxLength={19}
                    className="bg-muted/50"
                  />
                </div>
              )}

              {/* Security Note */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Your payment is secured with 256-bit encryption</span>
              </div>

              {/* Pay Button */}
              <Button 
                className="btn-gradient w-full" 
                onClick={handlePayment} 
                disabled={isProcessingPayment || (paymentMethod === 'UPI' && !upiId) || (paymentMethod === 'CARD' && cardNumber.replace(/\s/g, '').length < 16)}
              >
                Pay ₹{paymentChallan.amount.toLocaleString()}
              </Button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <div>
                <p className="font-semibold text-lg">Processing Payment</p>
                <p className="text-muted-foreground">Please wait while we process your payment...</p>
              </div>
            </div>
          )}

          {paymentStep === 'success' && paymentChallan && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div>
                <p className="font-semibold text-lg">Payment Successful!</p>
                <p className="text-muted-foreground">₹{paymentChallan.amount} paid via {paymentMethod}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 text-sm space-y-1">
                <p><span className="text-muted-foreground">Transaction ID:</span> TXN{Date.now().toString().slice(-8)}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date().toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Dialog */}
      <Dialog open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          
          {viewingChallan && (
            <div className="space-y-6">
              {/* Payment Status */}
              <div className="flex items-center justify-center p-4 rounded-xl bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success mr-3" />
                <div>
                  <p className="font-semibold text-lg">Payment Completed</p>
                  <p className="text-sm text-muted-foreground">Your challan has been successfully paid</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Transaction Information</h3>
                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono font-semibold">{viewingChallan.transaction_id || `TXN-${viewingChallan.id.slice(0, 12)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold">{viewingChallan.payment_method || 'UPI'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date</span>
                    <span className="font-semibold">{viewingChallan.paid_at ? new Date(viewingChallan.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Time</span>
                    <span className="font-semibold">{viewingChallan.paid_at ? new Date(viewingChallan.paid_at).toLocaleTimeString('en-IN') : new Date().toLocaleTimeString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="text-xl font-bold text-success">₹{Number(viewingChallan.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Challan Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">Challan Information</h3>
                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Challan ID</span>
                    <span className="font-mono text-sm">{viewingChallan.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Violation Type</span>
                    <span className="font-semibold">{violationLabels[viewingChallan.violation_type] || viewingChallan.violation_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Issued</span>
                    <span className="font-semibold">
                      {(viewingChallan.created_at || viewingChallan.issued_at)
                        ? new Date(viewingChallan.created_at || viewingChallan.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'N/A'
                      }
                    </span>
                  </div>
                  {viewingChallan.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-semibold">{viewingChallan.location}</span>
                    </div>
                  )}
                  {viewingChallan.vehicle_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle Number</span>
                      <span className="font-semibold">{viewingChallan.vehicle_number}</span>
                    </div>
                  )}
                  {viewingChallan.description && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Description</span>
                      <span className="text-sm">{viewingChallan.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 btn-gradient" onClick={() => handleDownloadReceipt(viewingChallan)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyChallans;
