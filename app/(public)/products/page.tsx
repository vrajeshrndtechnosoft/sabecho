"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Menu, X, Heart } from "lucide-react";
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

interface Favorite {
  _id: string;
  name: string;
  priority: number;
  createdAt: string;
}

interface TokenResponse {
  email: string;
  exp: number;
  iat: number;
  userId: string;
  userType: string;
}

interface ProductDisplayProps {
  category?: string;
  subcategory?: string;
  product?: string;
  location?: string;
  onNavigate?: (category?: string, subcategory?: string, product?: string, location?: string) => void;
}

type ViewMode = "categories" | "subcategory" | "product";

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  category, 
  subcategory, 
  product, 
  location,
  onNavigate 
}) => {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Refs to prevent unnecessary re-renders
  const prevPropsRef = useRef({ category, subcategory, product, location });
  const initializedRef = useRef(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized helper functions
  const normalizeSegment = useCallback((segment: string) => {
    return segment.toLowerCase().replace(/-/g, " ");
  }, []);

  // Memoized favorite check
  const isProductFavorite = useCallback((productName: string) => {
    return favorites.some(fav => normalizeSegment(fav.name) === normalizeSegment(productName));
  }, [favorites, normalizeSegment]);

  // Memoized filtered data
  const filteredCategories = useMemo(() => 
    categories.filter((cat) =>
      cat.category.toLowerCase().includes(categorySearch.toLowerCase())
    ), [categories, categorySearch]
  );

  const filteredProducts = useMemo(() => {
    if (!selectedSubCategory) return [];
    return selectedSubCategory.product.filter((prod) =>
      productSearch
        ? prod.p_name.toLowerCase().includes(productSearch.toLowerCase()) ||
          prod.location.toLowerCase().includes(productSearch.toLowerCase())
        : true
    );
  }, [selectedSubCategory, productSearch]);

  const getCookie = useCallback((name: string): string | null => {
    if (!isClient) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }, [isClient]);

  // Fetch user status and favorites
  useEffect(() => {
    if (!isClient) return;

    const checkUserStatus = async () => {
      try {
        const token = getCookie("token");
        if (!token) {
          return;
        }

        const response = await fetch('/api/v1/auth/verifyToken', { 
          method: 'POST',
          credentials: "include",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });
        
        if (response.ok) {
          const data: TokenResponse = await response.json();
          setIsUserLoggedIn(true);
          setUserEmail(data.email);
          if (data.userId) {
            // Fetch favorites
            const favResponse = await fetch(`/api/v1/favourites/matched/${data.userId}`, { 
              credentials: "include" 
            });
            if (favResponse.ok) {
              const favData: Favorite[] = await favResponse.json();
              setFavorites(favData);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();
  }, [isClient, getCookie]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (product: Product) => {
    if (!isUserLoggedIn || !userEmail) {
      toast.error("Please log in to manage favorites");
      return;
    }

    try {
      const token = getCookie("token");
      if (!token) {
        throw new Error("No token found");
      }
      const decodedToken = JSON.parse(atob(token.split('.')[1])) as TokenResponse;
      const userId = decodedToken.userId;

      const isFavorite = isProductFavorite(product.p_name);
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch('/api/v1/favourites/save', {
        method,
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          productName: product.p_name,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFavorite ? 'remove' : 'add'} favorite`);
      }

      // Fetch updated favorites
      const favResponse = await fetch(`/api/v1/favourites/matched/${userId}`, {
        credentials: "include",
      });
      if (!favResponse.ok) {
        throw new Error("Failed to fetch updated favorites");
      }
      const updatedFavorites: Favorite[] = await favResponse.json();
      setFavorites(updatedFavorites);

      toast.success(`${product.p_name} ${isFavorite ? 'removed from' : 'added to'} favorites`);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error(`Failed to ${isProductFavorite(product.p_name) ? 'remove' : 'add'} ${product.p_name} to favorites`);
    }
  }, [isUserLoggedIn, userEmail, isProductFavorite, getCookie]);

  // Fetch categories (only once)
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/categories/all`, { credentials: "include" });
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
    };

    fetchCategories();
  }, []);

  // Handle URL parameter changes (optimized)
  useEffect(() => {
    const currentProps = { category, subcategory, product, location };
    const prevProps = prevPropsRef.current;
    
    const propsChanged = Object.keys(currentProps).some(
      key => currentProps[key as keyof typeof currentProps] !== prevProps[key as keyof typeof prevProps]
    );

    if (categories.length > 0 && (propsChanged || !initializedRef.current)) {
      prevPropsRef.current = currentProps;
      initializedRef.current = true;

      let initialCategory: Category | undefined;
      let initialSubCategory: SubCategory | undefined;
      let initialActiveCategoryId: string = "";

      if (category) {
        const normalizedCategory = normalizeSegment(category);
        initialCategory = categories.find((cat) => 
          normalizeSegment(cat.category) === normalizedCategory
        );
        if (initialCategory) {
          initialActiveCategoryId = initialCategory._id;
        }
      }

      if (initialCategory && subcategory) {
        const normalizedSubcategory = normalizeSegment(subcategory);
        initialSubCategory = initialCategory.subCategory.find((sub) => 
          normalizeSegment(sub.name) === normalizedSubcategory
        );
      }

      const updates = {
        activeCategory: initialActiveCategoryId,
        selectedSubCategory: initialSubCategory || null,
        selectedProductName: "",
        productSearch: location || "",
        viewMode: "categories" as ViewMode,
      };

      if (!category) {
        Object.assign(updates, {
          viewMode: "categories" as ViewMode,
          activeCategory: "",
          selectedSubCategory: null,
          selectedProductName: "",
          productSearch: "",
        });
      } else if (category && !subcategory) {
        Object.assign(updates, {
          viewMode: "categories" as ViewMode,
          selectedSubCategory: null,
          selectedProductName: "",
          productSearch: "",
        });
      } else if (category && subcategory && !product) {
        Object.assign(updates, {
          viewMode: "subcategory" as ViewMode,
          selectedProductName: "",
        });
      } else if (category && subcategory && product) {
        const normalizedProduct = normalizeSegment(product);
        Object.assign(updates, {
          viewMode: "product" as ViewMode,
          selectedProductName: normalizedProduct,
        });
      }

      setActiveCategory(updates.activeCategory);
      setSelectedSubCategory(updates.selectedSubCategory);
      setSelectedProductName(updates.selectedProductName);
      setProductSearch(updates.productSearch);
      setViewMode(updates.viewMode);
    }
  }, [category, subcategory, product, location, categories, normalizeSegment]);

  // Navigation handlers (modified to use props)
  const handleSubCategoryClick = useCallback((subCategory: SubCategory, categoryName: string) => {
    setSelectedSubCategory(subCategory);
    setSelectedProductName("");
    setViewMode("subcategory");
    setProductSearch("");
    setIsSidebarOpen(false);
    
    // Call parent navigation handler if provided
    if (onNavigate) {
      onNavigate(categoryName, subCategory.name);
    }
  }, [onNavigate]);

  const handleProductClick = useCallback((product: Product, categoryName: string) => {
    setSelectedProductName(product.p_name);
    setViewMode("product");
    setIsSidebarOpen(false);
    
    // Call parent navigation handler if provided
    if (onNavigate) {
      onNavigate(categoryName, selectedSubCategory?.name, product.p_name);
    }
  }, [onNavigate, selectedSubCategory?.name]);

  const handleBackToCategories = useCallback(() => {
    setViewMode("categories");
    setSelectedSubCategory(null);
    setSelectedProductName("");
    setActiveCategory("");
    setProductSearch("");
    setIsSidebarOpen(false);
    
    // Call parent navigation handler if provided
    if (onNavigate) {
      onNavigate();
    }
  }, [onNavigate]);

  const handleBackToSubcategory = useCallback(() => {
    if (selectedSubCategory) {
      const categoryName = categories.find((cat) => 
        cat.subCategory.some((sub) => sub._id === selectedSubCategory._id)
      )?.category || "";
      
      setViewMode("subcategory");
      setSelectedProductName("");
      setProductSearch("");
      setIsSidebarOpen(false);
      
      // Call parent navigation handler if provided
      if (onNavigate) {
        onNavigate(categoryName, selectedSubCategory.name);
      }
    }
  }, [selectedSubCategory, categories, onNavigate]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (category) {
      setActiveCategory(categoryId);
      setViewMode("categories");
      setSelectedSubCategory(null);
      setSelectedProductName("");
      setProductSearch("");
      
      // Call parent navigation handler if provided
      if (onNavigate) {
        onNavigate(category.category);
      }
    }
  }, [categories, onNavigate]);

  // Memoized components
  const CategoryList = useMemo(() => (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Product Categories</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close categories"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <Input
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Accordion type="single" collapsible value={activeCategory} onValueChange={setActiveCategory} className="space-y-1">
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
                      {selectedSubCategory?._id === sub._id && viewMode !== "categories" && (
                        <div className="ml-4 md:ml-6 space-y-1">
                          {sub.product.map((prod) => (
                            <div key={prod._id} className="flex items-center justify-between">
                              <button
                                onClick={() => handleProductClick(prod, cat.category)}
                                className={`flex-1 text-left text-xs md:text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded ${
                                  normalizeSegment(selectedProductName) === normalizeSegment(prod.p_name)
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                • {prod.p_name}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFavoriteToggle(prod)}
                                className={`p-1 ${
                                  isProductFavorite(prod.p_name) 
                                    ? "text-red-500 hover:text-red-600" 
                                    : "text-gray-400 hover:text-gray-500"
                                }`}
                                aria-label={isProductFavorite(prod.p_name) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className="w-4 h-4" fill={isProductFavorite(prod.p_name) ? "currentColor" : "none"} />
                              </Button>
                            </div>
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
  ), [
    categorySearch, 
    activeCategory, 
    filteredCategories, 
    selectedSubCategory, 
    viewMode, 
    selectedProductName, 
    handleSubCategoryClick, 
    handleProductClick, 
    normalizeSegment,
    handleFavoriteToggle,
    isProductFavorite
  ]);

  const Breadcrumb = useMemo(() => (
    <div className="flex items-center text-xs md:text-sm text-gray-600 mb-4 flex-wrap">
      <button onClick={handleBackToCategories} className="hover:text-blue-600 transition-colors">
        Categories
      </button>
      {selectedSubCategory && (
        <>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2" />
          <button onClick={handleBackToSubcategory} className="hover:text-blue-600 transition-colors">
            {selectedSubCategory.name}
          </button>
        </>
      )}
      {selectedProductName && (
        <>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 mx-2" />
          <span className="text-gray-900 font-medium capitalize">
            {selectedProductName.replace(/-/g, " ")}
          </span>
        </>
      )}
    </div>
  ), [selectedSubCategory, selectedProductName, handleBackToCategories, handleBackToSubcategory]);

  const renderCategoriesView = useCallback(() => (
    <>
      <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">All Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <div key={cat._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">{cat.category}</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-3">{cat.subCategory.length} subcategories</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCategoryClick(cat._id)}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs md:text-sm px-3 h-8"
            >
              View Subcategories
            </Button>
          </div>
        ))}
      </div>
    </>
  ), [filteredCategories, handleCategoryClick]);

  const renderProductRow = useCallback((prod: Product, catName: string) => (
    <tr key={prod._id} className={`border-b hover:bg-gray-50 ${
      normalizeSegment(product || "") === normalizeSegment(prod.p_name) && 
      normalizeSegment(location || "") === normalizeSegment(prod.location) 
        ? "bg-blue-50" : ""
    }`}>
      <td className="p-2 md:p-3 font-medium text-sm">{prod.p_name}</td>
      <td className="p-2 md:p-3 text-sm">{prod.location}</td>
      <td className="p-2 md:p-3 text-sm">{prod.description}</td>
      <td className="p-2 md:p-3 flex items-center space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFavoriteToggle(prod)}
          className={`p-1 ${
            isProductFavorite(prod.p_name) 
              ? "text-red-500 hover:text-red-600" 
              : "text-gray-400 hover:text-gray-500"
          }`}
          aria-label={isProductFavorite(prod.p_name) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className="w-4 h-4" fill={isProductFavorite(prod.p_name) ? "currentColor" : "none"} />
        </Button>
      </td>
    </tr>
  ), [product, location, normalizeSegment, selectedSubCategory, handleFavoriteToggle, isProductFavorite]);

  const renderProductCard = useCallback((prod: Product, catName: string) => (
    <div key={prod._id} className={`border rounded-lg p-4 bg-white shadow-sm ${
      normalizeSegment(product || "") === normalizeSegment(prod.p_name) && 
      normalizeSegment(location || "") === normalizeSegment(prod.location) 
        ? "ring-2 ring-blue-200 bg-blue-50" : ""
    }`}>
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
          <span className="text-sm">{prod.description}</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 h-8 text-xs">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFavoriteToggle(prod)}
            className={`p-1 ${
              isProductFavorite(prod.p_name) 
                ? "text-red-500 hover:text-red-600" 
                : "text-gray-400 hover:text-gray-500"
            }`}
            aria-label={isProductFavorite(prod.p_name) ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className="w-4 h-4" fill={isProductFavorite(prod.p_name) ? "currentColor" : "none"} />
        </Button>
        </div>
      </div>
    </div>
  ), [product, location, normalizeSegment, selectedSubCategory, handleFavoriteToggle, isProductFavorite]);

  const renderSubcategoryView = useCallback(() => {
    if (!selectedSubCategory) return <div className="p-4 text-gray-500 text-sm text-center">Subcategory not found.</div>;
    return (
      <>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">{selectedSubCategory.name} Products</h2>
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
                  const catName = categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || "";
                  return renderProductRow(prod, catName);
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500 text-sm">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const catName = categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || "";
              return renderProductCard(prod, catName);
            })
          ) : (
            <div className="p-4 text-gray-500 text-sm text-center">No products found.</div>
          )}
        </div>
      </>
    );
  }, [selectedSubCategory, productSearch, filteredProducts, categories, renderProductRow, renderProductCard]);

  const renderProductView = useCallback(() => {
    if (!selectedSubCategory || !selectedProductName) return <div className="p-4 text-gray-500 text-sm text-center">Product not found.</div>;
    const productsWithSameName = selectedSubCategory.product.filter(
      (prod) => normalizeSegment(prod.p_name) === normalizeSegment(selectedProductName) &&
      (productSearch === "" || prod.location.toLowerCase().includes(productSearch.toLowerCase()))
    );

    return (
      <>
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 capitalize">
          {selectedProductName.replace(/-/g, " ")}
        </h2>
        {location && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              placeholder="Filter by location..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 h-9 text-sm md:pl-10 md:h-10 md:text-base border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
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
              {productsWithSameName.length > 0 ? (
                productsWithSameName.map((prod) => {
                  const catName = categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || "";
                  return renderProductRow(prod, catName);
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500 text-sm">No products found for this name and location.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {productsWithSameName.length > 0 ? (
            productsWithSameName.map((prod) => {
              const catName = categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || "";
              return renderProductCard(prod, catName);
            })
          ) : (
            <div className="p-4 text-gray-500 text-sm text-center">No products found for this name and location.</div>
          )}
        </div>
      </>
    );
  }, [selectedSubCategory, selectedProductName, productSearch, normalizeSegment, categories, renderProductRow, renderProductCard, location]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 bg-white shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-600 hover:text-gray-800"
          aria-label="Open categories menu"
        >
          <Menu className="w-5 h-5" />
          <span className="ml-2 text-sm">Categories</span>
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`${
        isSidebarOpen ? 'fixed inset-0 z-50 bg-black bg-opacity-50 lg:bg-transparent lg:relative lg:inset-auto' : 'hidden'
      } lg:block lg:w-80 lg:flex-shrink-0`}>
        <div className={`${
          isSidebarOpen ? 'absolute left-0 top-0 h-full w-80 bg-white' : ''
        } lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto p-4 lg:p-6`}>
          {CategoryList}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {viewMode !== "categories" && Breadcrumb}
          
          {viewMode === "categories" && renderCategoriesView()}
          {viewMode === "subcategory" && renderSubcategoryView()}
          {viewMode === "product" && renderProductView()}
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDisplay;