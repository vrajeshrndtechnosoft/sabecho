import { Industry } from "@/components/types"

interface TrustIndicatorsProps {
  industries: Industry[]
}

export default function TrustIndicators({ industries }: TrustIndicatorsProps) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">Trusted by leading businesses across India</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <industry.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
              <p className="text-blue-600 font-medium">{industry.count} businesses</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
