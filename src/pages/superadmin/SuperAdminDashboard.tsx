import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService, rtoService, userService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Shield, Activity, TrendingUp, AlertTriangle, Server, CheckCircle2, Loader2 } from 'lucide-react';

interface DashboardStats {
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  total_revenue: number;
}

const systemStatus = [
  { service: 'Database', status: 'operational', uptime: '99.99%' },
  { service: 'API Gateway', status: 'operational', uptime: '99.95%' },
  { service: 'Payment Gateway', status: 'operational', uptime: '99.90%' },
  { service: 'Notification Service', status: 'operational', uptime: '99.85%' },
];

const recentAdminActions = [
  { action: 'New RTO Office Created', user: 'Admin', time: '2 hours ago' },
  { action: 'User Role Updated', user: 'Admin', time: '4 hours ago' },
  { action: 'System Configuration Changed', user: 'Admin', time: '1 day ago' },
  { action: 'Office Deactivated', user: 'Admin', time: '2 days ago' },
];

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [rtoOffices, setRtoOffices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roleCounts, setRoleCounts] = useState({
    citizens: 0,
    police: 0,
    officers: 0,
    admins: 0,
    auditors: 0,
    super_admins: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [dashResponse, rtoResponse, usersResponse] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        rtoService.listOffices().catch(() => ({ success: false, data: [] })),
        userService.listUsers().catch(() => ({ success: false, data: [] })),
      ]);
      
      if (dashResponse.success && dashResponse.data) {
        setDashboardStats(dashResponse.data.stats);
      }
      
      if (rtoResponse.success && rtoResponse.data) {
        const officesData = (rtoResponse.data as any).rtoOffices || rtoResponse.data || [];
        if (Array.isArray(officesData)) {
          setRtoOffices(officesData);
        }
      }
      
      if (usersResponse.success && usersResponse.data) {
        const usersData = (usersResponse.data as any).users || usersResponse.data || [];
        if (Array.isArray(usersData)) {
          setUsers(usersData);
          // Count users by role
          const counts = {
            citizens: usersData.filter((u: any) => u.role === 'CITIZEN').length,
            police: usersData.filter((u: any) => u.role === 'POLICE').length,
            officers: usersData.filter((u: any) => u.role === 'RTO_OFFICER').length,
            admins: usersData.filter((u: any) => u.role === 'RTO_ADMIN').length,
            auditors: usersData.filter((u: any) => u.role === 'AUDITOR').length,
            super_admins: usersData.filter((u: any) => u.role === 'SUPER_ADMIN').length,
          };
          setRoleCounts(counts);
        }
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
      title: 'Total RTO Offices', 
      value: rtoOffices.length.toString(), 
      icon: Building2, 
      color: 'from-primary to-secondary', 
      change: '+2 this month' 
    },
    { 
      title: 'Total Users', 
      value: dashboardStats?.total_users?.toLocaleString() || '0', 
      icon: Users, 
      color: 'from-success to-accent', 
      change: '+340 new users' 
    },
    { 
      title: 'Active Roles', 
      value: '6', 
      icon: Shield, 
      color: 'from-warning to-destructive', 
      change: 'All configured' 
    },
    { 
      title: 'System Health', 
      value: '99.9%', 
      icon: Activity, 
      color: 'from-secondary to-primary', 
      change: 'Operational' 
    },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and management</p>
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

      {/* User Role Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.citizens.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Citizens</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.citizens / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.police.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Police Officers</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.police / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.officers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">RTO Officers</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.officers / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.admins.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">RTO Admins</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.admins / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.auditors.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Auditors</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.auditors / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="py-4 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold gradient-text">{roleCounts.super_admins.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Super Admins</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats?.total_users ? ((roleCounts.super_admins / dashboardStats.total_users) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status & Recent Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-primary" />System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemStatus.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                  <span className="font-medium">{service.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Uptime: {service.uptime}</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAdminActions.map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
