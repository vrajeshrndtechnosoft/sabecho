import ProductDisplay from "@/app/(public)/products/page";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ 
    category: string; 
  }> 
}) {
  // Await the params object before destructuring
  const { category } = await params;
  
  // Fetch product data based on params
  return (
    <div>
      <ProductDisplay
        category={category}
      />
    </div>
  );
}