"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";

export function PortalGuard({
  role,
  allowedPaths,
  canonicalPath,
  children,
}: {
  role: "brand" | "agency";
  allowedPaths?: string[];
  canonicalPath?: string;
  children: React.ReactNode;
}) {
  const { state, sessionReady } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const accountType = state.user?.accountType;
  const pathAllowed = !allowedPaths || allowedPaths.includes(pathname);

  useEffect(() => {
    if (!sessionReady) return;
    if (!state.user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (accountType !== role) {
      if (accountType === "brand") router.replace("/branddashboard/invoices");
      else if (accountType === "agency") router.replace("/agencydashboard/invoices");
      else router.replace("/auth/login");
      return;
    }
    if (!pathAllowed && canonicalPath) {
      router.replace(canonicalPath);
    }
  }, [accountType, canonicalPath, pathAllowed, pathname, role, router, sessionReady, state.user]);

  if (!sessionReady || !state.user || accountType !== role || !pathAllowed) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-sm font-semibold text-slate-500">
        Verifying portal access…
      </div>
    );
  }
  return <>{children}</>;
}
