import type { HowItWorksStep } from "@/components/types"

interface HowItWorksSectionProps {
  steps: HowItWorksStep[]
}

export default function HowItWorksSection({ steps }: HowItWorksSectionProps) {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with Sabecho in three simple steps and connect with verified suppliers.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <div className="bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">{step.step}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
