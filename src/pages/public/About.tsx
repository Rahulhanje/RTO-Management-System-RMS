import React from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  Eye,
  Award,
  Users,
  Shield,
  Zap,
  Globe,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Transparency',
    description: 'Every process is trackable and visible to citizens.',
  },
  {
    icon: Zap,
    title: 'Efficiency',
    description: 'Leveraging technology for faster service delivery.',
  },
  {
    icon: Users,
    title: 'Citizen First',
    description: 'Designed with the user experience at the center.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Available 24/7 from anywhere in India.',
  },
];

const milestones = [
  { year: '2020', title: 'Digital Initiative Launched', desc: 'Started the digital transformation journey' },
  { year: '2021', title: 'Pan-India Rollout', desc: 'Expanded to all states and union territories' },
  { year: '2022', title: '10M Users Milestone', desc: 'Crossed 10 million registered users' },
  { year: '2023', title: 'AI Integration', desc: 'Introduced AI-powered document verification' },
  { year: '2024', title: 'Mobile First', desc: 'Launched enhanced mobile experience' },
];

const About: React.FC = () => {
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
              About <span className="gradient-text">RTO Portal</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Revolutionizing India's transport services through digital innovation. 
              We're on a mission to make every RTO service accessible, efficient, and transparent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card h-full">
                <CardContent className="pt-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                    <Target className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To transform India's Regional Transport Office services into a seamless, 
                    digital-first experience that saves time, reduces paperwork, and ensures 
                    transparency in every transaction. We aim to eliminate queues and bring 
                    all RTO services to citizens' fingertips.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card h-full">
                <CardContent className="pt-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-6">
                    <Eye className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the world's most advanced and citizen-friendly transport 
                    management system. We envision a future where every vehicle 
                    registration, license application, and compliance check happens 
                    instantly and securely through our platform.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core <span className="gradient-text">Values</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card-hover h-full text-center">
                  <CardContent className="pt-8">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Journey</span>
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent" />

              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="hidden md:block flex-1" />
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <Card className="glass-card flex-1 ml-12 md:ml-0">
                    <CardContent className="pt-6">
                      <span className="text-sm text-primary font-semibold">{milestone.year}</span>
                      <h3 className="text-lg font-bold mt-1">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{milestone.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recognition & <span className="gradient-text">Awards</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Award, title: 'Digital India Award 2023', org: 'Ministry of IT' },
              { icon: Building2, title: 'Best e-Governance Initiative', org: 'NASSCOM' },
              { icon: Users, title: 'Citizen Choice Award', org: 'India Today' },
            ].map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card text-center">
                  <CardContent className="pt-8">
                    <award.icon className="h-12 w-12 text-warning mx-auto mb-4" />
                    <h3 className="font-semibold">{award.title}</h3>
                    <p className="text-sm text-muted-foreground">{award.org}</p>
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

export default About;
