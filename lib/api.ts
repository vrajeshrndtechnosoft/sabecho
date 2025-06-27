/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product, Category, User, Favorite, Negotiation } from "@/components/types";

// Function to get token from cookies (you'll need to install js-cookie or use document.cookie)
const getToken = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
  }
  return undefined;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/",
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Category', 'User', 'Favorite', 'Negotiation'],
  endpoints: (builder) => ({
    // Categories
    getCategories: builder.query<Category[], void>({
      query: () => "categories",
      providesTags: ['Category'],
    }),

    getCategoryNames: builder.query<string[], void>({
      query: () => "categories/names",
      providesTags: ['Category'],
    }),

    getCategoriesAll: builder.query<Category[], void>({
      query: () => "categories/all",
      providesTags: ['Category'],
    }),

    // Products
    getProductList: builder.query<Product[], void>({
      query: () => "products/list",
      providesTags: ['Product'],
    }),

    getProducts: builder.query<Product[], string>({
      query: (categoryName) => `products/${categoryName}`,
      providesTags: ['Product'],
    }),

    getProductsDetails: builder.query<Product, string>({
      query: (pid) => `/products/code/${pid}`,
      providesTags: ['Product'],
    }),

    getNavbarData: builder.query<any, void>({
      query: () => "category/navbardata",
    }),

    getMeasurementData: builder.query<any, void>({
      query: () => "measurement/list",
    }),

    getSubcategories: builder.query<any[], string>({
      query: (categoryId) => `categories/${categoryId}/subcategories`,
      providesTags: ['Category'],
    }),

    // User
    getUser: builder.query<User, string>({
      query: (email) => `profile?email=${email}`,
      providesTags: ['User'],
    }),

    // Favorites
    getFavoritesProduct: builder.query<Favorite[], string>({
      query: (userId) => `/favorite/${userId}`,
      providesTags: ['Favorite'],
    }),

    getFavoritesProductUser: builder.query<Product[], string>({
      query: (userId) => `/favorites/matched/${userId}`,
      providesTags: ['Favorite', 'Product'],
    }),

    saveFavorite: builder.mutation<void, { userId?: string; email: string; productName: string }>({
      query: ({ email, productName }) => ({
        url: "favorite/save",
        method: "POST",
        body: { email, productName },
      }),
      invalidatesTags: ['Favorite'],
    }),

    // Quotations
    quotationMatch: builder.mutation<any, { email: string }>({
      query: ({ email }) => ({
        url: "quotation/match/pending",
        method: "POST",
        body: { email },
      }),
    }),

    getOrderDetails: builder.query<any, string>({
      query: (id) => `/quotaRequirement/${id}`,
    }),

    // Negotiations
    createNegotiation: builder.mutation<Negotiation, Partial<Negotiation>>({
      query: (negotiationData) => ({
        url: "negotiation",
        method: "POST",
        body: negotiationData,
      }),
      invalidatesTags: ['Negotiation'],
    }),

    getNegotiations: builder.query<Negotiation[], { status: string; email: string }>({
      query: ({ status, email }) => ({
        url: `negotiations/${status}`,
        params: { email },
      }),
      providesTags: ['Negotiation'],
    }),

    getAllNegotiation: builder.query<Negotiation[], string>({
      query: (status) => `negotiations/${status}`,
      providesTags: ['Negotiation'],
    }),

    getNegotiationForEdit: builder.query<Negotiation, string>({
      query: (id) => `negotiations/${id}/edit`,
      providesTags: ['Negotiation'],
    }),

    // Utility endpoints
    gettoSeller: builder.query<any, void>({
      query: () => "toseller",
    }),

    gettoCustomer: builder.query<any, void>({
      query: () => "tocustomer",
    }),
  }),
});

export const {
  // Categories
  useGetCategoriesQuery,
  useGetCategoryNamesQuery,
  useGetCategoriesAllQuery,
  useGetSubcategoriesQuery,
  
  // Products
  useGetProductListQuery,
  useGetProductsQuery,
  useGetProductsDetailsQuery,
  useGetNavbarDataQuery,
  useGetMeasurementDataQuery,
  
  // User
  useGetUserQuery,
  
  // Favorites
  useGetFavoritesProductQuery,
  useGetFavoritesProductUserQuery,
  useSaveFavoriteMutation,
  
  // Quotations
  useQuotationMatchMutation,
  useGetOrderDetailsQuery,
  
  // Negotiations
  useCreateNegotiationMutation,
  useGetNegotiationsQuery,
  useGetAllNegotiationQuery,
  useGetNegotiationForEditQuery,
  
  // Utility
  useGettoSellerQuery,
  useGettoCustomerQuery,
} = api;