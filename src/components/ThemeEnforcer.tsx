"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ThemeEnforcer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    try {
      localStorage.removeItem("agncypay_theme");
      localStorage.removeItem("agncypay_theme_agency");
      localStorage.setItem("theme", "light");
    } catch (_) {}
  }, [pathname]);

  return null;
}
