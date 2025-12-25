import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import { Car, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  const { toast } = useToast();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, formData.password);
      setIsSuccess(true);
      toast({ title: 'Password Reset!', description: 'You can now login with your new password.' });
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.response?.data?.message || 'Failed to reset password',
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
          <h1 className="text-2xl font-bold">{isSuccess ? 'Password Reset!' : 'Reset Password'}</h1>
          <p className="text-muted-foreground">
            {isSuccess ? 'Your password has been changed' : 'Create a new secure password'}
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-muted/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 bg-muted/50"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="btn-gradient w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Reset Password <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <Button className="btn-gradient w-full" asChild>
                  <Link to="/auth/login">Go to Login <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
