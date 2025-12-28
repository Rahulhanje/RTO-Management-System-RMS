import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services';
import { IndianRupee, Download, Filter, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', revenue: 3500000 },
  { month: 'Feb', revenue: 4200000 },
  { month: 'Mar', revenue: 3800000 },
  { month: 'Apr', revenue: 5100000 },
  { month: 'May', revenue: 4700000 },
  { month: 'Jun', revenue: 5500000 },
  { month: 'Jul', revenue: 4900000 },
  { month: 'Aug', revenue: 5300000 },
  { month: 'Sep', revenue: 4600000 },
  { month: 'Oct', revenue: 5800000 },
  { month: 'Nov', revenue: 6200000 },
  { month: 'Dec', revenue: 5900000 },
];

const revenueByType = [
  { name: 'Challans', value: 28000000, color: 'hsl(var(--primary))' },
  { name: 'Vehicle Reg', value: 12000000, color: 'hsl(var(--secondary))' },
  { name: 'DL Apps', value: 3500000, color: 'hsl(var(--accent))' },
  { name: 'Other', value: 1500000, color: 'hsl(var(--muted-foreground))' },
];

const RevenueReports: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOffice, setSelectedOffice] = useState('ALL');

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthly = totalRevenue / 12;

  const handleExport = () => {
    toast({ title: 'Exporting', description: 'Revenue report will be downloaded shortly' });
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Reports</h1>
          <p className="text-muted-foreground">Detailed revenue analytics and reports</p>
        </div>
        <Button className="btn-gradient" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Start Date</Label>
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="bg-muted/50" />
            </div>
            <div className="flex-1">
              <Label>End Date</Label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="bg-muted/50" />
            </div>
            <div className="flex-1">
              <Label>RTO Office</Label>
              <Select value={selectedOffice} onValueChange={setSelectedOffice}>
                <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Offices</SelectItem>
                  <SelectItem value="MH-01">RTO Mumbai</SelectItem>
                  <SelectItem value="MH-02">RTO Thane</SelectItem>
                  <SelectItem value="MH-03">RTO Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Apply</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">₹{(totalRevenue / 10000000).toFixed(1)} Cr</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Monthly</p>
                <p className="text-2xl font-bold">₹{(avgMonthly / 100000).toFixed(1)} L</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">YoY Growth</p>
                <p className="text-2xl font-bold text-success">+18.5%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">₹45 L</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `₹${value / 100000}L`} />
                  <Tooltip formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, 'Revenue']} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={revenueByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {revenueByType.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${(value / 100000).toFixed(1)}L`, 'Revenue']} 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                color: '#ffffff'
              }} 
              labelStyle={{ color: '#ffffff' }}
              itemStyle={{ color: '#ffffff' }}
            />
          </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueReports;
