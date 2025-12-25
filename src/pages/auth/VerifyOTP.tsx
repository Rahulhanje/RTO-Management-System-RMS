import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import { Car, ArrowLeft, ArrowRight, Loader2, Shield } from 'lucide-react';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter 6-digit OTP', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(email, otp);
      if (response.success && response.data?.resetToken) {
        toast({ title: 'OTP Verified!', description: 'You can now reset your password.' });
        navigate(`/auth/reset-password?token=${encodeURIComponent(response.data.resetToken)}`);
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Invalid or expired OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Car className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold gradient-text">RTO Portal</span>
          </Link>
          <h1 className="text-2xl font-bold">Verify OTP</h1>
          <p className="text-muted-foreground">Enter the 6-digit code sent to {email}</p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>

              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="bg-muted/50 border-border" />
                    <InputOTPSlot index={1} className="bg-muted/50 border-border" />
                    <InputOTPSlot index={2} className="bg-muted/50 border-border" />
                    <InputOTPSlot index={3} className="bg-muted/50 border-border" />
                    <InputOTPSlot index={4} className="bg-muted/50 border-border" />
                    <InputOTPSlot index={5} className="bg-muted/50 border-border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button type="submit" className="btn-gradient w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Verify OTP <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Resend OTP
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
