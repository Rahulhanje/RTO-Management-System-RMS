import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, Users, Car, CreditCard, Loader2, AlertTriangle } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface DashboardStats {
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  total_revenue: number;
}

interface RevenueData {
  period: string;
  challan_revenue: number;
  dl_revenue: number;
  vehicle_revenue: number;
  total_revenue: number;
}

const AdminAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [dashRes, revRes] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        analyticsService.getRevenueAnalytics(),
      ]);
      
      if (dashRes.success && dashRes.data) {
        setDashboardStats(dashRes.data.stats);
      }
      
      if (revRes.success && revRes.data) {
        setRevenueData(revRes.data.revenue || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive RTO statistics and insights</p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: dashboardStats?.total_users?.toLocaleString() || '0', icon: Users, color: 'from-primary to-secondary' },
          { label: 'Vehicles', value: dashboardStats?.total_vehicles?.toLocaleString() || '0', icon: Car, color: 'from-secondary to-accent' },
          { label: 'Licenses', value: dashboardStats?.total_licenses?.toLocaleString() || '0', icon: CreditCard, color: 'from-accent to-primary' },
          { label: 'Challans', value: dashboardStats?.total_challans?.toLocaleString() || '0', icon: AlertTriangle, color: 'from-warning to-destructive' },
          { label: 'Total Revenue', value: `₹${((dashboardStats?.total_revenue || 0) / 100000).toFixed(1)}L`, icon: Wallet, color: 'from-success to-accent' },
        ].map((stat, i) => (
          <Card key={i} className="stat-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="period" 
                      stroke="hsl(var(--muted-foreground))" 
                      tickFormatter={(value) => {
                        const date = new Date(value + '-01');
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, 'Total Revenue']} 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelFormatter={(label) => {
                        const date = new Date(label + '-01');
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      }}
                    />
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="total_revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={[
                        { 
                          name: 'Challans', 
                          value: revenueData.reduce((sum, item) => sum + item.challan_revenue, 0) 
                        },
                        { 
                          name: 'DL Applications', 
                          value: revenueData.reduce((sum, item) => sum + item.dl_revenue, 0) 
                        },
                        { 
                          name: 'Vehicle Registration', 
                          value: revenueData.reduce((sum, item) => sum + item.vehicle_revenue, 0) 
                        },
                      ].filter(item => item.value > 0)}
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100} 
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} 
                      labelLine={false}
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Revenue Breakdown by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))" 
                    tickFormatter={(value) => {
                      const date = new Date(value + '-01');
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `₹${v.toLocaleString()}`} />
                  <Tooltip 
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
                    labelFormatter={(label) => {
                      const date = new Date(label + '-01');
                      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    }}
                  />
                  <Bar dataKey="vehicle_revenue" fill="hsl(var(--primary))" name="Vehicles" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dl_revenue" fill="hsl(var(--secondary))" name="DL Apps" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="challan_revenue" fill="hsl(var(--warning))" name="Challans" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
