"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/components/types";

interface CategoryClickClientProps {
  category: Category;
}

export function CategoryClickClient({ category }: CategoryClickClientProps) {
  const router = useRouter();

  const handleCategoryClick = () => {
    router.push(`/products/${category.slug}`);
  };

  return (
    <Button
      variant="outline"
      className="w-full bg-white text-orange-500 border-orange-300 hover:bg-orange-500 hover:text-white transition-colors duration-300 text-sm"
      onClick={handleCategoryClick}
    >
      View All
      <ArrowRight className="w-4 h-4 ml-1 text-orange-500 group-hover:text-white" />
    </Button>
  );
}