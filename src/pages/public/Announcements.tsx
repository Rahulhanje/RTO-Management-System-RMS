import React from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const announcements = [
  {
    id: 1,
    type: 'important',
    title: 'New Vehicle Registration Process Update',
    date: '2024-12-20',
    description: 'Starting January 2025, all new vehicle registrations will require an additional pollution control certificate from authorized testing centers.',
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'info',
    title: 'Extended Working Hours During Festival Season',
    date: '2024-12-18',
    description: 'RTO offices across all states will have extended working hours from December 25 to January 5 to handle increased demand.',
    icon: Info,
  },
  {
    id: 3,
    type: 'update',
    title: 'Digital DL Now Accepted Nationwide',
    date: '2024-12-15',
    description: 'Digital Driving Licenses from the RTO Portal are now legally valid and accepted across all states and union territories.',
    icon: CheckCircle,
  },
  {
    id: 4,
    type: 'important',
    title: 'Challan Payment Deadline Extension',
    date: '2024-12-10',
    description: 'Due to technical maintenance, the deadline for pending challan payments has been extended by 15 days. No late fees will be charged during this period.',
    icon: AlertTriangle,
  },
  {
    id: 5,
    type: 'info',
    title: 'New RTO Offices Inaugurated in 5 Districts',
    date: '2024-12-05',
    description: 'New RTO offices have been opened in Vijayawada, Nagpur, Jaipur, Lucknow, and Patna to better serve citizens.',
    icon: Info,
  },
  {
    id: 6,
    type: 'update',
    title: 'Mobile App Version 2.0 Released',
    date: '2024-12-01',
    description: 'Download the latest version of our mobile app with improved performance, new features, and enhanced security.',
    icon: CheckCircle,
  },
];

const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'important':
      return 'destructive';
    case 'update':
      return 'default';
    default:
      return 'secondary';
  }
};

const Announcements: React.FC = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-32 hero-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Announcements & <span className="gradient-text">Notices</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with the latest news, policy changes, and important notices from RTO.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          announcement.type === 'important' 
                            ? 'bg-destructive/20 text-destructive' 
                            : announcement.type === 'update'
                            ? 'bg-success/20 text-success'
                            : 'bg-secondary/20 text-secondary'
                        }`}>
                          <announcement.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg mb-1">{announcement.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(announcement.date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                      <Badge variant={getBadgeVariant(announcement.type)}>
                        {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {announcement.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Announcements;
