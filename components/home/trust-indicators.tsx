import type { Industry } from "@/components/types"

interface TrustIndicatorsProps {
  industries: Industry[]
}

export default function TrustIndicators({ industries }: TrustIndicatorsProps) {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Industries</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From manufacturing to technology, businesses across all sectors trust Sabecho for their B2B needs.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                <industry.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
              <p className="text-sm text-gray-600">{industry.count} businesses</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
