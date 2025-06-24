"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Mail, Phone, Clock, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function ContactUs() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [message, setMessage] = useState<Message | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setMessage({ type: 'success', text: data.message });
      toast.success(data.message);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 shadow-lg">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            We&apos;d love to hear from you! Whether you have questions about our products, need support, or want to learn more about how Sabecho can help your business.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
              <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                    Let&apos;s Connect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
                      <p className="text-blue-600 font-medium text-lg">support@sabecho.com</p>
                      <p className="text-gray-600 text-sm">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
                      <p className="text-indigo-600 font-medium text-lg">+1 (555) 123-4567</p>
                      <p className="text-gray-600 text-sm">Available for urgent inquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                      <p className="text-green-600 font-medium">Monday - Friday</p>
                      <p className="text-gray-600 text-sm">9:00 AM - 5:00 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Location</h3>
                      <p className="text-purple-600 font-medium">Remote-First Company</p>
                      <p className="text-gray-600 text-sm">Serving clients worldwide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800">Send Us a Message</CardTitle>
                <p className="text-gray-600">Fill out the form below and we&apos;ll get back to you soon.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-gray-800 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700 font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      required
                      rows={6}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-gray-800 placeholder:text-gray-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom decorative section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 rounded-full border border-blue-100">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">We&apos;re here to help you succeed</span>
          </div>
        </div>
      </div>
    </div>
  );
}