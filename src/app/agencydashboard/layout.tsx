"use client";

import React from "react";
import { PortalGuard } from "../../components/auth/PortalGuard";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AgencyDashboardLayout({ children }: LayoutProps) {
  return (
    <PortalGuard role="agency" allowedPaths={["/agencydashboard/invoices", "/agencydashboard/settings"]} canonicalPath="/agencydashboard/invoices">
      {children}
    </PortalGuard>
  );
}
