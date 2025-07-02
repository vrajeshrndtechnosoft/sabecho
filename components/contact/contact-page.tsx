import { ContactForm } from "./contact-form"
import { MessageCircle, Mail, Phone, Clock, MapPin, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Contact() {
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
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            We&apos;d love to hear from you! Whether you have questions about our products, need support, or want to
            learn more about how Sabecho can help your business.
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
          <ContactForm />
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
  )
}
