import { PortalGuard } from "../../components/auth/PortalGuard";

export default function BrandDashboardLayout({ children }: { children: React.ReactNode }) {
  return <PortalGuard role="brand" allowedPaths={["/branddashboard/invoices"]} canonicalPath="/branddashboard/invoices">{children}</PortalGuard>;
}
