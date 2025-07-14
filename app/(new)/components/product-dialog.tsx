"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ProductDialog() {
  const [open, setOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const productData = {
    "Bakery Packing & Baking Products": [
      { name: "Pastry Box and Pastry Placer", href: "/products/pastry-box" },
      { name: "Cake Box, Base and Bag", href: "/products/cake-box" },
    ],
    "Food Takeaway Paper Boxes & Food Serving Paper Trays": [
      { name: "Paper Pizza Box", href: "/products/pizza-box" },
      { name: "Fast Food Boxes", href: "/products/fast-food-boxes" },
    ],
    "Paper Bowl, Container and Cup": [
      { name: "Paper Bowl", href: "/products/paper-bowl" },
      { name: "Paper Cup", href: "/products/paper-cup" },
    ],
    "Paper Bags & Pouches": [
      { name: "Window Paper Bag", href: "/products/window-bag" },
      { name: "Shopping Paper Bag", href: "/products/shopping-bag" },
    ],
    "Corrugated Paper Boxes": [
      { name: "Corrugated Boxes", href: "/products/corrugated-boxes" },
      { name: "Soap Box", href: "/products/soap-box" },
    ],
    "Food Wrapping Paper, Foil & Film": [
      { name: "Food Wrappers", href: "/products/food-wrappers" },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-24 bg-orange-500 text-white border-orange-500 rounded-sm rounded-r-none hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 py-1.5 px-4">
          All
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[980px] lg:w-[900px] min-w-[420px] min-h-[360px] bg-white p-6 rounded-lg shadow-2xl border border-gray-200"
      >
        <DialogTitle className="text-xl font-semibold text-gray-800">
          PACKAGING FOR ALL PURPOSE
        </DialogTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(productData).map(([category, products]) => (
            <Accordion
              key={category}
              type="single"
              collapsible
              onValueChange={(value) =>
                setExpandedItem(value === category ? category : null)
              }
              value={expandedItem === category ? category : ""}
            >
              <AccordionItem value={category} className="border-none">
                <AccordionTrigger
                  className={`w-full text-left px-4 py-3 rounded-sm font-medium text-sm leading-snug transition-colors duration-200
                    ${
                      expandedItem === category
                        ? "bg-gray-200 text-black"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                >
                  {category}
                </AccordionTrigger>
                <AccordionContent className="bg-gray-50 p-4 rounded-b-md border border-t-0 border-gray-200">
                  <ul className="space-y-2">
                    {products.map((product) => (
                      <li key={product.name}>
                        <Link
                          href={product.href}
                          onClick={() => setOpen(false)}
                          className="text-blue-600 hover:text-blue-800 hover:underline block text-sm"
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
