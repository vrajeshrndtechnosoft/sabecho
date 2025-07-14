import { ContactForm } from "./contact-form";
import { Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-orange-600 mb-4 border-b-4 border-orange-500 inline-block">CONTACT US</h1>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We’d love to hear from you! Reach out to us for any inquiries or support.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="border-t-4 border-orange-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-orange-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Office Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>Gujarat Packaging Industries</p>
                <p>235, Fortune Gold, Near Murlidhar Weigh Bridge,</p>
                <p>Kishan Gate Main Road, G.I.D.C Lodhika - 360021 (Metoda)</p>
                <p>Dist: Rajkot, State: Gujarat</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-orange-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-orange-600 flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Call Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-700">
                <p>Toll Free No.: 18001238911</p>
                <p>Ph. No.: (02827) 287677</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}