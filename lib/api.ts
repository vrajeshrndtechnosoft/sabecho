/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Product, Category, User, Favorite, Negotiation, AboutUsData } from "@/components/types";

// Server-side base query
export const serverBaseQuery = fetchBaseQuery({
  baseUrl: process.env.BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth?.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("content-type", "application/json");
    return headers;
  },
});

// Client-side base query
const clientBaseQuery = fetchBaseQuery({
  baseUrl: "/api/v1/",
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      if (token) headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery: process.env.SERVER ? serverBaseQuery : clientBaseQuery,
  tagTypes: ["Product", "Category", "User", "Favorite", "Negotiation", "About"],
  endpoints: (builder) => ({
    // Existing endpoints...
    getCategories: builder.query<Category[], void>({
      query: () => "categories",
      providesTags: ["Category"],
    }),
    getCategoryNames: builder.query<string[], void>({
      query: () => "categories/names",
      providesTags: ["Category"],
    }),
    getCategoriesAll: builder.query<Category[], void>({
      query: () => "categories/all",
      providesTags: ["Category"],
    }),
    getProductList: builder.query<Product[], void>({
      query: () => "products/list",
      providesTags: ["Product"],
    }),
    getProducts: builder.query<Product[], string>({
      query: (categoryName) => `products/${categoryName}`,
      providesTags: ["Product"],
    }),
    getProductsDetails: builder.query<Product, string>({
      query: (pid) => `/products/code/${pid}`,
      providesTags: ["Product"],
    }),
    getNavbarData: builder.query<any, void>({
      query: () => "category/navbardata",
    }),
    getMeasurementData: builder.query<any, void>({
      query: () => "measurement/list",
    }),
    getSubcategories: builder.query<any[], string>({
      query: (categoryId) => `categories/${categoryId}/subcategories`,
      providesTags: ["Category"],
    }),
    getUser: builder.query<User, string>({
      query: (email) => `profile?email=${email}`,
      providesTags: ["User"],
    }),
    getFavoritesProduct: builder.query<Favorite[], string>({
      query: (userId) => `/favorite/${userId}`,
      providesTags: ["Favorite"],
    }),
    getFavoritesProductUser: builder.query<Product[], string>({
      query: (userId) => `/favorites/matched/${userId}`,
      providesTags: ["Favorite", "Product"],
    }),
    saveFavorite: builder.mutation<void, { userId?: string; email: string; productName: string }>({
      query: ({ email, productName }) => ({
        url: "favorite/save",
        method: "POST",
        body: { email, productName },
      }),
      invalidatesTags: ["Favorite"],
    }),
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
    createNegotiation: builder.mutation<Negotiation, Partial<Negotiation>>({
      query: (negotiationData) => ({
        url: "negotiation",
        method: "POST",
        body: negotiationData,
      }),
      invalidatesTags: ["Negotiation"],
    }),
    getNegotiations: builder.query<Negotiation[], { status: string; email: string }>({
      query: ({ status, email }) => ({
        url: `negotiations/${status}`,
        params: { email },
      }),
      providesTags: ["Negotiation"],
    }),
    getAllNegotiation: builder.query<Negotiation[], string>({
      query: (status) => `negotiations/${status}`,
      providesTags: ["Negotiation"],
    }),
    getNegotiationForEdit: builder.query<Negotiation, string>({
      query: (id) => `negotiations/${id}/edit`,
      providesTags: ["Negotiation"],
    }),
    gettoSeller: builder.query<any, void>({
      query: () => "toseller",
    }),
    gettoCustomer: builder.query<any, void>({
      query: () => "tocustomer",
    }),

    // About endpoint
    getAboutUs: builder.query<AboutUsData, void>({
      query: () => "about",
      providesTags: ["About"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryNamesQuery,
  useGetCategoriesAllQuery,
  useGetSubcategoriesQuery,
  useGetProductListQuery,
  useGetProductsQuery,
  useGetProductsDetailsQuery,
  useGetNavbarDataQuery,
  useGetMeasurementDataQuery,
  useGetUserQuery,
  useGetFavoritesProductQuery,
  useGetFavoritesProductUserQuery,
  useSaveFavoriteMutation,
  useQuotationMatchMutation,
  useGetOrderDetailsQuery,
  useCreateNegotiationMutation,
  useGetNegotiationsQuery,
  useGetAllNegotiationQuery,
  useGetNegotiationForEditQuery,
  useGettoSellerQuery,
  useGettoCustomerQuery,
  useGetAboutUsQuery,
} = api;