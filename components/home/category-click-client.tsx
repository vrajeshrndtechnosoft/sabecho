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
      className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors bg-transparent"
      onClick={handleCategoryClick}
    >
      View All
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}
