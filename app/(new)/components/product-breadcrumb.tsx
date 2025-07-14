"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbItemType = {
  name: string;
  href: string;
  isActive?: boolean;
};

type ProductBreadcrumbProps = {
  items: BreadcrumbItemType[];
};

export function ProductBreadcrumb({ items }: ProductBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.isActive || isLast ? (
                  <BreadcrumbPage className="text-orange-600 font-medium">{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href} className="text-gray-500 hover:text-gray-700">
                    {item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
