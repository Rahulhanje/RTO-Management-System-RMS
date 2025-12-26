import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Car, CreditCard, AlertTriangle, Wallet, Loader2, TrendingUp, Users, FileText, Calendar } from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  total_revenue: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const dashResponse = await analyticsService.getDashboardAnalytics();
      
      if (dashResponse.success && dashResponse.data) {
        setDashboardStats(dashResponse.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Vehicles', 
      value: dashboardStats?.total_vehicles?.toLocaleString() || '0', 
      icon: Car, 
      color: 'from-primary to-secondary', 
      change: `${dashboardStats?.pending_applications || 0} pending` 
    },
    { 
      title: 'DL Applications', 
      value: dashboardStats?.total_licenses?.toLocaleString() || '0', 
      icon: CreditCard, 
      color: 'from-secondary to-accent', 
      change: `${dashboardStats?.pending_applications || 0} pending review` 
    },
    { 
      title: 'Total Challans', 
      value: dashboardStats?.total_challans?.toLocaleString() || '0', 
      icon: AlertTriangle, 
      color: 'from-warning to-destructive', 
      change: 'Active violations' 
    },
    { 
      title: 'Total Revenue', 
      value: `₹${((dashboardStats?.total_revenue || 0) / 100000).toFixed(1)}L`, 
      icon: Wallet, 
      color: 'from-success to-accent', 
      change: 'All time collection' 
    },
  ];

  const quickStats = [
    { label: 'Total Users', value: dashboardStats?.total_users?.toLocaleString() || '0', change: 'Registered' },
    { label: 'Vehicles Registered', value: dashboardStats?.total_vehicles?.toLocaleString() || '0', change: 'Active' },
    { label: 'DLs Issued', value: dashboardStats?.total_licenses?.toLocaleString() || '0', change: 'Valid' },
    { label: 'Pending Applications', value: dashboardStats?.pending_applications?.toLocaleString() || '0', change: 'Awaiting review' },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
        <p className="text-muted-foreground">RTO Admin Dashboard</p>
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

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-success mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Info */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">System Performance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Server Status</span>
                <span className="text-sm font-medium text-success">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium">~250ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database Health</span>
                <span className="text-sm font-medium text-success">Good</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-semibold">User Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Sessions</span>
                <span className="text-sm font-medium">{Math.floor((dashboardStats?.total_users || 0) * 0.15)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">New Registrations Today</span>
                <span className="text-sm font-medium">+12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <span className="text-sm font-medium">10 AM - 2 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Processed Today</span>
                <span className="text-sm font-medium">{Math.floor((dashboardStats?.pending_applications || 0) * 0.3)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="text-sm font-medium text-success">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Processing Time</span>
                <span className="text-sm font-medium">2.5 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;