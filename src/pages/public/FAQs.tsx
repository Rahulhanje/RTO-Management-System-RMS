import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search } from 'lucide-react';

const faqCategories = [
  {
    category: 'General',
    faqs: [
      {
        question: 'What is the RTO Portal?',
        answer: 'RTO Portal is India\'s digital platform for all Regional Transport Office services. It allows citizens to register vehicles, apply for driving licenses, pay challans, book appointments, and access digital documents online.',
      },
      {
        question: 'Who can use this portal?',
        answer: 'Any Indian citizen with a valid Aadhaar number can register and use the portal. Different services are available based on your requirements - from first-time license applicants to commercial fleet operators.',
      },
      {
        question: 'Is the portal available 24/7?',
        answer: 'Yes, the online portal is available 24/7 for all digital services including applications, payments, and document access. Physical RTO office visits are subject to their working hours.',
      },
    ],
  },
  {
    category: 'Vehicle Registration',
    faqs: [
      {
        question: 'How do I register a new vehicle?',
        answer: 'After purchasing a vehicle, log in to your account, go to Vehicle Services > Register New Vehicle. Upload the required documents (invoice, insurance, identity proof), pay the registration fee, and submit. You\'ll receive a temporary registration number immediately.',
      },
      {
        question: 'What documents are required for vehicle registration?',
        answer: 'You need: Vehicle purchase invoice, Insurance certificate, Valid ID proof (Aadhaar/PAN), Address proof, Form 20 (sale certificate from dealer), Pollution Under Control (PUC) certificate, and proof of payment of road tax.',
      },
      {
        question: 'How long does registration take?',
        answer: 'Online applications are typically processed within 3-5 working days after document verification. You can track the status in real-time through your dashboard.',
      },
    ],
  },
  {
    category: 'Driving License',
    faqs: [
      {
        question: 'How do I apply for a new driving license?',
        answer: 'First, apply for a Learner\'s License through the portal. After the mandatory learning period (30 days for non-transport), book a driving test slot. Pass the test to receive your permanent license.',
      },
      {
        question: 'What is the minimum age for driving license?',
        answer: 'For geared vehicles (motorcycles): 18 years. For gearless vehicles (50cc and below): 16 years with guardian consent. For transport vehicles: 20 years.',
      },
      {
        question: 'How do I renew my driving license?',
        answer: 'Go to DL Services > Renew License. Upload a recent photo, updated address proof if changed, and medical certificate (for age 40+). Pay the renewal fee. The renewed DL is valid for 20 years or until age 50, whichever is earlier.',
      },
    ],
  },
  {
    category: 'Challans',
    faqs: [
      {
        question: 'How do I check if I have any pending challans?',
        answer: 'Log in to your account and go to Challans section. You can also check by entering your vehicle number or driving license number without logging in on the public challan search page.',
      },
      {
        question: 'Can I dispute a challan?',
        answer: 'Yes, you can dispute a challan within 30 days of issuance. Go to the challan details and click "Dispute". Provide your reasons and any supporting evidence. The dispute will be reviewed by RTO authorities.',
      },
      {
        question: 'What payment methods are accepted for challans?',
        answer: 'We accept Credit/Debit Cards, UPI, Net Banking, and mobile wallets. All payments are secured with 256-bit encryption.',
      },
    ],
  },
  {
    category: 'Appointments',
    faqs: [
      {
        question: 'How do I book an RTO appointment?',
        answer: 'Go to Appointments > Book New. Select your RTO office, purpose of visit, and choose an available date and time slot. You\'ll receive a confirmation with a unique appointment number.',
      },
      {
        question: 'Can I reschedule my appointment?',
        answer: 'Yes, you can reschedule up to 24 hours before the appointment time. Go to My Appointments, select the appointment, and click Reschedule to choose a new slot.',
      },
      {
        question: 'What happens if I miss my appointment?',
        answer: 'If you miss an appointment without canceling, you may need to wait 7 days before booking a new one. It\'s recommended to cancel at least 24 hours in advance if you can\'t make it.',
      },
    ],
  },
  {
    category: 'Technical',
    faqs: [
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the login page. Enter your registered email or phone number to receive an OTP. Verify the OTP and set a new password.',
      },
      {
        question: 'Why is my payment failing?',
        answer: 'Common reasons include insufficient balance, bank server issues, or network problems. Try a different payment method or try again after some time. If money is debited but not credited, it will be auto-refunded within 5-7 working days.',
      },
      {
        question: 'How secure is my data on this portal?',
        answer: 'We use bank-grade 256-bit SSL encryption, multi-factor authentication, and comply with all government data protection guidelines. Your data is stored securely and never shared with third parties.',
      },
    ],
  },
];

const FAQs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

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
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions about our services.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card/50 border-border"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {filteredFAQs.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <h2 className="text-xl font-semibold mb-4 gradient-text">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${catIndex}-${index}`}
                      className="glass-card border-none"
                    >
                      <AccordionTrigger className="px-6 hover:no-underline">
                        <span className="text-left">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No FAQs found matching your search. Try different keywords.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FAQs;
