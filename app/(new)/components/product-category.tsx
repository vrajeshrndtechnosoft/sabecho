"use client";

import Image from "next/image";
import { Atom, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Category } from "@/components/types";

interface ProductGroupDisplayProps {
  categories: Category[];
}

export default function ProductGroupDisplay({ categories }: ProductGroupDisplayProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "left" | "right") => {
    const scrollAmount = 200;
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-[#f7f7f7] py-4">
      <div className="container mx-auto">
        <div className="border border-gray-300 bg-white">
          {/* Heading */}
          <div className="relative w-full mb-4">
            <div className="flex items-center border-b-4 border-orange-500 shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gray-100 p-2">
              <div className="flex items-center space-x-2">
                <Atom className="w-6 h-6 text-black" />
                <h2 className="text-xl font-bold uppercase text-black">
                  Paper Bowl - Food Disposable
                </h2>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-1 bg-orange-500"></div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 px-4 py-4 border-b border-gray-200 overflow-x-auto">
            {categories.map((category) => (
              <a
                key={category._id}
                href={`/products/${category.title.toLowerCase().replace(/ /g, "-").replace(/&/g, "")}`}
                className="px-4 py-2 text-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all text-left whitespace-nowrap rounded bg-gray-200 text-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-orange-500"
              >
                {category.title}
              </a>
            ))}
          </div>

          {/* Large screen: Flex row layout */}
          <div className="hidden lg:flex flex-wrap justify-start gap-6 px-6 py-6">
            {categories.map((category) => (
              <div key={category._id} className="text-center w-[180px]">
                <div className="relative border border-gray-300 mb-4 w-full h-[150px] flex items-center justify-center overflow-hidden">
                  {category.image?.url ? (
                    <Image
                      src={`/api/v1/explore-categories/image/${category.image.url}`}
                      alt={category.image.altText}
                      width={150}
                      height={150}
                      className="object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                      <Atom className="w-8 h-8 text-orange-500" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {category.productNames.join(", ")}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile carousel */}
          <div className="lg:hidden relative p-4">
            <div className="overflow-hidden">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x"
              >
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="min-w-[170px] snap-start text-center flex-shrink-0"
                  >
                    <div className="relative mb-2 border border-gray-300 overflow-hidden w-[150px] h-[150px] mx-auto flex items-center justify-center">
                      {category.image?.url ? (
                        <Image
                          src={`/api/v1/explore-categories/image/${category.image.url}`}
                          alt={category.image.altText}
                          width={150}
                          height={150}
                          className="object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <Atom className="w-8 h-8 text-orange-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {category.productNames.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel navigation */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 p-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
