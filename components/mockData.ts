import { Product, Category } from './types'

export const mockSearchData: Product[] = [
  {
    _id: "6662d7ec9faced272e8a6c67",
    location: "vapi",
    categoryType: "Polymers and Packaging",
    categorySubType: "Premium Boxes",
    name: "White Carton Boxes",
  },
  {
    _id: "6662d7ed9faced272e8a6c85",
    location: "vapi",
    categoryType: "Polymers and Packaging",
    categorySubType: "Premium Boxes",
    name: "White Carton Boxes",
  },
]

export const mockCategoriesData: Category[] = [
  {
    _id: "66dd2cafb023f73b61a3133d",
    title: "Mailer Boxes",
    slug: "premium-mail-boxes",
    productNames: ["Premium Mail Boxes", "PrePrinted Mail box"],
    image: {
      url: "/images/fallback-category.jpg",
      altText: "Mail Boxes",
    },
    metaDescription: "Mail boxes",
    keywords: ["Mail Box"],
    createdAt: "2024-09-08T04:48:47.173Z",
    updatedAt: "2024-09-08T04:48:47.173Z",
  },
]
