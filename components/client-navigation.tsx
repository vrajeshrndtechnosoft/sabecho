"use client";

import { usePathname } from "next/navigation";
import DynamicNavigation from "@/components/dynamic-navigation";

// Helper function to check if route should hide navigation/footer
const shouldHideNavigation = (pathname: string): boolean => {
  const protectedPaths = ["/admin"];
  return protectedPaths.some((path) => pathname.startsWith(path));
};

export default function ClientNavigation() {
  const pathname = usePathname();
  return !shouldHideNavigation(pathname) && <DynamicNavigation />;
}