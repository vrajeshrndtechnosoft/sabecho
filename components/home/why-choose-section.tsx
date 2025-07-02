import type { WhyChoose } from "@/models/home/WhyChoose"
import { WhyChooseClient } from "./why-choose-client"

interface WhyChooseSectionProps {
  whyChooseData: WhyChoose[]
}

export default function WhyChooseSection({ whyChooseData }: WhyChooseSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" aria-labelledby="why-choose-heading">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h2 id="why-choose-heading" className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose Sabecho?
          </h2>
        </header>
        <WhyChooseClient whyChooseData={whyChooseData} />
      </div>
    </section>
  )
}
