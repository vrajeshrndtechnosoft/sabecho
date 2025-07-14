"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductTabsProps {
  specifications: {
    capacity: string
    material: string
    gsm: string
    type: string
    features: string[]
  }
  description: string
}

export function ProductTabs({ specifications, description }: ProductTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="specification" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="specification" className="text-sm font-medium">
            SPECIFICATION
          </TabsTrigger>
          <TabsTrigger value="description" className="text-sm font-medium">
            PRODUCT DESCRIPTION
          </TabsTrigger>
        </TabsList>

        <TabsContent value="specification" className="mt-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Specifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{specifications.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium">{specifications.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GSM:</span>
                      <span className="font-medium">{specifications.gsm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{specifications.type}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                  <ul className="space-y-1 text-sm">
                    {specifications.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="description" className="mt-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
