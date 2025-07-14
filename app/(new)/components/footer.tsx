import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-4">Sabecho</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India&apos;s most trusted B2B marketplace connecting businesses across the nation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/polymers-and-packaging/premium-boxes"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Raw Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/product/polymers-and-packaging/tape"
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200"
                >
                  Packaging Solution
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-400 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
            {/* Social Media Links */}
            <div className="mt-4">
              <h4 className="font-semibold text-orange-400 mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <Link href="https://www.facebook.com/sabecho" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  <Facebook className="w-6 h-6" />
                </Link>
                <Link href="https://www.twitter.com/sabecho" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  <Twitter className="w-6 h-6" />
                </Link>
                <Link href="https://www.linkedin.com/company/sabecho" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  <Linkedin className="w-6 h-6" />
                </Link>
                <Link href="https://www.instagram.com/sabecho" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  <Instagram className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Sabecho. All rights reserved. | Designed & Developed by{" "}
            <Link href="https://www.rndtechnosoft.com/" className="font-bold text-orange-400 hover:text-orange-300 transition-colors duration-200">
              RnD Technosoft
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}