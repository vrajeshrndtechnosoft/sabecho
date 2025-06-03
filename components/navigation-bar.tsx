'use client';

import { ChevronRight, MapPin, Search, Grid3X3, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

interface Product {
  _id: string;
  p_name: string;
  location: string;
  brand: string;
}

interface SubCategory {
  _id: string;
  name: string;
  product: Product[];
  id: number;
  slug: string;
}

interface Category {
  _id: string;
  category: string;
  subCategory: SubCategory[];
  id: number;
  slug: string;
}

interface NavigationBarProps {
  mobileView: boolean;
}

export default function NavigationBar({ mobileView }: NavigationBarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3033/api/v1/categories/all');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSEOFriendlyURL = (category: string, subCategory?: string, product?: string, location?: string) => {
    const parts = [category, subCategory, product, location].filter(Boolean);
    return `/products/${parts.join('/')}`.toLowerCase().replace(/\s+/g, '-');
  };

  if (isLoading) {
    return (
      <div className={mobileView ? "w-full" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"}>
        {mobileView ? (
          <>
            <div className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center h-16 relative">
              <div className="flex space-x-4 px-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="py-3 px-6 bg-white/10 rounded-md w-32 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mobileView) {
    return (
      <div className="w-full">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} aria-hidden="true" />
          </div>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {categories.map((category) => (
            <AccordionItem key={category._id} value={category.category}>
              <AccordionTrigger className="text-gray-900 font-medium hover:text-blue-600">
                <Link href={generateSEOFriendlyURL(category.category)} className="flex items-center w-full">
                  {category.category}
                </Link>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  <Accordion type="single" collapsible className="space-y-1">
                    {category.subCategory.map((subCat) => (
                      <AccordionItem key={subCat._id} value={subCat.name}>
                        <AccordionTrigger className="text-gray-700 font-medium hover:text-blue-600 text-sm">
                          <Link href={generateSEOFriendlyURL(category.category, subCat.name)} className="flex items-center w-full">
                            {subCat.name} ({subCat.product.length} products)
                          </Link>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 pl-4">
                            <Accordion type="single" collapsible className="space-y-1">
                              {subCat.product
                                .filter(product => product.p_name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((product) => (
                                  <AccordionItem key={product._id} value={product.p_name}>
                                    <AccordionTrigger className="text-gray-700 hover:text-blue-600 text-sm">
                                      {product.p_name}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <Link
                                        href={generateSEOFriendlyURL(category.category, subCat.name, product.p_name, product.location)}
                                        className="flex items-center text-gray-600 text-sm hover:text-blue-600"
                                      >
                                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                        {product.location} - Available now
                                      </Link>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                            </Accordion>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center h-16 relative">
          <div className="flex space-x-4 px-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={generateSEOFriendlyURL(category.category)}
              >
                <button
                  className="py-3 px-4 text-white hover:text-blue-200 transition-colors font-medium"
                  onMouseEnter={() => {
                    setHoveredCategory(category.category);
                    setHoveredSubCategory(null);
                    setHoveredProduct(null);
                  }}
                >
                  {category.category}
                </button>
              </Link>
            ))}
          </div>

          {hoveredCategory && (
            <div
              className="absolute top-16 left-0 right-0 bg-white text-gray-900 shadow-md z-50 rounded-md border-t-2 border-blue-500 m-4"
              onMouseLeave={() => {
                setHoveredCategory(null);
                setHoveredSubCategory(null);
                setHoveredProduct(null);
              }}
            >
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6 min-h-60">
                  {/* Sub Categories Cards */}
                  <div>
                    <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                      <Grid3X3 className="w-6 h-6 mr-2" />
                      Subcategories
                    </h3>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {categories
                        .find((cat) => cat.category === hoveredCategory)
                        ?.subCategory.map((subCat) => (
                          <Link
                            key={subCat._id}
                            href={generateSEOFriendlyURL(hoveredCategory, subCat.name)}
                          >
                            <div
                              className="group cursor-pointer"
                              onMouseEnter={() => {
                                setHoveredSubCategory(subCat.name);
                                setHoveredProduct(null);
                              }}
                            >
                              <div className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-blue-800 text-md">{subCat.name}</h4>
                                    <p className="text-blue-600 text-sm mt-1">
                                      {subCat.product.length} products
                                    </p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>

                  {/* Products Cards */}
                  {hoveredSubCategory && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                        <Package className="w-6 h-6 mr-2" />
                        Products
                      </h3>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {categories
                          .find((cat) => cat.category === hoveredCategory)
                          ?.subCategory.find((sub) => sub.name === hoveredSubCategory)
                          ?.product.map((product) => (
                            <Link
                              key={product._id}
                              href={generateSEOFriendlyURL(hoveredCategory, hoveredSubCategory, product.p_name)}
                            >
                              <div
                                className="group cursor-pointer"
                                onMouseEnter={() => setHoveredProduct(product.p_name)}
                              >
                                <div className="bg-white p-4 rounded-md hover:bg-gray-50 transition-all duration-300 border border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-800 text-md">{product.p_name}</h4>
                                      <p className="text-gray-500 text-sm mt-1">
                                        {[...new Set([product.location])].length} cities
                                      </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Cities Cards */}
                  {hoveredProduct && hoveredSubCategory && (
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-4 text-xl flex items-center">
                        <MapPin className="w-6 h-6 mr-2" />
                        Locations
                      </h3>
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {categories
                          .find((cat) => cat.category === hoveredCategory)
                          ?.subCategory.find((sub) => sub.name === hoveredSubCategory)
                          ?.product.filter((prod) => prod.p_name === hoveredProduct)
                          .map((product) => (
                            <Link
                              key={product._id}
                              href={generateSEOFriendlyURL(hoveredCategory, hoveredSubCategory, hoveredProduct, product.location)}
                            >
                              <div className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition-all duration-300 cursor-pointer">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <MapPin className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800 text-md">{product.location}</h4>
                                    <p className="text-gray-600 text-sm">Available now</p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}