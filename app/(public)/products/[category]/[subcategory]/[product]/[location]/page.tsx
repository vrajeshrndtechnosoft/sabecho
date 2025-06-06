import ProductDisplay from "@/app/(public)/products/page";

export default function ProductPage({ params }: { params: { category: string; subcategory: string; product: string; location:string} }) {
  const { category, subcategory, product, location } = params;
  // Fetch product data based on params
  return (
    <div>
      <ProductDisplay
              category={category}
              subcategory={subcategory}
              product={product}
              location={location}
            />
    </div>
  );
}