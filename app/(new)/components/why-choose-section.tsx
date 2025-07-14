import type { WhyChoose } from "@/models/home/WhyChoose";
import { WhyChooseClient } from "./why-choose-client";

interface WhyChooseSectionProps {
  whyChooseData: WhyChoose[];
}

export default function WhyChooseSection({ whyChooseData }: WhyChooseSectionProps) {
  return (
    <section
      className="py-24 bg-gray-50"
      aria-labelledby="why-choose-heading"
    >
      <div className="container mx-auto px-4">
        <header className="text-center mb-20">
          <h2
            id="why-choose-heading"
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 relative"
          >
            Why Choose Sabecho?
            <span className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-orange-500 rounded-full"></span>
          </h2>
        </header>
        <WhyChooseClient whyChooseData={whyChooseData} />
      </div>
    </section>
  );
}