import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Globe,
} from 'lucide-react';

const contactInfo = [
  {
    icon: Building2,
    title: 'Head Office',
    content: 'Ministry of Road Transport & Highways\nTransport Bhawan, New Delhi - 110001',
  },
  {
    icon: Phone,
    title: 'Helpline',
    content: '1800-xxx-xxxx (Toll Free)\nAvailable 24/7',
  },
  {
    icon: Mail,
    title: 'Email Support',
    content: 'support@rtoportal.gov.in\ngrievance@rtoportal.gov.in',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    content: 'Online Services: 24/7\nOffice: Mon-Sat, 9AM-6PM',
  },
];

const Contact: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Message Sent!',
      description: 'Thank you for contacting us. We will get back to you soon.',
    });

    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

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
              Contact <span className="gradient-text">Us</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need assistance? We're here to help. 
              Reach out to us through any of the channels below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card h-full">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <info.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{info.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {info.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-muted/50"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="Enter your phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                        >
                          <SelectTrigger className="bg-muted/50">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="vehicle">Vehicle Registration</SelectItem>
                            <SelectItem value="license">Driving License</SelectItem>
                            <SelectItem value="challan">Challan Related</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your message..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="bg-muted/50"
                      />
                    </div>

                    <Button type="submit" className="btn-gradient w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map/Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Pan-India Presence</h3>
                      <p className="text-muted-foreground">
                        With RTO offices across all states and union territories,
                        we're always accessible.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Regional Offices
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      'Delhi NCR',
                      'Mumbai',
                      'Bangalore',
                      'Chennai',
                      'Kolkata',
                      'Hyderabad',
                      'Ahmedabad',
                      'Pune',
                    ].map((city) => (
                      <div key={city} className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {city}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Need Urgent Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    For urgent matters, call our 24/7 helpline directly.
                  </p>
                  <Button variant="outline" size="lg" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    1800-xxx-xxxx
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
