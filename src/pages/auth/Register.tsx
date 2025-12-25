import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Mail, Lock, User, Phone, MapPin, Calendar, CreditCard, ArrowRight, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: '', date_of_birth: '', aadhaar_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) navigate('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Car className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold gradient-text">RTO Portal</span>
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join India's digital RTO platform</p>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-10 bg-muted/50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10 bg-muted/50" required />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="9876543210" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-10 bg-muted/50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="pl-10 bg-muted/50" required />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Aadhaar Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="123456789012" value={formData.aadhaar_number} onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })} className="pl-10 bg-muted/50" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter your full address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="pl-10 bg-muted/50" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="Create a password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 bg-muted/50" required />
                </div>
              </div>
              <Button type="submit" className="btn-gradient w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
