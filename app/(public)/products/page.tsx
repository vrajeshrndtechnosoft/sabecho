"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RequirementsForm from "@/components/requirements-form";
import { toast } from "sonner";

interface Product {
  _id: string;
  p_name: string;
  location: string;
  description: string;
  brands: string;
}

interface SubCategory {
  _id: string;
  name: string;
  product: Product[];
  id: number;
}

interface Category {
  _id: string;
  category: string;
  subCategory: SubCategory[];
  id: number;
}

interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
}

interface ProductDisplayProps {
  category?: string;
  subcategory?: string;
  product?: string;
  location?: string;
}

const API_URL = process.env.API_URL || "http://localhost:3033";

const ProductDisplay: React.FC<ProductDisplayProps> = ({ category, subcategory, product, location }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<"categories" | "subcategory" | "product">("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false });

  const getCookie = useCallback((name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }, []);

  const verifyUser = useCallback(async () => {
    const token = getCookie("token");
    if (!token) {
      setAuthState({ isAuthenticated: false });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/verifyToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          isAuthenticated: true,
          userId: user.userId,
          email: user.email,
        });
      } else {
        setAuthState({ isAuthenticated: false });
        toast.error("Session expired. Please log in again.");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      setAuthState({ isAuthenticated: false });
      toast.error("Failed to verify user. Please try again.");
    }
  }, [getCookie]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/categories/all`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data: Category[] = await response.json();
      const enrichedData = data.map((cat) => ({
        ...cat,
        subCategory: cat.subCategory.map((sub) => ({
          ...sub,
          product: sub.product.map((prod) => ({
            ...prod,
            description: `${prod.description || "No description available"}`,
            brands: `${prod.brands || "No brands specified"}`,
          })),
        })),
      }));
      setCategories(enrichedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFavourites = useCallback(
    async (userId: string) => {
      const token = getCookie("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/v1/favorite/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch favorites");
        }
        const data = await response.json();
        setFavourites(data.map((fav: { productId: string }) => fav.productId));
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load favorites. Please try again.");
      }
    },
    [getCookie]
  );

  const handleFavouriteToggle = useCallback(
    async (productId: string, productName: string) => {
      if (!authState.isAuthenticated || !authState.userId || !authState.email) {
        toast.error("Login Required", {
          description: "Please log in to add items to your favorites.",
        });
        return;
      }

      const isFavourited = favourites.includes(productId);
      try {
        const token = getCookie("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`${API_URL}/api/v1/favorite/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: authState.userId,
            productId,
            productName,
            email: authState.email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to toggle favorite");
        }

        setFavourites((prev) =>
          isFavourited ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        toast.success(isFavourited ? "Removed from favorites" : "Added to favorites");
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update favorites. Please try again.");
      }
    },
    [authState.isAuthenticated, authState.userId, authState.email, favourites, getCookie]
  );

  useEffect(() => {
    verifyUser();
    fetchCategories();
  }, [verifyUser, fetchCategories]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.userId) {
      fetchFavourites(authState.userId);
    } else {
      setFavourites([]);
    }
  }, [authState.isAuthenticated, authState.userId, fetchFavourites]);

  useEffect(() => {
    if (categories.length > 0) {
      let initialCategory: Category | undefined;
      let initialSubCategory: SubCategory | undefined;
      let initialActiveCategoryId: string = "";

      if (category) {
        initialCategory = categories.find(
          (cat) => cat.category.toLowerCase() === category.toLowerCase()
        );
        if (initialCategory) {
          initialActiveCategoryId = initialCategory._id;
        }
      }

      if (initialCategory && subcategory) {
        initialSubCategory = initialCategory.subCategory.find(
          (sub) => sub.name.toLowerCase() === subcategory.toLowerCase()
        );
      }

      if (!category) {
        setViewMode("categories");
        setActiveCategory("");
        setSelectedSubCategory(null);
        setSelectedProductName("");
      } else if (product) {
        setViewMode("product");
        setSelectedProductName(product);
        setSelectedSubCategory(initialSubCategory || null);
        setActiveCategory(initialActiveCategoryId);
        if (location) {
          setProductSearch(location);
        }
      } else if (subcategory) {
        setViewMode("subcategory");
        setSelectedSubCategory(initialSubCategory || null);
        setActiveCategory(initialActiveCategoryId);
        setSelectedProductName("");
      } else {
        setViewMode("categories");
        setActiveCategory(initialActiveCategoryId);
        setSelectedSubCategory(null);
        setSelectedProductName("");
      }
    }
  }, [category, subcategory, product, location, categories]);

  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredProducts = selectedSubCategory?.product.filter((prod) =>
    productSearch
      ? prod.p_name.toLowerCase().includes(productSearch.toLowerCase()) ||
        prod.location.toLowerCase().includes(productSearch.toLowerCase())
      : true
  ) || [];

  const handleSubCategoryClick = useCallback(
    (subCategory: SubCategory, categoryName: string) => {
      router.push(`/products/${encodeURIComponent(categoryName)}/${encodeURIComponent(subCategory.name)}`);
      setSelectedSubCategory(subCategory);
      setSelectedProductName("");
      setViewMode("subcategory");
      setProductSearch("");
      setIsSidebarOpen(false);
    },
    [router]
  );

  const handleProductClick = useCallback(
    (product: Product, categoryName: string) => {
      router.push(`/products/${encodeURIComponent(categoryName)}/${encodeURIComponent(selectedSubCategory?.name || "")}/${encodeURIComponent(product.p_name)}`);
      setSelectedProductName(product.p_name);
      setViewMode("product");
      setIsSidebarOpen(false);
    },
    [router, selectedSubCategory]
  );

  const handleBackToCategories = useCallback(() => {
    router.push("/products");
    setViewMode("categories");
    setSelectedSubCategory(null);
    setSelectedProductName("");
    setActiveCategory("");
    setIsSidebarOpen(false);
  }, [router]);

  const handleBackToSubcategory = useCallback(() => {
    if (selectedSubCategory) {
      const categoryName =
        categories.find((cat) =>
          cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
        )?.category || "";
      router.push(`/products/${encodeURIComponent(categoryName)}/${encodeURIComponent(selectedSubCategory.name)}`);
      setViewMode("subcategory");
      setSelectedProductName("");
      setIsSidebarOpen(false);
    }
  }, [router, selectedSubCategory, categories]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="w-48 h-8 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="w-full h-10 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="space-y-4">
              <div className="w-full h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-full h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-full h-6 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="w-48 h-8 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="w-full h-10 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="w-full h-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderCategoryList = () => (
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
                      <button
                        onClick={() => handleSubCategoryClick(sub, cat.category)}
                        className={`flex items-center w-full text-left text-gray-700 hover:text-blue-600 transition-colors mb-1 text-sm md:text-base ${
                          selectedSubCategory?._id === sub._id ? "text-blue-600 font-semibold" : ""
                        }`}
                      >
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        {sub.name} ({sub.product.length})
                      </button>
                      {selectedSubCategory?._id === sub._id && (
                        <div className="ml-4 md:ml-6 space-y-1">
                          {sub.product.map((prod) => (
                            <button
                              key={prod._id}
                              onClick={() => handleProductClick(prod, cat.category)}
                              className={`block w-full text-left text-xs md:text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded ${
                                selectedProductName.toLowerCase() === prod.p_name.toLowerCase()
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              • {prod.p_name}
                            </button>
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
  );

  const renderBreadcrumb = () => (
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
      {selectedProductName && (
        <>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2" />
          <span className="text-gray-900 font-medium">{selectedProductName}</span>
        </>
      )}
    </div>
  );

  const renderCategoriesView = () => (
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
  );

  const renderProductRow = (prod: Product, catName: string) => (
    <tr
      key={prod._id}
      className={`border-b hover:bg-gray-50 ${product === prod.p_name && location === prod.location ? "bg-blue-50" : ""}`}
    >
      <td className="p-2 md:p-3 font-medium text-sm">{prod.p_name}</td>
      <td className="p-2 md:p-3 text-sm">{prod.location}</td>
      <td className="p-2 md:p-3 text-sm">{prod.brands}</td>
      <td className="p-2 md:p-3 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFavouriteToggle(prod._id, prod.p_name)}
          className={`${
            favourites.includes(prod._id)
              ? "text-red-600 border-red-600 hover:bg-red-50"
              : "text-gray-600 border-gray-300 hover:bg-gray-50"
          } h-8 w-8 p-0`}
          aria-label={favourites.includes(prod._id) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${favourites.includes(prod._id) ? "fill-current" : ""}`} />
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
                categorySubType: selectedSubCategory?.name || "",
                name: prod.p_name,
                measurementOptions: ["pieces", "dozens", "boxes"],
                p_name: prod.p_name,
                brand: prod.brands,
              }}
            />
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );

  const renderProductCard = (prod: Product, catName: string) => (
    <div key={prod._id} className="border rounded-lg p-4 bg-white shadow-sm">
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
          <span className="font-medium text-gray-700 text-sm">Description: </span>
          ` <span className="text-sm">{prod.description || "No description available"}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFavouriteToggle(prod._id, prod.p_name)}
            className={`${
              favourites.includes(prod._id)
                ? "text-red-600 border-red-blue-gray-50"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            } h-8 w-8 p-0`}
            aria-label={favourites.includes(prod._id) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${favourites.includes(prod._id) ? "fill-current" : ""}`} />
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
                  categorySubType: selectedSubCategory?.name || "",
                  name: prod.p_name,
                  measurementOptions: ["pieces", "dozens", "boxes"],
                  p_name: prod.p_name,
                  brand: prod.brands,
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );

  const renderSubcategoryView = () => {
    if (!selectedSubCategory) return <div className="p-4 text-gray-500 text-sm text-center">Subcategory not found.</div>;
    return (
      <>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {selectedSubCategory.name} Products
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <Input
            placeholder="Search products or locations..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-3">Product</th>
                <th className="p-3">Location</th>
                <th className="p-3">Description</th>
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
                  return renderProductRow(prod, catName);
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
        <div className="md:hidden space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const catName =
                categories.find((cat) =>
                  cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                )?.category || "";
              return renderProductCard(prod, catName);
            })
          ) : (
            <div className="p-4 text-gray-500 text-sm text-center">
              No products found.
            </div>
          )}
        </div>
      </>
    );
  };

  const renderProductView = () => {
    if (!selectedSubCategory || !selectedProductName) return <div className="p-4 text-gray-500 text-sm text-center">Product not found.</div>;
    const productsWithSameName = selectedSubCategory.product.filter(
      (prod) =>
        prod.p_name.toLowerCase() === selectedProductName.toLowerCase() &&
        (productSearch === "" || prod.location.toLowerCase().includes(productSearch.toLowerCase()))
    );

    return (
      <>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
          {selectedProductName} - All Locations
        </h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <Input
            placeholder="Search locations..."
            value={productSearch}
            onChange={(e => setProductSearch(e.target.value))}
            className="pl-9 h-9 text-sm md:pl-10 md:h-md:text-md border-base border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-p-2 md:p-3">Product Name</th>
                <th className="p-2 p md:p-3">Location</th>
                <th className="p-2 p md:p-3">Description</th>
                <th className="p-2 p-p-md:p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsWithSameName.length > 0 ? (
                productsWithSameName.map((prod) => {
                  const catName =
                    categories.find((cat) =>
                      cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                    )?.category || "";
                  return renderProductRow(prod, catName);
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-2 md:p-3 text-center text-gray-500 text-sm">
                    No locations found for this product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {productsWithSameName.length > 0 ? (
            productsWithSameName.map((prod) => {
              const catName =
                categories.find((cat) =>
                  cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
                )?.category || "";
              return renderProductCard(prod, catName);
            })
          ) : (
            <div className="p-4 text-gray-500 text-sm text-center">
              No locations found for this product.
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="md:min-h flex items-center justify-between mb-4 md:min">
          <h2 className="text-lg font-semibold text-gray-900">Product Categories</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 border-gray-300"
            aria-label={isSidebarOpen ? "Hide categories" : "Show categories"}
          />
            <Menu className="w-5 h-5" />
          </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className={`w-full md:w-1/4 transition-all duration-300 ${
              isSidebarOpen ? "block" : "hidden md:block"} 
            }`}
          >
            {renderCategoryList()}
          </div>
          <div className="w-full md:w-3/4">
            <Card className="shadow-md">
              <CardContent className="p-4 md:p-6">
                {renderBreadcrumb()}
                {viewMode === "categories" && renderCategoriesView()}
                {viewMode === "subcategory" && renderSubcategoryView()}
                {viewMode === "product" && renderProductView()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;