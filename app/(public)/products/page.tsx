"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronRight, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import RequirementsForm from "@/components/requirements-form";

// Interfaces
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

// Category List Component
const CategoryList: React.FC<{
  categories: Category[];
  categorySearch: string;
  activeCategory: string;
  activeSubCategory: string;
  selectedSubCategory: SubCategory | null;
  viewMode: ViewMode;
  selectedProductName: string;
  isSidebarOpen: boolean;
  onCategorySearch: (value: string) => void;
  onCategoryClick: (categoryId: string) => void;
  onSubCategoryClick: (subCategory: SubCategory, categoryName: string) => void;
  onProductClick: (product: Product, categoryName: string) => void;
  onFavoriteToggle: (product: Product) => void;
  onCloseSidebar: () => void;
  setActiveSubCategory: (value: string) => void;
  isProductFavorite: (productName: string) => boolean;
}> = ({
  categories,
  categorySearch,
  activeCategory,
  activeSubCategory,
  selectedSubCategory,
  selectedProductName,
  onCategorySearch,
  onCategoryClick,
  onSubCategoryClick,
  onProductClick,
  onFavoriteToggle,
  setActiveSubCategory,
  isProductFavorite,
}) => {
  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.category.toLowerCase().includes(categorySearch.toLowerCase())
      ),
    [categories, categorySearch]
  );

  return (
    <Card className="shadow-lg bg-white/90 backdrop-blur-sm border-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Product Categories</h2>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => onCategorySearch(e.target.value)}
            className="pl-10 h-10 text-base border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
          />
        </div>
        <Accordion
          type="single"
          collapsible
          value={activeCategory}
          onValueChange={(value) => onCategoryClick(value || "")}
          className="space-y-3"
        >
          {filteredCategories.map((cat) => (
            <AccordionItem key={cat._id} value={cat._id} className="border-b border-gray-200">
              <AccordionTrigger className="text-gray-900 font-semibold hover:text-blue-600 text-base py-3">
                {cat.category}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion
                  type="single"
                  collapsible
                  value={activeSubCategory}
                  onValueChange={(value) => {
                    const sub = cat.subCategory.find((s) => s._id === value);
                    if (sub) onSubCategoryClick(sub, cat.category);
                    else if (!value) setActiveSubCategory("");
                  }}
                  className="space-y-2 pl-4"
                >
                  {cat.subCategory.map((sub) => (
                    <AccordionItem key={sub._id} value={sub._id} className="border-b border-gray-100">
                      <AccordionTrigger
                        className={`text-gray-700 hover:text-blue-600 text-sm py-2 ${
                          selectedSubCategory?._id === sub._id ? "text-blue-600 font-medium" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          {sub.name} ({sub.product.length})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="ml-6 space-y-2">
                          {sub.product.map((prod) => (
                            <div key={prod._id} className="flex items-center justify-between">
                              <button
                                onClick={() => onProductClick(prod, cat.category)}
                                className={`flex-1 text-left text-sm text-gray-600 hover:text-blue-500 transition-colors py-2 px-3 rounded-md ${
                                  selectedProductName.toLowerCase().replace(/-/g, " ") === prod.p_name.toLowerCase()
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                • {prod.p_name}
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onFavoriteToggle(prod)}
                                className={`p-2 ${
                                  isProductFavorite(prod.p_name)
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-gray-400 hover:text-gray-500"
                                }`}
                                aria-label={isProductFavorite(prod.p_name) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className="w-5 h-5" fill={isProductFavorite(prod.p_name) ? "currentColor" : "none"} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Breadcrumb Component
const Breadcrumb: React.FC<{
  selectedSubCategory: SubCategory | null;
  selectedProductName: string;
  onBackToCategories: () => void;
  onBackToSubcategory: () => void;
}> = ({ selectedSubCategory, selectedProductName, onBackToCategories, onBackToSubcategory }) => (
  <div className="flex items-center text-sm text-gray-600 mb-6 space-x-2">
    <button onClick={onBackToCategories} className="hover:text-blue-600 font-medium transition-colors">
      Categories
    </button>
    {selectedSubCategory && (
      <>
        <ChevronRight className="w-4 h-4" />
        <button onClick={onBackToSubcategory} className="hover:text-blue-600 font-medium transition-colors">
          {selectedSubCategory.name}
        </button>
      </>
    )}
    {selectedProductName && (
      <>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold capitalize">
          {selectedProductName.replace(/-/g, " ")}
        </span>
      </>
    )}
  </div>
);

// Product Row Component
const ProductRow: React.FC<{
  product: Product;
  catName: string;
  isSelected: boolean;
  selectedSubCategory: SubCategory | null;
  onFavoriteToggle: (product: Product) => void;
  isProductFavorite: (productName: string) => boolean;
}> = ({ product, catName, isSelected, selectedSubCategory, onFavoriteToggle, isProductFavorite }) => (
  <tr className={`border-b hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
    <td className="p-3 font-medium text-sm">{product.p_name}</td>
    <td className="p-3 text-sm">{product.location}</td>
    <td className="p-3 text-sm">{product.description}</td>
    <td className="p-3 flex items-center space-x-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 h-9 text-sm">
            Send Inquiry
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md md:max-w-3xl rounded-lg">
          <DialogTitle className="mt-6 px-6">Inquiry for {product.p_name}</DialogTitle>
          <RequirementsForm
            initialProduct={{
              _id: product._id,
              location: product.location,
              categoryType: catName,
              categorySubType: selectedSubCategory?.name || "",
              name: product.p_name,
              measurementOptions: ["pieces", "dozens", "boxes"],
              p_name: product.p_name,
              brand: product.brands,
            }}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFavoriteToggle(product)}
        className={`p-2 ${
          isProductFavorite(product.p_name)
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-gray-500"
        }`}
        aria-label={isProductFavorite(product.p_name) ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className="w-5 h-5" fill={isProductFavorite(product.p_name) ? "currentColor" : "none"} />
      </Button>
    </td>
  </tr>
);

// Product Card Component
const ProductCard: React.FC<{
  product: Product;
  catName: string;
  isSelected: boolean;
  selectedSubCategory: SubCategory | null;
  onFavoriteToggle: (product: Product) => void;
  isProductFavorite: (productName: string) => boolean;
}> = ({ product, catName, isSelected, selectedSubCategory, onFavoriteToggle, isProductFavorite }) => (
  <div className={`border rounded-lg p-4 bg-white shadow-md ${isSelected ? "ring-2 ring-blue-200 bg-blue-50" : "hover:shadow-lg"}`}>
    <div className="space-y-3">
      <div>
        <span className="font-medium text-gray-700 text-sm">Product: </span>
        <span className="text-sm">{product.p_name}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700 text-sm">Location: </span>
        <span className="text-sm">{product.location}</span>
      </div>
      <div>
        <span className="font-medium text-gray-700 text-sm">Description: </span>
        <span className="text-sm">{product.description}</span>
      </div>
      <div className="flex flex-wrap gap-3 pt-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50 h-9 text-sm">
              Send Inquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-[90vw] w-full sm:max-w-md rounded-lg">
            <DialogTitle className="mt-6 px-6">Inquiry for {product.p_name}</DialogTitle>
            <RequirementsForm
              initialProduct={{
                _id: product._id,
                location: product.location,
                categoryType: catName,
                categorySubType: selectedSubCategory?.name || "",
                name: product.p_name,
                measurementOptions: ["pieces", "dozens", "boxes"],
                p_name: product.p_name,
                brand: product.brands,
              }}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFavoriteToggle(product)}
          className={`p-2 ${
            isProductFavorite(product.p_name)
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-gray-500"
          }`}
          aria-label={isProductFavorite(product.p_name) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className="w-5 h-5" fill={isProductFavorite(product.p_name) ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  </div>
);

// Subcategory List Component
const SubcategoryList: React.FC<{
  category: Category;
  onSubCategoryClick: (subCategory: SubCategory, categoryName: string) => void;
}> = ({ category, onSubCategoryClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {category.subCategory.map((sub) => (
      <div key={sub._id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
        <h3 className="font-semibold text-gray-900 text-base mb-3">{sub.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{sub.product.length} products</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSubCategoryClick(sub, category.category)}
          className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-4 h-10"
        >
          View Products
        </Button>
      </div>
    ))}
  </div>
);

// Main ProductDisplay Component
const ProductDisplay: React.FC<ProductDisplayProps> = ({
  category,
  subcategory,
  product,
  location,
  onNavigate,
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
  const [activeSubCategory, setActiveSubCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Refs
  const prevPropsRef = useRef({ category, subcategory, product, location });
  const initializedRef = useRef(false);

  // Utility functions
  const normalizeSegment = useCallback((segment: string) => {
    return segment.toLowerCase().replace(/-/g, " ");
  }, []);

  const isProductFavorite = useCallback(
    (productName: string) => {
      return favorites.some((fav) => normalizeSegment(fav.name) === normalizeSegment(productName));
    },
    [favorites, normalizeSegment]
  );

  const getCookie = useCallback((name: string): string | null => {
    if (!isClient) return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop()?.split(";").shift() || null : null;
  }, [isClient]);

  // Memoized filtered products
  const filteredProducts = useMemo(
    () =>
      selectedSubCategory?.product.filter(
        (prod) =>
          productSearch
            ? prod.p_name.toLowerCase().includes(productSearch.toLowerCase()) ||
              prod.location.toLowerCase().includes(productSearch.toLowerCase())
            : true
      ) || [],
    [selectedSubCategory, productSearch]
  );

  // Fetch user status and favorites
  useEffect(() => {
    setIsClient(true);
    const checkUserStatus = async () => {
      try {
        const token = getCookie("token");
        if (!token) return;

        const response = await fetch("/api/v1/auth/verifyToken", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data: TokenResponse = await response.json();
          setIsUserLoggedIn(true);
          setUserEmail(data.email);
          if (data.userId) {
            const favResponse = await fetch(`/api/v1/favourites/matched/${data.userId}`, {
              credentials: "include",
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
  }, [getCookie]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(
    async (product: Product) => {
      if (!isUserLoggedIn || !userEmail) {
        toast.error("Please log in to manage favorites");
        return;
      }

      try {
        const token = getCookie("token");
        if (!token) throw new Error("No token found");
        const decodedToken = JSON.parse(atob(token.split(".")[1])) as TokenResponse;
        const userId = decodedToken.userId;

        const isFavorite = isProductFavorite(product.p_name);
        const response = await fetch("/api/v1/favourites/save", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            productName: product.p_name,
            userId,
          }),
        });

        if (!response.ok) throw new Error(`Failed to ${isFavorite ? "remove" : "add"} favorite`);

        const favResponse = await fetch(`/api/v1/favourites/matched/${userId}`, {
          credentials: "include",
        });
        if (!favResponse.ok) throw new Error("Failed to fetch updated favorites");
        const updatedFavorites: Favorite[] = await favResponse.json();
        setFavorites(updatedFavorites);

        toast.success(`${product.p_name} ${isFavorite ? "removed from" : "added to"} favorites`);
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast.error(`Failed to ${isProductFavorite(product.p_name) ? "remove" : "add"} ${product.p_name} to favorites`);
      }
    },
    [isUserLoggedIn, userEmail, isProductFavorite, getCookie]
  );

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/v1/categories/all", { credentials: "include" });
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

  // Handle URL parameter changes
  useEffect(() => {
    if (categories.length === 0 || initializedRef.current) return;

    const currentProps = { category, subcategory, product, location };
    const prevProps = prevPropsRef.current;
    const propsChanged = Object.keys(currentProps).some(
      (key) => currentProps[key as keyof typeof currentProps] !== prevProps[key as keyof typeof prevProps]
    );

    if (propsChanged || !initializedRef.current) {
      prevPropsRef.current = currentProps;
      initializedRef.current = true;

      let initialCategory: Category | undefined;
      let initialSubCategory: SubCategory | undefined;
      let initialActiveCategoryId: string = "";
      let initialActiveSubCategoryId: string = "";

      if (category) {
        const normalizedCategory = normalizeSegment(category);
        initialCategory = categories.find((cat) => normalizeSegment(cat.category) === normalizedCategory);
        if (initialCategory) initialActiveCategoryId = initialCategory._id;
      }

      if (initialCategory && subcategory) {
        const normalizedSubcategory = normalizeSegment(subcategory);
        initialSubCategory = initialCategory.subCategory.find(
          (sub) => normalizeSegment(sub.name) === normalizedSubcategory
        );
        if (initialSubCategory) initialActiveSubCategoryId = initialSubCategory._id;
      }

      const updates: {
        activeCategory: string;
        activeSubCategory: string;
        selectedSubCategory: SubCategory | null;
        selectedProductName: string;
        productSearch: string;
        viewMode: ViewMode;
      } = {
        activeCategory: initialActiveCategoryId,
        activeSubCategory: initialActiveSubCategoryId,
        selectedSubCategory: initialSubCategory || null,
        selectedProductName: "",
        productSearch: location || "",
        viewMode: "categories",
      };

      if (!category) {
        Object.assign(updates, {
          viewMode: "categories" as ViewMode,
          activeCategory: "",
          activeSubCategory: "",
          selectedSubCategory: null,
          selectedProductName: "",
          productSearch: "",
        });
      } else if (category && !subcategory) {
        Object.assign(updates, {
          viewMode: "subcategory" as ViewMode,
          selectedSubCategory: null,
          selectedProductName: "",
          productSearch: "",
        });
      } else if (category && subcategory && !product) {
        Object.assign(updates, { viewMode: "subcategory" as ViewMode, selectedProductName: "" });
      } else if (category && subcategory && product) {
        Object.assign(updates, {
          viewMode: "product" as ViewMode,
          selectedProductName: normalizeSegment(product),
        });
      }

      setActiveCategory(updates.activeCategory);
      setActiveSubCategory(updates.activeSubCategory);
      setSelectedSubCategory(updates.selectedSubCategory);
      setSelectedProductName(updates.selectedProductName);
      setProductSearch(updates.productSearch);
      setViewMode(updates.viewMode);
    }
  }, [category, subcategory, product, location, categories, normalizeSegment]);

  // Navigation handlers
  const handleSubCategoryClick = useCallback(
    (subCategory: SubCategory, categoryName: string) => {
      setSelectedSubCategory(subCategory);
      setActiveSubCategory(subCategory._id);
      setSelectedProductName("");
      setViewMode("subcategory");
      setProductSearch("");
      onNavigate?.(categoryName, subCategory.name);
    },
    [onNavigate]
  );

  const handleProductClick = useCallback(
    (product: Product, categoryName: string) => {
      setSelectedProductName(product.p_name);
      setViewMode("product");
      onNavigate?.(categoryName, selectedSubCategory?.name, product.p_name);
    },
    [onNavigate, selectedSubCategory?.name]
  );

  const handleBackToCategories = useCallback(() => {
    setViewMode("categories");
    setSelectedSubCategory(null);
    setSelectedProductName("");
    setActiveCategory("");
    setActiveSubCategory("");
    setProductSearch("");
    onNavigate?.();
  }, [onNavigate]);

  const handleBackToSubcategory = useCallback(() => {
    if (selectedSubCategory) {
      const categoryName =
        categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category || "";
      setViewMode("subcategory");
      setSelectedProductName("");
      setProductSearch("");
      onNavigate?.(categoryName, selectedSubCategory.name);
    }
  }, [selectedSubCategory, categories, onNavigate]);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      const category = categories.find((cat) => cat._id === categoryId);
      if (category) {
        setActiveCategory(categoryId);
        setActiveSubCategory("");
        setViewMode("subcategory");
        setSelectedSubCategory(null);
        setSelectedProductName("");
        setProductSearch("");
        onNavigate?.(category.category);
      } else {
        setActiveCategory("");
        setActiveSubCategory("");
        setViewMode("categories");
        setSelectedSubCategory(null);
        setSelectedProductName("");
        setProductSearch("");
        onNavigate?.();
      }
    },
    [categories, onNavigate]
  );

  // Render views
  const renderCategoriesView = useCallback(
    () => (
      <>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">All Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories
            .filter((cat) => cat.category.toLowerCase().includes(categorySearch.toLowerCase()))
            .map((cat) => (
              <div key={cat._id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                <h3 className="font-semibold text-gray-900 text-base mb-3">{cat.category}</h3>
                <p className="text-sm text-gray-600 mb-4">{cat.subCategory.length} subcategories</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryClick(cat._id)}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-4 h-10"
                >
                  View Subcategories
                </Button>
              </div>
            ))}
        </div>
      </>
    ),
    [categories, categorySearch, handleCategoryClick]
  );

  const renderSubcategoryView = useCallback(() => {
    if (!selectedSubCategory) {
      const selectedCategory = categories.find((cat) => cat._id === activeCategory);
      if (!selectedCategory) return <div className="p-6 text-gray-500 text-sm text-center">Category not found.</div>;
      return (
        <>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{selectedCategory.category} Subcategories</h2>
          <SubcategoryList category={selectedCategory} onSubCategoryClick={handleSubCategoryClick} />
        </>
      );
    }

    return (
      <>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">{selectedSubCategory.name} Products</h2>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search products or locations..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="pl-10 h-10 text-base border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
          />
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-4">Product</th>
                <th className="p-4">Location</th>
                <th className="p-4">Description</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const catName =
                    categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category ||
                    "";
                  return (
                    <ProductRow
                      key={prod._id}
                      product={prod}
                      catName={catName}
                      isSelected={
                        normalizeSegment(product || "") === normalizeSegment(prod.p_name) &&
                        normalizeSegment(location || "") === normalizeSegment(prod.location)
                      }
                      selectedSubCategory={selectedSubCategory}
                      onFavoriteToggle={handleFavoriteToggle}
                      isProductFavorite={isProductFavorite}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const catName =
                categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category ||
                "";
              return (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  catName={catName}
                  isSelected={
                    normalizeSegment(product || "") === normalizeSegment(prod.p_name) &&
                    normalizeSegment(location || "") === normalizeSegment(prod.location)
                  }
                  selectedSubCategory={selectedSubCategory}
                  onFavoriteToggle={handleFavoriteToggle}
                  isProductFavorite={isProductFavorite}
                />
              );
            })
          ) : (
            <div className="p-6 text-gray-500 text-sm text-center">No products found.</div>
          )}
        </div>
      </>
    );
  }, [
    selectedSubCategory,
    activeCategory,
    categories,
    productSearch,
    filteredProducts,
    product,
    location,
    normalizeSegment,
    handleFavoriteToggle,
    isProductFavorite,
    handleSubCategoryClick,
  ]);

  const renderProductView = useCallback(() => {
    if (!selectedSubCategory || !selectedProductName)
      return <div className="p-6 text-gray-500 text-sm text-center">Product not found.</div>;
    const productsWithSameName = selectedSubCategory.product.filter(
      (prod) =>
        normalizeSegment(prod.p_name) === normalizeSegment(selectedProductName) &&
        (productSearch === "" || prod.location.toLowerCase().includes(productSearch.toLowerCase()))
    );

    return (
      <>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 capitalize">
          {selectedProductName.replace(/-/g, " ")}
        </h2>
        {location && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Filter by location..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10 h-10 text-base border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
            />
          </div>
        )}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
                <th className="p-4">Product</th>
                <th className="p-4">Location</th>
                <th className="p-4">Description</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsWithSameName.length > 0 ? (
                productsWithSameName.map((prod) => {
                  const catName =
                    categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category ||
                    "";
                  return (
                    <ProductRow
                      key={prod._id}
                      product={prod}
                      catName={catName}
                      isSelected={
                        normalizeSegment(product || "") === normalizeSegment(prod.p_name) &&
                        normalizeSegment(location || "") === normalizeSegment(prod.location)
                      }
                      selectedSubCategory={selectedSubCategory}
                      onFavoriteToggle={handleFavoriteToggle}
                      isProductFavorite={isProductFavorite}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500 text-sm">No products found for this name and location.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-4">
          {productsWithSameName.length > 0 ? (
            productsWithSameName.map((prod) => {
              const catName =
                categories.find((cat) => cat.subCategory.some((sub) => sub._id === selectedSubCategory._id))?.category ||
                "";
              return (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  catName={catName}
                  isSelected={
                    normalizeSegment(product || "") === normalizeSegment(prod.p_name) &&
                    normalizeSegment(location || "") === normalizeSegment(prod.location)
                  }
                  selectedSubCategory={selectedSubCategory}
                  onFavoriteToggle={handleFavoriteToggle}
                  isProductFavorite={isProductFavorite}
                />
              );
            })
          ) : (
            <div className="p-6 text-gray-500 text-sm text-center">No products found for this name and location.</div>
          )}
        </div>
      </>
    );
  }, [
    selectedSubCategory,
    selectedProductName,
    productSearch,
    normalizeSegment,
    categories,
    product,
    location,
    handleFavoriteToggle,
    isProductFavorite,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 bg-white shadow-sm sticky top-0 z-10">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 flex items-center"
              aria-label="Open categories menu"
            >
              <Menu className="w-6 h-6" />
              <span className="ml-2 text-base font-medium">Categories</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <DialogTitle className="sr-only">Product Categories</DialogTitle>
            <CategoryList
              categories={categories}
              categorySearch={categorySearch}
              activeCategory={activeCategory}
              activeSubCategory={activeSubCategory}
              selectedSubCategory={selectedSubCategory}
              viewMode={viewMode}
              selectedProductName={selectedProductName}
              isSidebarOpen={isSidebarOpen}
              onCategorySearch={setCategorySearch}
              onCategoryClick={handleCategoryClick}
              onSubCategoryClick={handleSubCategoryClick}
              onProductClick={handleProductClick}
              onFavoriteToggle={handleFavoriteToggle}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              setActiveSubCategory={setActiveSubCategory}
              isProductFavorite={isProductFavorite}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
          <CategoryList
            categories={categories}
            categorySearch={categorySearch}
            activeCategory={activeCategory}
            activeSubCategory={activeSubCategory}
            selectedSubCategory={selectedSubCategory}
            viewMode={viewMode}
            selectedProductName={selectedProductName}
            isSidebarOpen={isSidebarOpen}
            onCategorySearch={setCategorySearch}
            onCategoryClick={handleCategoryClick}
            onSubCategoryClick={handleSubCategoryClick}
            onProductClick={handleProductClick}
            onFavoriteToggle={handleFavoriteToggle}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            setActiveSubCategory={setActiveSubCategory}
            isProductFavorite={isProductFavorite}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {viewMode !== "categories" && (
            <Breadcrumb
              selectedSubCategory={selectedSubCategory}
              selectedProductName={selectedProductName}
              onBackToCategories={handleBackToCategories}
              onBackToSubcategory={handleBackToSubcategory}
            />
          )}
          {viewMode === "categories" && renderCategoriesView()}
          {viewMode === "subcategory" && renderSubcategoryView()}
          {viewMode === "product" && renderProductView()}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;