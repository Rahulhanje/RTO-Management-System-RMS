import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Car, CreditCard, AlertTriangle, Calendar, TrendingUp, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

const stats = [
  { title: 'My Vehicles', value: '2', icon: Car, color: 'from-primary to-secondary', change: '+1 this month' },
  { title: 'Driving License', value: 'Active', icon: CreditCard, color: 'from-success to-accent', change: 'Valid till 2030' },
  { title: 'Pending Challans', value: '1', icon: AlertTriangle, color: 'from-warning to-destructive', change: '₹500 due' },
  { title: 'Appointments', value: '1', icon: Calendar, color: 'from-secondary to-primary', change: 'Dec 28, 2024' },
];

const recentActivities = [
  { action: 'Vehicle Registration Approved', time: '2 hours ago', status: 'success' },
  { action: 'Challan Payment Received', time: '1 day ago', status: 'success' },
  { action: 'DL Renewal Application Submitted', time: '3 days ago', status: 'pending' },
  { action: 'Appointment Booked', time: '1 week ago', status: 'success' },
];

const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0] || 'Citizen'}!</h1>
        <p className="text-muted-foreground">Here's an overview of your RTO services</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="stat-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {['Register Vehicle', 'Apply for DL', 'Pay Challan', 'Book Appointment'].map((action, i) => (
              <button key={i} className="p-4 rounded-xl bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all text-left">
                <ArrowUpRight className="h-4 w-4 text-primary mb-2" />
                <span className="text-sm font-medium">{action}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.status === 'success' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CitizenDashboard;
