import ProductDisplay from "@/app/(public)/products/page";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ 
    category: string; 
    subcategory: string; 
    product: string; 
    location: string;
  }> 
}) {
  // Await the params object before destructuring
  const { category, subcategory, product, location } = await params;
  
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