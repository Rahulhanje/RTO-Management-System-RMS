import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const quickLinks = [
  { href: '/services', label: 'Our Services' },
  { href: '/about', label: 'About RTO' },
  { href: '/faqs', label: 'FAQs' },
  { href: '/contact', label: 'Contact Us' },
];

const serviceLinks = [
  { href: '/auth/register', label: 'Vehicle Registration' },
  { href: '/auth/register', label: 'Driving License' },
  { href: '/auth/register', label: 'Pay Challans' },
  { href: '/auth/register', label: 'Book Appointment' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card/50 backdrop-blur-xl border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text">RTO Portal</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              India's most advanced digital platform for all Regional Transport Office services. 
              Fast, secure, and accessible to every citizen.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  Ministry of Road Transport,<br />
                  Transport Bhawan, New Delhi
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">1800-xxx-xxxx (Toll Free)</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">support@rtoportal.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RTO Portal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/accessibility" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
