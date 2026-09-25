import { WorkspaceType, Permission } from "../types/workspace";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  requiredPermission?: Permission;
  children?: {
    id: string;
    label: string;
    href: string;
    badge?: string;
    requiredPermission?: Permission;
  }[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: Record<WorkspaceType, NavSection[]> = {
  brand: [
    {
      title: "Finance & Operations",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          href: "/branddashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "invoices",
          label: "Payables & Invoices",
          href: "/invoices",
          iconName: "Receipt",
        },
        {
          id: "payments",
          label: "Payments & Transfers",
          href: "/payments",
          iconName: "ArrowLeftRight",
        },
        {
          id: "vendors",
          label: "Vendors & Creators",
          href: "/creators",
          iconName: "Users",
        },
      ],
    },
    {
      title: "Treasury & Controls",
      items: [
        {
          id: "wallets",
          label: "Treasury & Wallets",
          href: "/wallet",
          iconName: "Wallet",
          requiredPermission: "view_treasury",
        },
        {
          id: "cards",
          label: "Virtual Cards",
          href: "/cards",
          iconName: "CreditCard",
        },
        {
          id: "analytics",
          label: "Financial Analytics",
          href: "/analytics",
          iconName: "BarChart3",
          requiredPermission: "view_reports",
        },
      ],
    },
    {
      title: "Organization",
      items: [
        {
          id: "team",
          label: "Team & Permissions",
          href: "/team",
          iconName: "ShieldCheck",
          requiredPermission: "manage_team",
        },
        {
          id: "settings",
          label: "Company Settings",
          href: "/settings",
          iconName: "Settings",
        },
      ],
    },
  ],

  agency: [
    {
      title: "Agency Operations",
      items: [
        {
          id: "overview",
          label: "Agency Command",
          href: "/agencydashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "talent",
          label: "Talent Roster",
          href: "/agencydashboard/talent",
          iconName: "Users",
          requiredPermission: "manage_talent",
        },
        {
          id: "invoices",
          label: "Client Invoices",
          href: "/agencydashboard/invoices",
          iconName: "Receipt",
        },
        {
          id: "splits",
          label: "Commission Splits",
          href: "/agencydashboard/splits",
          iconName: "PieChart",
          requiredPermission: "view_splits",
        },
        {
          id: "payouts",
          label: "Talent Payouts",
          href: "/agencydashboard/payouts",
          iconName: "ArrowUpRight",
          requiredPermission: "approve_payouts",
        },
      ],
    },
    {
      title: "Financial Infrastructure",
      items: [
        {
          id: "integrations",
          label: "QuickBooks & Xero",
          href: "/agencydashboard/integrations",
          iconName: "Layers",
        },
        {
          id: "treasury",
          label: "Agency Vault",
          href: "/agencydashboard/wallet",
          iconName: "Landmark",
          requiredPermission: "view_treasury",
        },
        {
          id: "settings",
          label: "Agency Settings",
          href: "/agencydashboard/settings",
          iconName: "Settings",
        },
      ],
    },
  ],

  mother_agency: [
    {
      title: "Enterprise Network",
      items: [
        {
          id: "overview",
          label: "Network Command",
          href: "/agencydashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "sub_agencies",
          label: "Sub-Agencies",
          href: "/agencydashboard/talent",
          iconName: "Network",
          requiredPermission: "manage_hierarchy",
        },
        {
          id: "splits",
          label: "Parent-Sub Splits",
          href: "/agencydashboard/splits",
          iconName: "PieChart",
          requiredPermission: "view_splits",
        },
        {
          id: "payouts",
          label: "Multi-Tier Payouts",
          href: "/agencydashboard/payouts",
          iconName: "ArrowUpRight",
          requiredPermission: "approve_payouts",
        },
        {
          id: "settings",
          label: "Network Settings",
          href: "/agencydashboard/settings",
          iconName: "Settings",
        },
      ],
    },
  ],

  talent_agency: [
    {
      title: "Roster Management",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          href: "/agencydashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "talent",
          label: "Assigned Creators",
          href: "/agencydashboard/talent",
          iconName: "Users",
        },
        {
          id: "payouts",
          label: "Payout Requests",
          href: "/agencydashboard/payouts",
          iconName: "ArrowUpRight",
        },
      ],
    },
  ],

  talent_independent: [
    {
      title: "Creator Portal",
      items: [
        {
          id: "overview",
          label: "Earnings & Balance",
          href: "/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          id: "invoices",
          label: "My Invoices",
          href: "/invoices",
          iconName: "Receipt",
        },
        {
          id: "payouts",
          label: "Payout Accounts",
          href: "/settings",
          iconName: "Landmark",
        },
        {
          id: "contracts",
          label: "Brand Contracts",
          href: "/contracts",
          iconName: "FileText",
        },
      ],
    },
  ],
};
