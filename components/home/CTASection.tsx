import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 50,000+ businesses already growing with Sabecho. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Start Buying Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Become a Supplier
            </Button>
          </div>
          <div className="mt-8 text-blue-200">
            <p>✓ Free to join ✓ No setup fees ✓ 24/7 support</p>
          </div>
        </div>
      </div>
    </div>
  )
}