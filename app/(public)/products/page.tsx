"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import RequirementsForm from '@/components/requirements-form';

interface Product {
  _id: string;
  p_name: string;
  location: string;
  description: string;
  brands: string; // Added brands field
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

interface ProductDisplayProps {
  category?: string;
  subcategory?: string;
  product?: string;
  location?: string;
}

export default function ProductDisplay({ category, subcategory, product, location }: ProductDisplayProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string | "">("");
  const [viewMode, setViewMode] = useState<"categories" | "subcategory" | "product">("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const API_URL = process.env.API_URL || "http://localhost:3033"

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      updateViewBasedOnProps();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory, product, location, categories]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/categories/all`);
      const data = await response.json();
      const enrichedData = data.map((cat: Category) => ({
        ...cat,
        subCategory: cat.subCategory.map((sub: SubCategory) => ({
          ...sub,
          product: sub.product.map((prod: Product) => ({
            ...prod,
            description: `High-quality ${prod.p_name} suitable for various applications.`,
            brands: `Brand${Math.floor(Math.random() * 5) + 1}`, // Mock brands field
          })),
        })),
      }));
      setCategories(enrichedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateViewBasedOnProps = () => {
    let initialCategory: Category | undefined;
    let initialSubCategory: SubCategory | undefined;
    let initialProduct: Product | undefined;
    let initialActiveCategoryId: string | "" = "";

    if (category) {
      initialCategory = categories.find((cat: Category) =>
        cat.category.toLowerCase().replace(/\s+/g, "-") === category.toLowerCase() ||
        cat.category.toLowerCase() === category.toLowerCase()
      );
      if (initialCategory) {
        initialActiveCategoryId = initialCategory._id;
      }
    }

    if (initialCategory && subcategory) {
      initialSubCategory = initialCategory.subCategory.find((sub: SubCategory) =>
        sub.name.toLowerCase().replace(/\s+/g, "-") === subcategory.toLowerCase() ||
        sub.name.toLowerCase() === subcategory.toLowerCase()
      );
    }

    if (initialSubCategory && product) {
      const productName = product.replace(/-/g, " ");
      initialProduct = initialSubCategory.product.find((prod: Product) =>
        prod.p_name.toLowerCase() === productName.toLowerCase()
      );
    }

    if (!category) {
      setViewMode("categories");
      setActiveCategory("");
      setSelectedSubCategory(null);
      setSelectedProduct(null);
      setSelectedProductName("");
    } else if (product) {
      setViewMode("product");
      const productName = product.replace(/-/g, " ");
      setSelectedProductName(productName);
      setSelectedSubCategory(initialSubCategory || null);
      setActiveCategory(initialActiveCategoryId);
      if (initialProduct) {
        setSelectedProduct(initialProduct);
      }
    } else if (subcategory) {
      setViewMode("subcategory");
      setSelectedSubCategory(initialSubCategory || null);
      setActiveCategory(initialActiveCategoryId);
      setSelectedProduct(null);
      setSelectedProductName("");
    } else {
      setViewMode("categories");
      setActiveCategory(initialActiveCategoryId);
      setSelectedSubCategory(null);
      setSelectedProduct(null);
      setSelectedProductName("");
    }
  };

  const generateSEOFriendlyURL = (cat: string, subCat: string, prod: string, loc: string) => {
    const parts = [cat, subCat, prod, loc]
      .filter(Boolean)
      .map(part => part.toLowerCase().replace(/\s+/g, "-"));
    return `/products/${parts.join("/")}`;
  };

  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = selectedSubCategory?.product
    .filter((prod) => {
      let matches = true;
      if (productSearch) {
        matches = matches && prod.p_name.toLowerCase().includes(productSearch.toLowerCase());
      }
      return matches;
    }) || [];

  const handleSubCategoryClick = (subCategory: SubCategory, categoryName: string) => {
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
    const subcategorySlug = subCategory.name.toLowerCase().replace(/\s+/g, "-");
    
    window.history.pushState({}, "", `/products/${categorySlug}/${subcategorySlug}`);
    
    setSelectedSubCategory(subCategory);
    setSelectedProduct(null);
    setSelectedProductName("");
    setViewMode("subcategory");
    setProductSearch("");
    setIsSidebarOpen(false);
  };

  const handleProductClick = (product: Product) => {
    const categoryName = categories.find(cat => 
      cat.subCategory.some(sub => sub._id === selectedSubCategory?._id)
    )?.category || "";
    
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
    const subcategorySlug = selectedSubCategory?.name.toLowerCase().replace(/\s+/g, "-") || "";
    const productSlug = product.p_name.toLowerCase().replace(/\s+/g, "-");
    
    window.history.pushState({}, "", `/products/${categorySlug}/${subcategorySlug}/${productSlug}`);
    
    setSelectedProductName(product.p_name);
    setSelectedProduct(product);
    setViewMode("product");
    setIsSidebarOpen(false);
  };

  const handleBackToCategories = () => {
    window.history.pushState({}, "", "/products");
    setViewMode("categories");
    setSelectedSubCategory(null);
    setSelectedProduct(null);
    setSelectedProductName("");
    setActiveCategory("");
    setIsSidebarOpen(false);
  };

  const handleBackToSubcategory = () => {
    if (selectedSubCategory) {
      const categoryName = categories.find(cat => 
        cat.subCategory.some(sub => sub._id === selectedSubCategory._id)
      )?.category || "";
      
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");
      const subcategorySlug = selectedSubCategory.name.toLowerCase().replace(/\s+/g, "-");
      
      window.history.pushState({}, "", `/products/${categorySlug}/${subcategorySlug}`);
    }
    
    setViewMode("subcategory");
    setSelectedProduct(null);
    setSelectedProductName("");
    setIsSidebarOpen(false);
  };

  const toggleFavourite = (productId: string) => {
    setFavourites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="w-48 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="w-full h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="w-48 h-8 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-10 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Product Categories</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 border-gray-300"
            aria-label={isSidebarOpen ? "Hide categories" : "Show categories"}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - Categories */}
          <div
            className={`w-full md:w-1/4 transition-all duration-300 ${
              isSidebarOpen ? "block" : "hidden md:block"
            }`}
          >
            <Card className="shadow-md">
              <CardContent className="p-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 hidden md:block">
                  Product Categories
                </h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Accordion
                  type="single"
                  collapsible
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                  className="space-y-1"
                >
                  {filteredCategories.map((cat) => (
                    <AccordionItem key={cat._id} value={cat._id}>
                      <AccordionTrigger className="text-gray-900 font-medium hover:text-blue-600 text-sm md:text-base py-2">
                        {cat.category}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-3 md:pl-4">
                          {cat.subCategory.map((sub) => (
                            <div key={sub._id}>
                              <Link
                                key={sub._id}
                                href={generateSEOFriendlyURL(cat.category, sub.name, "", "")}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSubCategoryClick(sub, cat.category);
                                }}
                                className={`flex items-center w-full text-left text-gray-700 hover:text-blue-600 transition-colors mb-1 text-sm md:text-base ${
                                  selectedSubCategory?._id === sub._id ? "text-blue-600 font-semibold" : ""
                                }`}
                              >
                                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                {sub.name} ({sub.product.length})
                              </Link>
                              {selectedSubCategory?._id === sub._id && (
                                <div className="ml-4 md:ml-6 space-y-1">
                                  {sub.product.map((prod) => (
                                    <Link
                                      key={prod._id}
                                      href={generateSEOFriendlyURL(cat.category, sub.name, prod.p_name, "")}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleProductClick(prod);
                                      }}
                                      className={`block w-full text-left text-xs md:text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded ${
                                        selectedProductName.toLowerCase() === prod.p_name.toLowerCase()
                                          ? "bg-blue-50 text-blue-600 font-medium"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      • {prod.p_name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="w-full md:w-3/4">
            <Card className="shadow-md">
              <CardContent className="p-4 md:p-6">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center text-xs md:text-sm text-gray-600 mb-4 flex-wrap">
                  <button
                    onClick={handleBackToCategories}
                    className="hover:text-blue-600 transition-colors"
                  >
                    Categories
                  </button>
                  {selectedSubCategory && (
                    <>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2" />
                      <button
                        onClick={handleBackToSubcategory}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {selectedSubCategory.name}
                      </button>
                    </>
                  )}
                  {selectedProduct && (
                    <>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2" />
                      <span className="text-gray-900 font-medium">{selectedProductName}</span>
                    </>
                  )}
                </div>

                {/* Categories View */}
                {viewMode === "categories" && (
                  <>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                      All Categories
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCategories.map((cat) => (
                        <div
                          key={cat._id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">
                            {cat.category}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-3">
                            {cat.subCategory.length} subcategories
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveCategory(cat._id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs md:text-sm px-3 h-8"
                          >
                            View Subcategories
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Subcategory Products View */}
                {viewMode === "subcategory" && selectedSubCategory && (
                  <>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                      {selectedSubCategory.name} Products
                    </h2>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <th className="p-3">Product</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Brands</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((prod) => {
                              const catName =
                                categories.find((cat) =>
                                  cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                                )?.category || "";
                              return (
                                <tr key={prod._id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 text-sm">{prod.p_name}</td>
                                  <td className="p-3 text-sm">{prod.location}</td>
                                  <td className="p-3 text-sm">{prod.brands}</td>
                                  <td className="p-3 flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleFavourite(prod._id)}
                                      className={`${
                                        favourites.includes(prod._id)
                                          ? "text-red-600 border-red-600 hover:bg-red-50"
                                          : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                      } h-8 w-8 p-0`}
                                      aria-label={
                                        favourites.includes(prod._id)
                                          ? "Remove from favourites"
                                          : "Add to favourites"
                                      }
                                    >
                                      <Heart
                                        className={`w-4 h-4 ${
                                          favourites.includes(prod._id) ? "fill-current" : ""
                                        }`}
                                      />
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs"
                                        >
                                          Send Inquiry
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
                                        <DialogTitle className="mt-5 px-5">Inquiry for {prod.p_name}</DialogTitle>
                                        <RequirementsForm
                                          initialProduct={{
                                            _id: prod._id,
                                            location: prod.location,
                                            categoryType: catName,
                                            categorySubType: selectedSubCategory.name,
                                            name: prod.p_name,
                                            measurementOptions: ["pieces", "dozens", "boxes"],
                                            p_name: prod.p_name,
                                            brand: prod.brands
                                          }}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-3 text-center text-gray-500 text-sm">
                                No products found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((prod) => {
                          const catName =
                            categories.find((cat) =>
                              cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                            )?.category || "";
                          return (
                            <div
                              key={prod._id}
                              className="border rounded-lg p-4 bg-white shadow-sm"
                            >
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-gray-700 text-sm">Product: </span>
                                  <span className="text-sm">{prod.p_name}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 text-sm">Location: </span>
                                  <span className="text-sm">{prod.location}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 text-sm">Brands: </span>
                                  <span className="text-sm">{prod.brands}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleFavourite(prod._id)}
                                    className={`${
                                      favourites.includes(prod._id)
                                        ? "text-red-600 border-red-600 hover:bg-red-50"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                    } h-8 w-8 p-0`}
                                    aria-label={
                                      favourites.includes(prod._id)
                                        ? "Remove from favourites"
                                        : "Add to favourites"
                                    }
                                  >
                                    <Heart
                                      className={`w-4 h-4 ${
                                        favourites.includes(prod._id) ? "fill-current" : ""
                                      }`}
                                    />
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs"
                                      >
                                        Send Inquiry
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md rounded-lg">
                                      <DialogTitle className="mt-5 px-5">Inquiry for {prod.p_name}</DialogTitle>
                                      <RequirementsForm
                                      initialProduct={{
                                                    _id: prod._id,
                                                    location: prod.location,
                                                    categoryType: catName,
                                                    categorySubType: selectedSubCategory.name,
                                                    name: prod.p_name,
                                                    measurementOptions: ["pieces", "dozens", "boxes"],
                                                    p_name: prod.p_name,
                                                    brand: prod.brands
                                                }}
                                                />
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-gray-500 text-sm text-center">
                          No products found.
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Individual Product View */}
                {viewMode === "product" && selectedProductName && selectedSubCategory && (
                  <>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                      {selectedProductName} - All Locations
                    </h2>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                      <Input
                        placeholder="Search locations..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <th className="p-2 md:p-3">Product Name</th>
                            <th className="p-2 md:p-3">Location</th>
                            <th className="p-2 md:p-3">Brands</th>
                            <th className="p-2 md:p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const productsWithSameName = selectedSubCategory.product.filter(
                              (prod) =>
                                prod.p_name.toLowerCase() === selectedProductName.toLowerCase() &&
                                (productSearch === "" ||
                                  prod.location.toLowerCase().includes(productSearch.toLowerCase()))
                            );

                            return productsWithSameName.length > 0 ? (
                              productsWithSameName.map((prod) => {
                                const catName =
                                  categories.find((cat) =>
                                    cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                                  )?.category || "";
                                return (
                                  <tr
                                    key={prod._id}
                                    className={`border-b hover:bg-gray-50 ${
                                      location && prod.location.toLowerCase() === location.toLowerCase()
                                        ? "bg-blue-50"
                                        : ""
                                    }`}
                                  >
                                    <td className="p-2 md:p-3 font-medium text-sm">{prod.p_name}</td>
                                    <td className="p-2 md:p-3 text-sm">{prod.location}</td>
                                    <td className="p-2 md:p-3 text-sm">{prod.brands}</td>
                                    <td className="p-2 md:p-3 flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleFavourite(prod._id)}
                                        className={`${
                                          favourites.includes(prod._id)
                                            ? "text-red-600 border-red-600 hover:bg-red-50"
                                            : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                        } h-8 w-8 p-0`}
                                        aria-label={
                                          favourites.includes(prod._id)
                                            ? "Remove from favourites"
                                            : "Add to favourites"
                                        }
                                      >
                                        <Heart
                                          className={`w-4 h-4 ${
                                            favourites.includes(prod._id) ? "fill-current" : ""
                                          }`}
                                        />
                                      </Button>
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs"
                                          >
                                            Send Inquiry
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
                                          <DialogTitle className="mt-5 px-5">Inquiry for {prod.p_name}</DialogTitle>
                                          <RequirementsForm
                                             initialProduct={{
                                            _id: prod._id,
                                            location: prod.location,
                                            categoryType: catName,
                                            categorySubType: selectedSubCategory.name,
                                            name: prod.p_name,
                                            measurementOptions: ["pieces", "dozens", "boxes"],
                                            p_name: prod.p_name,
                                            brand: prod.brands
                                             }}
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="p-2 md:p-3 text-center text-gray-500 text-sm">
                                  No locations found for this product.
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="space-y-3 md:hidden">
                      {(() => {
                        const productsWithSameName = selectedSubCategory.product.filter(
                          (prod) =>
                            prod.p_name.toLowerCase() === selectedProductName.toLowerCase() &&
                            (productSearch === "" ||
                              prod.location.toLowerCase().includes(productSearch.toLowerCase()))
                        );

                        return productsWithSameName.length > 0 ? (
                          productsWithSameName.map((prod) => {
                            const catName =
                              categories.find((cat) =>
                                cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                              )?.category || "";
                            return (
                              <div
                                key={prod._id}
                                className="border rounded-lg p-4 bg-white shadow-sm"
                              >
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium text-gray-700 text-sm">Product Name: </span>
                                    <span className="text-sm">{prod.p_name}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 text-sm">Location: </span>
                                    <span className="text-sm">{prod.location}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 text-sm">Brands: </span>
                                    <span className="text-sm">{prod.brands}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleFavourite(prod._id)}
                                      className={`${
                                        favourites.includes(prod._id)
                                          ? "text-red-600 border-red-600 hover:bg-red-50"
                                          : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                      } h-8 w-8 p-0`}
                                      aria-label={
                                        favourites.includes(prod._id)
                                          ? "Remove from favourites"
                                          : "Add to favourites"
                                      }
                                    >
                                      <Heart
                                        className={`w-4 h-4 ${
                                          favourites.includes(prod._id) ? "fill-current" : ""
                                        }`}
                                      />
                                    </Button>
                                   <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs"
                                      >
                                        Send Inquiry
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md rounded-lg">
                                      <DialogTitle className="mt-5 px-5">Inquiry for {prod.p_name}</DialogTitle>
                                      <RequirementsForm
                                        initialProduct={{
                                            _id: prod._id,
                                            location: prod.location,
                                            categoryType: catName,
                                            categorySubType: selectedSubCategory.name,
                                            name: prod.p_name,
                                            measurementOptions: ["pieces", "dozens", "boxes"],
                                            p_name: prod.p_name,
                                            brand: prod.brands
                                        }}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-gray-500 text-sm text-center">
                            No locations found for this product.
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
