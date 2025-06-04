import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HowItWorksStep } from "@/components/types"

interface HowItWorksSectionProps {
  steps: HowItWorksStep[]
}

export default function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get started in minutes and connect with verified suppliers across India.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="text-center group">
            <div className="relative mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                {step.step}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <step.icon className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">
          Start Your First Order
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
