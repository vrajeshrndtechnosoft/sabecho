'use client';

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

interface ProductDisplayProps {
  category?: string;
  subcategory?: string;
  product?: string;
  location?: string;
}

export default function ProductDisplay({ category, subcategory, product, location }: ProductDisplayProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | ''>('');
  const [viewMode, setViewMode] = useState<'categories' | 'subcategory' | 'product'>('categories');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update view when props change (for navigation)
  useEffect(() => {
    if (categories.length > 0) {
      updateViewBasedOnProps();
    }
  }, [category, subcategory, product, location, categories]);

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

  const updateViewBasedOnProps = () => {
    // Find the matching category
    let initialCategory: Category | undefined;
    let initialSubCategory: SubCategory | undefined;
    let initialProduct: Product | undefined;
    let initialActiveCategoryId: string | '' = '';

    // If category prop is provided, find the matching category
    if (category) {
      initialCategory = categories.find((cat: Category) =>
        cat.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase() ||
        cat.category.toLowerCase() === category.toLowerCase()
      );
      if (initialCategory) {
        initialActiveCategoryId = initialCategory._id;
      }
    }

    // If subcategory prop is provided, find the matching subcategory
    if (initialCategory && subcategory) {
      initialSubCategory = initialCategory.subCategory.find((sub: SubCategory) =>
        sub.name.toLowerCase().replace(/\s+/g, '-') === subcategory.toLowerCase() ||
        sub.name.toLowerCase() === subcategory.toLowerCase()
      );
    }

    // If product prop is provided, find the matching product
    if (initialSubCategory && product) {
      const productName = product.replace(/-/g, ' ');
      initialProduct = initialSubCategory.product.find((prod: Product) =>
        prod.p_name.toLowerCase() === productName.toLowerCase()
      );
    }

    // Set the appropriate view based on available props
    if (!category) {
      setViewMode('categories');
      setActiveCategory('');
      setSelectedSubCategory(null);
      setSelectedProduct(null);
      setSelectedProductName('');
    } else if (product) {
      setViewMode('product');
      const productName = product.replace(/-/g, ' ');
      setSelectedProductName(productName);
      setSelectedSubCategory(initialSubCategory || null);
      setActiveCategory(initialActiveCategoryId);
      if (initialProduct) {
        setSelectedProduct(initialProduct);
      }
    } else if (subcategory) {
      setViewMode('subcategory');
      setSelectedSubCategory(initialSubCategory || null);
      setActiveCategory(initialActiveCategoryId);
      setSelectedProduct(null);
      setSelectedProductName('');
    } else {
      setViewMode('categories');
      setActiveCategory(initialActiveCategoryId);
      setSelectedSubCategory(null);
      setSelectedProduct(null);
      setSelectedProductName('');
    }
  };

  const generateSEOFriendlyURL = (cat: string, subCat: string, prod: string, loc: string) => {
    const parts = [cat, subCat, prod, loc]
      .filter(Boolean)
      .map(part => part.toLowerCase().replace(/\s+/g, '-'));
    return `/products/${parts.join('/')}`;
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
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    const subcategorySlug = subCategory.name.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to subcategory URL
    window.history.pushState({}, '', `/products/${categorySlug}/${subcategorySlug}`);
    
    setSelectedSubCategory(subCategory);
    setSelectedProduct(null);
    setSelectedProductName('');
    setViewMode('subcategory');
    setProductSearch('');
  };

  const handleProductClick = (product: Product) => {
    const categoryName = categories.find(cat => 
      cat.subCategory.some(sub => sub._id === selectedSubCategory?._id)
    )?.category || '';
    
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    const subcategorySlug = selectedSubCategory?.name.toLowerCase().replace(/\s+/g, '-') || '';
    const productSlug = product.p_name.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to product URL
    window.history.pushState({}, '', `/products/${categorySlug}/${subcategorySlug}/${productSlug}`);
    
    setSelectedProductName(product.p_name);
    setSelectedProduct(product);
    setViewMode('product');
  };

  const handleBackToCategories = () => {
    window.history.pushState({}, '', '/products');
    setViewMode('categories');
    setSelectedSubCategory(null);
    setSelectedProduct(null);
    setSelectedProductName('');
    setActiveCategory('');
  };

  const handleBackToSubcategory = () => {
    if (selectedSubCategory) {
      const categoryName = categories.find(cat => 
        cat.subCategory.some(sub => sub._id === selectedSubCategory._id)
      )?.category || '';
      
      const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
      const subcategorySlug = selectedSubCategory.name.toLowerCase().replace(/\s+/g, '-');
      
      window.history.pushState({}, '', `/products/${categorySlug}/${subcategorySlug}`);
    }
    
    setViewMode('subcategory');
    setSelectedProduct(null);
    setSelectedProductName('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="w-48 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 flex gap-8">
          <div className="w-1/4 bg-white rounded-lg shadow-md p-6">
            <div className="w-full h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-6 bg-gray-200 rounded"></div>
              <div className="w-full h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-3/4 bg-white rounded-lg shadow-md p-6">
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
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar - Categories */}
        <div className="w-1/4">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h2>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-10 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Accordion type="single" collapsible value={activeCategory} onValueChange={setActiveCategory} className="space-y-2">
                {filteredCategories.map((cat) => (
                  <AccordionItem key={cat._id} value={cat._id}>
                    <AccordionTrigger className="text-gray-900 font-medium hover:text-blue-600">
                      {cat.category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {cat.subCategory.map((sub) => (
                          <div key={sub._id}>
                            <Link
                              key={sub._id}
                              href={generateSEOFriendlyURL(cat.category, sub.name, '', '')}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubCategoryClick(sub, cat.category);
                              }}
                              className={`flex items-center w-full text-left text-gray-700 hover:text-blue-600 transition-colors mb-2 ${
                                selectedSubCategory?._id === sub._id ? 'text-blue-600 font-semibold' : ''
                              }`}
                            >
                              <ChevronRight className="w-4 h-4 mr-2" />
                              {sub.name} ({sub.product.length})
                            </Link>
                            
                            {/* Show products under subcategory */}
                            {selectedSubCategory?._id === sub._id && (
                              <div className="ml-6 space-y-1">
                                {sub.product.map((prod) => (
                                  <Link
                                    key={prod._id}
                                    href={generateSEOFriendlyURL(cat.category, sub.name, prod.p_name, '')}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleProductClick(prod);
                                    }}
                                    className={`block w-full text-left text-sm text-gray-600 hover:text-blue-500 transition-colors py-1 px-2 rounded ${
                                      selectedProductName.toLowerCase() === prod.p_name.toLowerCase() ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
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
        <div className="w-3/4">
          <Card className="shadow-md">
            <CardContent className="p-6">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <button
                  onClick={handleBackToCategories}
                  className="hover:text-blue-600 transition-colors"
                >
                  Categories
                </button>
                {selectedSubCategory && (
                  <>
                    <ChevronRight className="w-4 h-4 mx-2" />
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
                    <ChevronRight className="w-4 h-4 mx-2" />
                    <span className="text-gray-900 font-medium">{selectedProductName}</span>
                  </>
                )}
              </div>

              {/* Categories View */}
              {viewMode === 'categories' && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">All Categories</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((cat) => (
                      <div key={cat._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-gray-900 mb-2">{cat.category}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {cat.subCategory.length} subcategories
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveCategory(cat._id)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          View Subcategories
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Subcategory Products View */}
              {viewMode === 'subcategory' && selectedSubCategory && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedSubCategory.name} Products
                  </h2>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                          <th className="p-3">Product</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((prod) => {
                            const catName = categories.find(cat => cat.subCategory.some(sub => sub._id === selectedSubCategory._id))?.category || '';
                            return (
                              <tr key={prod._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{prod.p_name}</td>
                                <td className="p-3">{prod.location}</td>
                                <td className="p-3">{prod.brand || 'N/A'}</td>
                                <td className="p-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProductClick(prod)}
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50 mr-2"
                                  >
                                    View Details
                                  </Button>
                                  <Link
                                    href={generateSEOFriendlyURL(catName, selectedSubCategory.name, prod.p_name, prod.location)}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                      Go to Page
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={4} className="p-3 text-center text-gray-500">
                              No products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Individual Product View */}
              {viewMode === 'product' && selectedProductName && selectedSubCategory && (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedProductName} - All Locations
                  </h2>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search locations..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 h-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Brand</th>
                          <th className="p-3">Price/Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Get all products with the same name from the current subcategory
                          const productsWithSameName = selectedSubCategory.product
                            .filter((prod) => 
                              prod.p_name.toLowerCase() === selectedProductName.toLowerCase() &&
                              (productSearch === '' || prod.location.toLowerCase().includes(productSearch.toLowerCase()))
                            );
                          
                          return productsWithSameName.length > 0 ? (
                            productsWithSameName.map((prod) => {
                              const catName = categories.find(cat => cat.subCategory.some(sub => sub._id === selectedSubCategory._id))?.category || '';
                              return (
                                <tr key={prod._id} className={`border-b hover:bg-gray-50 ${
                                  location && prod.location.toLowerCase() === location.toLowerCase() ? 'bg-blue-50' : ''
                                }`}>
                                  <td className="p-3 font-medium">{prod.p_name}</td>
                                  <td className="p-3">{prod.location}</td>
                                  <td className="p-3">{prod.brand || 'N/A'}</td>
                                  <td className="p-3">
                                    <Link
                                      href={generateSEOFriendlyURL(catName, selectedSubCategory.name, prod.p_name, prod.location)}
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                      >
                                        View Price
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-3 text-center text-gray-500">
                                No locations found for this product.
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}