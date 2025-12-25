import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Car,
  CreditCard,
  FileCheck,
  Calendar,
  Shield,
  RefreshCw,
  FileText,
  AlertTriangle,
  QrCode,
  ClipboardCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';

const services = [
  {
    icon: Car,
    title: 'Vehicle Registration',
    description: 'Register new vehicles with complete documentation and get your RC instantly.',
    features: ['New Vehicle Registration', 'Re-registration', 'Address Change', 'NOC Services'],
    color: 'from-primary to-secondary',
  },
  {
    icon: CreditCard,
    title: 'Driving License',
    description: 'Apply for learner\'s license, permanent license, or renew your existing one.',
    features: ['New License', 'Renewal', 'Duplicate DL', 'International Permit'],
    color: 'from-secondary to-accent',
  },
  {
    icon: RefreshCw,
    title: 'Ownership Transfer',
    description: 'Transfer vehicle ownership seamlessly with digital documentation.',
    features: ['Buyer/Seller Flow', 'Document Verification', 'Online Payment', 'Instant Update'],
    color: 'from-accent to-primary',
  },
  {
    icon: AlertTriangle,
    title: 'Challan Payment',
    description: 'View and pay traffic challans online with instant confirmation.',
    features: ['View Challans', 'Online Payment', 'Dispute Filing', 'Receipt Download'],
    color: 'from-warning to-destructive',
  },
  {
    icon: Calendar,
    title: 'Appointment Booking',
    description: 'Book your RTO visit for tests, verification, and document submission.',
    features: ['Slot Selection', 'Reschedule', 'Cancel', 'Reminders'],
    color: 'from-primary to-accent',
  },
  {
    icon: QrCode,
    title: 'Digital Documents',
    description: 'Access your Digital DL and RC with QR verification anywhere.',
    features: ['Digital DL', 'Digital RC', 'QR Verification', 'Share Documents'],
    color: 'from-secondary to-primary',
  },
  {
    icon: ClipboardCheck,
    title: 'Fitness Certificate',
    description: 'Apply for and renew vehicle fitness certificates online.',
    features: ['Apply Online', 'Track Status', 'Renewal', 'Download Certificate'],
    color: 'from-success to-secondary',
  },
  {
    icon: Truck,
    title: 'Commercial Vehicles',
    description: 'Special services for commercial vehicle registration and permits.',
    features: ['Fleet Registration', 'Permits', 'Tax Payment', 'Compliance'],
    color: 'from-primary to-warning',
  },
];

const Services: React.FC = () => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Comprehensive digital RTO services designed for speed, convenience, and transparency. 
              From vehicle registration to driving licenses, we've got you covered.
            </p>
            <Button size="lg" className="btn-gradient" asChild>
              <Link to="/auth/register">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card-hover h-full group">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <service.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{service.description}</CardDescription>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple <span className="gradient-text">Process</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined digital process makes availing RTO services easier than ever.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Register', desc: 'Create your account with Aadhaar verification' },
                { step: '2', title: 'Select Service', desc: 'Choose the service you need' },
                { step: '3', title: 'Upload & Pay', desc: 'Submit documents and make payment' },
                { step: '4', title: 'Track & Receive', desc: 'Track status and receive digitally' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="glass-card text-center h-full">
                    <CardContent className="pt-8">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 text-lg font-bold text-primary-foreground">
                        {item.step}
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help Choosing a Service?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to guide you through our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-gradient" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/faqs">View FAQs</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Services;
