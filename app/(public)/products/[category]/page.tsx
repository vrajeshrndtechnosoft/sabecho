import ProductDisplay from "@/app/(public)/products/page";

export default function ProductPage({ params }: { params: { category: string; subcategory: string; product: string; location:string} }) {
  const { category,  } = params;
  // Fetch product data based on params
  return (
    <div>
      <ProductDisplay
              category={category}
            />
    </div>
  );
}