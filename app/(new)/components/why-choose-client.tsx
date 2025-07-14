"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { WhyChoose } from "@/models/home/WhyChoose";

interface WhyChooseClientProps {
  whyChooseData: WhyChoose[];
}

export function WhyChooseClient({ whyChooseData }: WhyChooseClientProps) {
  const [selectedUserType, setSelectedUserType] = useState<"Buyer" | "seller">("Buyer");

  const filteredItems = whyChooseData.filter((item) => item.userType === selectedUserType);

  return (
    <>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto text-center mb-6">
        Discover the benefits tailored for {selectedUserType === "Buyer" ? "buyers" : "sellers"} to grow and succeed
        with Sabecho.
      </p>
      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full border border-gray-200 p-1 bg-white shadow-sm">
          <Button
            variant={selectedUserType === "Buyer" ? "default" : "ghost"}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              selectedUserType === "Buyer"
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedUserType("Buyer")}
            aria-pressed={selectedUserType === "Buyer"}
            aria-label="View benefits for Buyers"
          >
            For Buyers
          </Button>
          <Button
            variant={selectedUserType === "seller" ? "default" : "ghost"}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors duration-200 ${
              selectedUserType === "seller"
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedUserType("seller")}
            aria-pressed={selectedUserType === "seller"}
            aria-label="View benefits for Sellers"
          >
            For Sellers
          </Button>
        </div>
      </div>
      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-700 text-lg">No benefits available for {selectedUserType === "Buyer" ? "buyers" : "sellers"} at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item._id}
              className="border border-gray-200 shadow-md hover:shadow-xl hover:border-orange-400 transition-all duration-300 overflow-hidden group hover:scale-[1.02]"
              aria-labelledby={`benefit-title-${item._id}`}
            >
              <CardHeader className="flex justify-center p-6 bg-white">
                {item.image && (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Image
                      src={`/api/v1/explore-categories/image/${item.image}`}
                      alt={item.imageAlt || item.title}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="object-contain"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="text-center p-6 pt-0 flex flex-col justify-between h-full">
                <div>
                  <CardTitle
                    id={`benefit-title-${item._id}`}
                    className="text-xl md:text-2xl font-semibold text-gray-900 mb-3"
                  >
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}