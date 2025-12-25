import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import { Car, Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast({
        title: 'OTP Sent!',
        description: 'Check your email for the verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Car className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold gradient-text">RTO Portal</span>
          </Link>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">
            {isSubmitted ? 'Check your email for OTP' : 'Enter your email to receive reset OTP'}
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="btn-gradient w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <p className="text-muted-foreground">
                  We've sent an OTP to <strong>{email}</strong>
                </p>
                <Button className="btn-gradient w-full" asChild>
                  <Link to={`/auth/verify-otp?email=${encodeURIComponent(email)}`}>
                    Enter OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
