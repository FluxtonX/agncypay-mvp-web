"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ThemeEnforcer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const isLanding = pathname === "/";

    if (isLanding) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [pathname]);

  return null;
}
