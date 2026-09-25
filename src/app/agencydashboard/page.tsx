"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowLeft,
  Coins,
  Layers,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  User,
  LogOut,
  Calendar,
  Lock,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Search,
  Loader2,
  Check,
  X,
  Sun,
  Moon,
  Plus,
  Wallet,
  CreditCard,
  Landmark,
  Zap
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { 
  apiCreatePlaidLinkToken,
  apiExchangePlaidPublicToken,
  apiGetLinkedPlaidAccounts,
  apiDisconnectPlaidAccount,
  apiPlaidSandboxLink,
  apiSimulatePlaidWebhook,
} from "../../lib/api/plaid";
import { 
  subscribeInvoicesByBrand, 
  subscribeInvoicesByAgency, 
  apiUpdateInvoiceStatus as updateInvoiceStatus, 
  apiCreateInvoice as createFirestoreInvoice, 
  apiGetBrands as getRegisteredBrands, 
  apiGetInvoices as getRegisteredTalents, 
  apiGetInvoices as getRegisteredTalentsByAgency,
} from "../../lib/api/invoices";
import { apiRecordDeposit as recordFirestoreDeposit, subscribeFirestoreDepositBalance } from "../../lib/api/treasury";
type FirestoreUser = any;
import { useAccounting } from "../../modules/accounting/hooks/useAccounting";
import { ProviderType } from "../../modules/accounting/types";
import { BanksAndCardsPanel } from "../../components/dashboard/BanksAndCardsPanel";
import { IntegrationsPanel } from "../../components/dashboard/IntegrationsPanel";
import { SyncedInvoicesTable } from "../../components/dashboard/SyncedInvoicesTable";
import { CorporatePayoutTermsCard } from "../../components/dashboard/CorporatePayoutTermsCard";
import { InvoiceFetchingLoader } from "../../components/dashboard/InvoiceFetchingLoader";
import { AppShell } from "../../components/shell/AppShell";
import { MetricCard } from "../../components/data-display/MetricCard";
import { Money } from "../../components/financial/Money";
import { TransactionStatusBadge } from "../../components/financial/TransactionStatusBadge";

// Refactored Data Models
interface SplitItem {
  name: string;
  role: "Talent" | "Agency";
  percentage: number;
  amount: number;
  walletId: string;
  avatar: string;
}

interface VendorItem {
  name: string;
  role: "Vendor";
  amount: number;
  walletId: string;
  avatar: string;
}

interface InvoiceMock {
  id: string;
  campaignName: string;
  brandName: string;
  createdDate: string;
  dueDate: string;
  amount: number;
  vendorFee: VendorItem;
  splitPool: {
    total: number;
    splits: SplitItem[];
  };
  status: "awaiting_approval" | "processing" | "settled" | "rejected" | "talent_disbursed";
  defaultTerm: "Net-30" | "Net-60" | "Net-90";
}

const INITIAL_INVOICES: InvoiceMock[] = [];

const RECENT_TRANSACTIONS: any[] = [];

const getCardImage = (institutionName: string) => {
  const norm = institutionName.toLowerCase();
  if (norm.includes("chase")) return "/chase-ink-business-unlimited.png";
  if (norm.includes("mercury")) return "/mercurycard.png";
  if (norm.includes("bank of america")) return "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
  return undefined;
};

interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  institutionName: string;
  type: string;
  subtype: string;
  availableBalance: number;
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const { currentProvider, connectionStatuses, invoices: crmSyncedInvoices, loading: crmLoading } = useAccounting();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [livePaidVolume, setLivePaidVolume] = useState(0);
  const [liveNet0Funded, setLiveNet0Funded] = useState(0);
  const [liveAutosplitSavings, setLiveAutosplitSavings] = useState(0);

  // Widget invoices state
  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [linkedCards, setLinkedCards] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);
  const [registeredBrands, setRegisteredBrands] = useState<FirestoreUser[]>([]);
  const [registeredTalents, setRegisteredTalents] = useState<FirestoreUser[]>([]);
  const [selectedBrandEmail, setSelectedBrandEmail] = useState("");
  const [selectedTalentEmail, setSelectedTalentEmail] = useState("");

  // Plaid Real Connection State & Handlers
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [webhookToast, setWebhookToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear out legacy mock default accounts
      localStorage.removeItem("agency_plaid_accounts_v3");
      localStorage.removeItem("agency_plaid_accounts");

      const savedRealPlaid = localStorage.getItem("agency_plaid_real_accounts_v4");
      if (savedRealPlaid) {
        try {
          const parsed = JSON.parse(savedRealPlaid);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlaidAccounts(parsed);
          }
        } catch (e) {
          console.error("Error reading saved Plaid accounts", e);
        }
      }

      // Sync with backend API
      apiGetLinkedPlaidAccounts()
        .then((res) => {
          if (res?.accounts && res.accounts.length > 0) {
            const serverAccounts: PlaidAccount[] = res.accounts.map((a: any) => ({
              id: a.id || a.providerExternalAccountId,
              name: a.accountName || `${a.bankName} Checking`,
              mask: a.accountNumberMask || "0000",
              institutionName: a.bankName || "Commercial Bank",
              type: "depository",
              subtype: "checking",
              availableBalance: 50000.00,
            }));
            setPlaidAccounts(serverAccounts);
            localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(serverAccounts));
          }
        })
        .catch(() => {
          // If offline or unauthenticated, maintain empty initial state
        });
    }
  }, []);

  const handleConnectPlaid = async () => {
    setIsPlaidLoading(true);
    setPlaidError(null);

    try {
      // Step 1: Create authentic Plaid Link token via API
      const { linkToken } = await apiCreatePlaidLinkToken();
      if (!linkToken) {
        throw new Error("Unable to initialize Plaid Link session token.");
      }

      // Step 2: Open real Plaid Link UI if loaded in browser
      if (typeof window !== "undefined" && (window as any).Plaid) {
        const handler = (window as any).Plaid.create({
          token: linkToken,
          onSuccess: async (public_token: string, metadata: any) => {
            setIsPlaidLoading(true);
            try {
              const res = await apiExchangePlaidPublicToken(public_token, metadata?.institution);
              const accountsData = res.accounts || [];
              const instName = metadata?.institution?.name || res.bankDetails?.bankName || "Commercial Bank";

              let newItems: PlaidAccount[] = [];
              if (accountsData.length > 0) {
                newItems = accountsData.map((a: any) => ({
                  id: a.accountId || `plaid-${Date.now()}-${a.accountNumberMask}`,
                  name: a.accountName || a.name || `${instName} Checking`,
                  mask: a.accountNumberMask || a.mask || "0000",
                  institutionName: instName,
                  type: a.type || "depository",
                  subtype: a.subtype || "checking",
                  availableBalance: a.availableBalance ?? 50000.00,
                }));
              } else {
                newItems = [
                  {
                    id: `plaid-${Date.now()}`,
                    name: `${instName} Checking`,
                    mask: res.bankDetails?.accountNumber?.slice(-4) || "0000",
                    institutionName: instName,
                    type: "depository",
                    subtype: "checking",
                    availableBalance: 85000.00,
                  }
                ];
              }

              setPlaidAccounts((prev) => {
                const existingIds = new Set(prev.map((p) => p.id));
                const updated = [...prev, ...newItems.filter((item) => !existingIds.has(item.id))];
                if (typeof window !== "undefined") {
                  localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(updated));
                }
                return updated;
              });

              setWebhookToast(`Connected via Plaid Sandbox: ${instName}`);
              setTimeout(() => setWebhookToast(null), 4000);
            } catch (err: any) {
              setPlaidError(err?.message || "Failed to complete Plaid token exchange.");
            } finally {
              setIsPlaidLoading(false);
            }
          },
          onExit: (err: any) => {
            setIsPlaidLoading(false);
            if (err) {
              console.warn("Plaid Link closed:", err);
            }
          },
        });
        handler.open();
      } else {
        // Direct sandbox bridge if Plaid iframe script is blocked or still initializing
        await handleDirectSandboxLink();
      }
    } catch (err: any) {
      console.warn("Falling back to direct Plaid Sandbox API verification:", err);
      await handleDirectSandboxLink();
    } finally {
      setIsPlaidLoading(false);
    }
  };

  const handleDirectSandboxLink = async (institutionId = "ins_3") => {
    setIsPlaidLoading(true);
    setPlaidError(null);
    try {
      const res = await apiPlaidSandboxLink(institutionId);
      const instName = res.bankDetails?.bankName || (institutionId === "ins_1" ? "Bank of America" : "Chase");
      const accountsData = res.accounts || [];

      const newAccounts: PlaidAccount[] = accountsData.map((a: any) => ({
        id: a.accountId || `plaid-sandbox-${Date.now()}-${a.accountNumberMask}`,
        name: a.accountName || a.name || `${instName} Checking`,
        mask: a.accountNumberMask || "0000",
        institutionName: instName,
        type: a.type || "depository",
        subtype: a.subtype || "checking",
        availableBalance: a.availableBalance ?? 50000.00,
      }));

      setPlaidAccounts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const updated = [...prev, ...newAccounts.filter((item) => !existingIds.has(item.id))];
        if (typeof window !== "undefined") {
          localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(updated));
        }
        return updated;
      });

      setWebhookToast(`Plaid Sandbox Bank Connected: ${instName}`);
      setTimeout(() => setWebhookToast(null), 4000);
    } catch (err: any) {
      setPlaidError(err?.message || "Failed to link Plaid sandbox bank.");
    } finally {
      setIsPlaidLoading(false);
    }
  };


  const handleDisconnectPlaidAccount = async (id: string) => {
    try {
      await apiDisconnectPlaidAccount(id);
    } catch (_) {}

    setPlaidAccounts((prev) => {
      const updated = prev.filter((acc) => acc.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("agency_plaid_real_accounts_v4", JSON.stringify(updated));
      }
      return updated;
    });
  };  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const MOCK_BRANDS: FirestoreUser[] = [
        { uid: "b-1", email: "billing@nike.com", fullName: "Nike Brand Team", workspaceName: "Nike Global", accountType: "brand", agencyId: "AG-10001", createdAt: new Date().toISOString() },
        { uid: "b-2", email: "finance@adidas.com", fullName: "Adidas North America", workspaceName: "Adidas Corp", accountType: "brand", agencyId: "AG-10002", createdAt: new Date().toISOString() },
        { uid: "b-3", email: "ap@redbull.com", fullName: "Red Bull Media House", workspaceName: "Red Bull Media", accountType: "brand", agencyId: "AG-10003", createdAt: new Date().toISOString() },
      ];
      const MOCK_TALENTS: FirestoreUser[] = [
        { uid: "t-1", email: "alex.rivas@creator.co", fullName: "Alex Rivas", workspaceName: "Alex Studio", accountType: "talent_independent", agencyId: "AG-20001", createdAt: new Date().toISOString() },
        { uid: "t-2", email: "elena.rostova@talent.io", fullName: "Elena Rostova", workspaceName: "Elena Vlog", accountType: "talent_independent", agencyId: "AG-20002", createdAt: new Date().toISOString() },
        { uid: "t-3", email: "marcus.chen@studio.com", fullName: "Marcus Chen", workspaceName: "Marcus Media", accountType: "talent_independent", agencyId: "AG-20003", createdAt: new Date().toISOString() },
      ];

      let brandsData: any[] = [];
      let talentsData: any[] = [];
      try {
        brandsData = await getRegisteredBrands();
      } catch (_) {}
      try {
        talentsData = await getRegisteredTalents();
      } catch (_) {}

      const brands = brandsData && brandsData.length > 0 ? brandsData : MOCK_BRANDS;
      const talents = talentsData && talentsData.length > 0 ? talentsData : MOCK_TALENTS;

      setRegisteredBrands(brands);
      setRegisteredTalents(talents);
      if (brands.length > 0) setSelectedBrandEmail(brands[0].email);
      if (talents.length > 0) setSelectedTalentEmail(talents[0].email);
    }
    loadData();
  }, [state.user]);


  const [isLightTheme, setIsLightTheme] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("agncypay_theme_agency", "light");
      localStorage.setItem("theme", "light");
      setIsLightTheme(true);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_agency", isLight ? "light" : "dark");
    }
  };

  // New invoice state hooks
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState("");
  const [newTalent, setNewTalent] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDue, setNewDue] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [newSplits, setNewSplits] = useState<{ talentName: string; talentEmail: string; amount: number; status: "pending" | "disbursed" }[]>([]);
  const [splitTalentEmail, setSplitTalentEmail] = useState("");
  const [splitAmount, setSplitAmount] = useState("");

  // Role Guard: Redirect Brand users to /branddashboard
  useEffect(() => {
    if (state.user && state.user.accountType === "brand") {
      router.push("/branddashboard");
    }
  }, [state.user, router]);

  useEffect(() => {
    const userEmail = state.user?.email || "";
    if (!userEmail) return;
    
    const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${userEmail}`);
    if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
    
    const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${userEmail}`);
    if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

    setIsFetchingInvoices(true);

    // Real-time listener for Firestore invoices scoped to the current user's role
    const handleInvoicesUpdate = (invoicesList: any[]) => {
      const mappedList = invoicesList.map((inv) => ({
        id: inv.id,
        agency: inv.agency,
        agencyEmail: inv.agencyEmail || "",
        campaign: inv.campaign,
        talent: inv.talent,
        talentEmail: inv.talentEmail || "",
        brandName: inv.brandName || "",
        dueDate: inv.due,
        amount: inv.amount,
        status: inv.status,
        talentPayoutStatus: inv.talentPayoutStatus,
        payerEmail: inv.payerEmail || "",
        createdDate: inv.createdDate || "",
        createdAt: inv.createdAt
      }));
      setWidgetInvoices(mappedList);
      setIsFetchingInvoices(false);
    };

    // Safety fallback timer to prevent infinite spinner if Firestore array is empty
    const loaderFallbackTimer = setTimeout(() => {
      setIsFetchingInvoices(false);
    }, 1200);

    let unsubscribe = () => {};
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, handleInvoicesUpdate);
    }

    const savedCards = localStorage.getItem(`agncypay_user_cards_${userEmail}`);
    if (savedCards) {
      try {
        setLinkedCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Error loading user cards:", e);
      }
    }



    const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    }

    // Start with empty invoices — they come from Firestore now
    setInvoices([]);

    // Set up a listener for storage events to sync across tabs/logins
    const syncStates = () => {
      const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${userEmail}`);
      if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
      const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${userEmail}`);
      if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

      const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
      if (localNotifs) setNotifications(JSON.parse(localNotifs));
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncAgencyDashboard", syncStates);

    return () => {
      clearTimeout(loaderFallbackTimer);
      unsubscribe();

      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncAgencyDashboard", syncStates);
    };
  }, [state.user]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign || !selectedBrandEmail || !newAmount || !newDue) return;

    setIsCreatingInvoice(true);
    try {
      const activeAgencyName = state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Elite model agency";
      const agencyEmail = state.user?.email || "agency@elite.com";

      const brandUser = registeredBrands.find(b => b.email === selectedBrandEmail);
      const brandName = brandUser ? brandUser.workspaceName : "Adidas Corporate";

      const talentUser = registeredTalents.find(t => t.email === selectedTalentEmail);
      const talentName = talentUser ? talentUser.fullName : "sarah";

      // Build splits array
      let finalSplits = [...newSplits];
      let primaryTalentName = talentName;
      let primaryTalentEmail = selectedTalentEmail;

      if (finalSplits.length === 0) {
        // Fallback for single talent split (85%)
        finalSplits = [{
          talentName: primaryTalentName,
          talentEmail: primaryTalentEmail,
          amount: parseFloat(newAmount) * 0.85,
          status: "pending"
        }];
      } else {
        // Multi-talent splits already populated. Set primary talent as the first split talent.
        primaryTalentName = finalSplits[0].talentName;
        primaryTalentEmail = finalSplits[0].talentEmail;
      }

      // Format YYYY-MM-DD date picker string to "MMM DD, YYYY" for visual uniformity
      let formattedDue = newDue;
      if (newDue.includes("-")) {
        const dateParts = newDue.split("-");
        if (dateParts.length === 3) {
          const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          formattedDue = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
          });
        }
      }

      await createFirestoreInvoice({
        campaign: newCampaign,
        agency: activeAgencyName,
        agencyEmail: agencyEmail,
        talent: primaryTalentName,
        talentEmail: primaryTalentEmail,
        brandName: brandName,
        brandEmail: selectedBrandEmail,
        amount: parseFloat(newAmount),
        due: formattedDue,
        splits: finalSplits
      });
      
      // Close and Reset Form
      setIsNewInvoiceOpen(false);
      setNewCampaign("");
      setNewAmount("");
      setNewDue("");
      setNewSplits([]);
      setSplitTalentEmail("");
      setSplitAmount("");
    } catch (error) {
      console.error("Error creating invoice in Firestore:", error);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const masterIntegrations = [
    { label: "QuickBooks", src: "/quickbook.png" },
    { label: "Xero", src: "/xero.png" },
    { label: "Sage", src: "/sage.png" },
    { label: "NetSuite", src: "/netsuite.png" },
    { label: "Mercury", src: "/mercuryLogo.png" },
  ];

  // Map CRM Synced Invoices into unified invoice model
  const crmMappedInvoices = crmSyncedInvoices.map((inv: any) => {
    const isPaid = inv.status?.toUpperCase() === "PAID" || inv.status?.toUpperCase() === "SETTLED";
    const pLogo = masterIntegrations.find(
      (m) => m.label.toLowerCase() === (inv.providerType || currentProvider || "").toLowerCase()
    )?.src || "/quickbook.png";

    return {
      id: inv.docNumber || inv.id,
      agency: inv.name || "CRM Synced Client",
      agencyEmail: "",
      campaign: inv.detail || `CRM Synced Invoice (${inv.providerType || currentProvider})`,
      talent: "CRM Synced",
      talentEmail: "",
      brandName: inv.name || "Brand Account",
      dueDate: inv.date || "Net-30",
      amount: inv.amount,
      status: isPaid ? "paid" : "pending",
      talentPayoutStatus: isPaid ? "disbursed" : "pending",
      payerEmail: state.user?.email || "",
      isCrmSynced: true,
      providerLogo: pLogo
    };
  });

  // Combined Manual and CRM Synced Invoices
  const combinedAllInvoices = [...widgetInvoices, ...crmMappedInvoices];

  // Derived Pending invoice list
  const pendingInvoices = combinedAllInvoices.filter((inv) => inv.status === "pending");

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("W-INV-001");
  const [selectedTerm, setSelectedTerm] = useState<"Net-30" | "Net-60" | "Net-90">("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);
  const [transactions, setTransactions] = useState(RECENT_TRANSACTIONS);

  // Filter widgetInvoices by role-scoped email
  const userFilteredWidgetInvoices = widgetInvoices.filter((inv) => {
    const userEmail = state.user?.email || "";
    if (workspaceType === "brand") {
      return inv.payerEmail === userEmail;
    } else {
      return inv.agencyEmail === userEmail;
    }
  });

  // Map functional widget invoices into the full UI shape
  const liveFunctionalInvoices: InvoiceMock[] = userFilteredWidgetInvoices.map(inv => {
    // Determine the status equivalent for the UI logic
    let uiStatus: "awaiting_approval" | "settled" | "talent_disbursed" = "awaiting_approval";
    if (inv.status === "paid") {
      uiStatus = inv.talentPayoutStatus === "disbursed" ? "talent_disbursed" : "settled";
    }

    return {
      id: inv.id,
      campaignName: inv.campaign,
      brandName: inv.brandName || "Adidas Corporate",
      createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dueDate: inv.dueDate,
      amount: inv.amount,
      defaultTerm: "Net-30",
      status: uiStatus,
      vendorFee: {
        name: "Processing Fee",
        role: "Vendor",
        amount: inv.amount * 0.1, // Example 10%
        walletId: "@agncypay",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
      },
      splitPool: {
        total: inv.amount * 0.9,
        splits: [
          { name: inv.talent, role: "Talent", percentage: 85, amount: inv.amount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
          { name: inv.agency, role: "Agency", percentage: 15, amount: inv.amount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" }
        ]
      }
    };
  });

  // Combine static fallback and live functional data
  const allInvoices = liveFunctionalInvoices;

  // queueInvoices: role-based filtered list used in the Right Column queue panel
  // We ONLY show live functional invoices in the queue (or all if you want, but functional is preferred)
  const queueInvoices = liveFunctionalInvoices.filter(inv =>
    workspaceType === "brand"
      ? inv.status === "awaiting_approval"
      : inv.status === "settled"
  );

  // Active invoice helper
  // Falls back to first invoice in queue or first overall
  const activeInvoice = allInvoices.find(inv => inv.id === selectedInvoiceId) || queueInvoices[0] || allInvoices[0] || null;

  // Set default term when active invoice changes
  useEffect(() => {
    if (activeInvoice) {
      setSelectedTerm(activeInvoice.defaultTerm);
    }
  }, [selectedInvoiceId, activeInvoice]);

  // Handle Approve & Pay Simulation
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

  const handleApproveAndPay = () => {
    if (!activeInvoice || activeInvoice.status !== "awaiting_approval") return;
    
    setProcessingStage("verifying");
    
    // Stage 1: Verify & Authorize
    setTimeout(() => {
      setProcessingStage("routing");
      
      // Stage 2: Split and Route across nodes
      setTimeout(() => {
        setProcessingStage("success");
        
        // Finalize status update
        setTimeout(async () => {
          try {
            await updateInvoiceStatus(activeInvoice.id, "paid", "pending");
          } catch (err) {
            console.error("Firestore invoice status update error:", err);
          }

          setInvoices(prev => {
            const next = prev.map(inv => 
              inv.id === activeInvoice.id ? { ...inv, status: "settled" as const } : inv
            );
            localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
            return next;
          });

          // Add to dynamic paid stats
          const amt = activeInvoice.amount;
          setLivePaidVolume((v) => {
            const nv = v + amt;
            localStorage.setItem("brand_stats_paid_volume", nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + amt * 0.015;
            localStorage.setItem("brand_stats_autosplit_savings", nv.toString());
            return nv;
          });

          // Generate notification
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand approved & paid main invoice for ${activeInvoice.campaignName} ($${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem("agency_notifications", JSON.stringify(updated));
            return updated;
          });

          // Add to transaction ledger
          const newTx = {
            id: `AP-TX-${Math.floor(1000 + Math.random() * 9000)}`,
            invoiceId: activeInvoice.id,
            campaign: activeInvoice.campaignName,
            date: "Just now",
            total: `$${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: "settled",
            termSelected: instantPayoutEnabled ? "Net-0 (Instant)" : selectedTerm,
            method: "AgncyPay Network"
          };
          setTransactions(prev => [newTx, ...prev]);
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handlePayoutQueueTalent = (id: string) => {
    setProcessingStage("verifying");
    setTimeout(() => {
      setProcessingStage("routing");
      setTimeout(() => {
        setProcessingStage("success");
        setTimeout(() => {
          setInvoices((prev) => {
            const next = prev.map((inv) => (inv.id === id ? { ...inv, status: "talent_disbursed" as any } : inv));
            localStorage.setItem("brand_queue_invoices", JSON.stringify(next));

            const targetInvoice = prev.find((inv) => inv.id === id);
            if (targetInvoice) {
              const talentSplit = targetInvoice.splitPool.splits.find((s) => s.role === "Talent");
              const agencySplit = targetInvoice.splitPool.splits.find((s) => s.role === "Agency");
              
              if (talentSplit && agencySplit) {
                const newNotif = {
                  id: `notif-${Date.now()}`,
                  message: `${agencySplit.name} paid talent ${talentSplit.name} ($${talentSplit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting agency fee ($${agencySplit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
                  timestamp: "Just now",
                  unread: true,
                };
                setNotifications((notifs) => {
                  const updated = [newNotif, ...notifs];
                  localStorage.setItem("agency_notifications", JSON.stringify(updated));
                  return updated;
                });
              }
            }
            return next;
          });
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  if (!mounted) return null;

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Agency Portal • ID: {state.user?.agncyId || "AGNCY-9024"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {state.user?.email || "agency@agncypay.com"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name ||
              (state.user?.fullName ? `${state.user.fullName}'s Agency` : "Agency Revenue Command")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time client billings, talent split distributions, and multi-tier payout rails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewInvoiceOpen(true)}
            className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>
      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Core Approval and Splits */}
        <div className="lg:col-span-8 space-y-6">
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const paidInvoices = liveFunctionalInvoices.filter((i) =>
                workspaceType === "brand"
                  ? i.status === "settled" || i.status === "talent_disbursed"
                  : i.status === "talent_disbursed"
              );
              const dynamicPaidVolume = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
              const displayPaidVolume = dynamicPaidVolume;
              const disbursedVolume = liveFunctionalInvoices
                .filter((i) => i.status === "talent_disbursed")
                .reduce((acc, curr) => acc + curr.amount, 0);

              const awaitingItems =
                workspaceType === "brand"
                  ? liveFunctionalInvoices.filter((i) => i.status === "awaiting_approval")
                  : liveFunctionalInvoices.filter((i) => i.status === "settled");
              const awaitingTotal = awaitingItems.reduce((acc, curr) => acc + curr.amount, 0);
              const awaitingCount = awaitingItems.length;

              return (
                <>
                  <MetricCard
                    title="Total Billed"
                    value={liveFunctionalInvoices.reduce((a, b) => a + b.amount, 0)}
                    isCurrency={true}
                    delta={15.2}
                    icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
                  />
                  <MetricCard
                    title="Pending Revenue"
                    value={awaitingTotal}
                    isCurrency={true}
                    deltaPeriod={`${awaitingCount} pending`}
                    icon={<Clock className="w-4 h-4 text-amber-600" />}
                  />
                  <MetricCard
                    title="Settled to Agency"
                    value={displayPaidVolume}
                    isCurrency={true}
                    icon={<Coins className="w-4 h-4 text-blue-600" />}
                  />
                  <MetricCard
                    title="Talent Disbursements"
                    value={disbursedVolume}
                    isCurrency={true}
                    icon={<Users className="w-4 h-4 text-indigo-600" />}
                  />
                </>
              );
            })()}
          </div>

          {/* Pending Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mt-6">
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/75 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">agncypay</span>
                <span className="text-slate-400 font-medium text-xs">•</span>
                <span className="text-slate-600 font-semibold text-xs">
                  Pending Invoices (Unpaid)
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {isFetchingInvoices ? (
                <InvoiceFetchingLoader title="Loading Pending Invoices" subtitle="Fetching platform and manual ledgers..." count={2} />
              ) : pendingInvoices.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/40">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3 opacity-90" />
                  <p className="text-sm font-bold text-slate-900">No pending invoices</p>
                  <p className="text-xs text-slate-500 mt-1">All campaign ledgers are currently settled.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-4 pl-6 font-semibold">Invoice</th>
                      <th className="py-4 font-semibold">Payer</th>
                      <th className="py-4 font-semibold">Job</th>
                      <th className="py-4 font-semibold">Total</th>
                      <th className="py-4 pr-6 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingInvoices.slice(0, 4).map((inv) => (
                      <tr key={inv.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="py-4 pl-6 text-xs font-mono font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            {inv.isCrmSynced && inv.providerLogo && (
                              <img src={inv.providerLogo} alt="CRM" className="h-3.5 w-3.5 object-contain shrink-0" title="CRM Synced Invoice" />
                            )}
                            <span>#{inv.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-slate-900 max-w-[140px] truncate" title={inv.agency}>
                          {inv.agency}
                        </td>
                        <td className="py-4">
                          <p className="text-slate-800 font-medium">{inv.campaign}</p>
                          <p className="text-[11px] text-slate-500">Due {inv.dueDate}</p>
                        </td>
                        <td className="py-4 font-bold text-slate-900">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/agencydashboard/invoices`)}
                              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                              title="View Invoice Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Awaiting Payer</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {pendingInvoices.length > 4 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => router.push("/agencydashboard/invoices")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>View All ({pendingInvoices.length}) Invoices</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Banner */}
          <div className="mt-6 w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Ready to issue your first invoice?</h3>
              <p className="text-sm text-slate-400 mt-1">Create split invoices, set payment terms, and automatically route payouts to your talent roster.</p>
            </div>
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="shrink-0 h-10 px-5 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span className="text-slate-900">Create Invoice</span>
            </button>
          </div>

          {/* Empty State for Agency */}
          {workspaceType === "agency" && !activeInvoice && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs mt-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">No Invoices Found</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                You haven&apos;t created any invoices yet. Click the &quot;+ New Invoice&quot; button to issue your first split campaign invoice.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Integrations and Ledger */}
        <div id="integrations-ledger-section" className="lg:col-span-4 space-y-6">
          
          {/* Integrations Panel */}
          <IntegrationsPanel />

            {/* Recent Transactions Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 pb-3 border-b border-slate-200">
                Recent Transactions
              </h3>

              <div className="mt-4 space-y-4">
                {(() => {
                  const realTxs = widgetInvoices.filter(inv =>
                    workspaceType === "brand" ? inv.status === "paid" : inv.talentPayoutStatus === "disbursed"
                  );
                  
                  if (realTxs.length === 0) {
                    return (
                      <div className="py-6 text-center text-xs text-slate-400 font-semibold">
                        No recent transactions found
                      </div>
                    );
                  }

                  return realTxs.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-start gap-4 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate leading-tight">{tx.campaign}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span>{workspaceType === "brand" ? "Net-30" : "Net-0 (Instant)"}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{workspaceType === "brand" ? "ACH Direct" : "AgncyPay Wallet"}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
          </div>

          {/* Connected Banking Feeds */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">CONNECTED BANKING FEEDS</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time commercial balances verified via Plaid Sandbox</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnectPlaid}
                  disabled={isPlaidLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isPlaidLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>Connect Bank (Plaid)</span>
                  )}
                </button>
                {plaidAccounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlaidAccounts([]);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("agency_plaid_real_accounts_v4");
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 text-xs font-semibold text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                    title="Clear all connected banks"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {webhookToast && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between px-5 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{webhookToast}</span>
                </div>
                <button onClick={() => setWebhookToast(null)} className="text-emerald-700 hover:opacity-75 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {plaidError && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between px-5 animate-in fade-in">
                <span>{plaidError}</span>
                <button onClick={() => setPlaidError(null)} className="text-red-700 hover:opacity-75 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="p-5 flex flex-col gap-3 bg-white">
              {plaidAccounts.length > 0 ? (
                <>
                  {plaidAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                          {getCardImage(acc.institutionName) ? (
                            <img src={getCardImage(acc.institutionName)!} alt={acc.name} className="h-full w-full object-cover bg-white" />
                          ) : (
                            <Building2 className="h-5 w-5 text-slate-700" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{acc.institutionName} — {acc.name}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5 font-mono">
                            {acc.subtype?.toUpperCase()} ••••{acc.mask}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900 font-mono block">
                            ${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">Available Balance</span>
                        </div>
                        <button
                          onClick={() => handleDisconnectPlaidAccount(acc.id)}
                          title="Disconnect Bank Feed"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-10 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-2xs">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">No Connected Bank Feeds</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
                    No commercial bank accounts are currently linked. Connect your bank via Plaid Sandbox to verify real-time balances and enable automated talent settlement.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      onClick={handleConnectPlaid}
                      disabled={isPlaidLoading}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <span>Connect Bank (Plaid)</span>
                    </button>
                    <button
                      onClick={() => handleDirectSandboxLink("ins_3")}
                      disabled={isPlaidLoading}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>Quick Sandbox Link (Chase)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/agncypaybrand.png" alt="AgncyPay" className={`h-8 w-auto ${isLightTheme ? "[filter:invert(1)_brightness(0.15)]" : ""}`} />
            <p>© 2026 AgncyPay. All rights reserved.</p>
          </div>
          <div className="flex gap-6 font-medium text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Integration Help</a>
            <a href="#" className="hover:text-slate-900 transition-colors">ERP Integration API</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Security Rules</a>
          </div>
        </div>
      </footer>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {isNewInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl relative text-left my-auto text-slate-900"
            >
              <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Create New Invoice
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Issue a campaign split invoice. Payout structures (15% agency, 85% talent) will auto-generate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Brand Socials"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 bg-slate-50 rounded-xl px-4 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Select Brand Client
                  </label>
                  <select
                    required
                    value={selectedBrandEmail}
                    onChange={(e) => setSelectedBrandEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 bg-slate-50 rounded-xl px-4 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                  >
                    {registeredBrands.length === 0 ? (
                      <option value="" disabled>No registered brands found</option>
                    ) : (
                      registeredBrands.map((b, idx) => (
                        <option key={b.id || b.email || idx} value={b.email} className="bg-white text-slate-900">
                          {b.fullName || b.workspaceName || b.email} ({b.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Select Talent (Optional)
                    </label>
                    <select
                      value={selectedTalentEmail}
                      onChange={(e) => setSelectedTalentEmail(e.target.value)}
                      className="mt-1.5 h-11 w-full border border-slate-200 bg-slate-50 rounded-xl px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">Select Talent (Optional)</option>
                      {registeredTalents.map((t, idx) => (
                        <option key={t.id || t.email || idx} value={t.email} className="bg-white text-slate-900">
                          {t.fullName || t.name || t.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Invoice Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 14999.98"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="mt-1.5 h-11 w-full border border-slate-200 bg-slate-50 rounded-xl px-4 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 bg-slate-50 rounded-xl px-4 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex gap-3 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setIsNewInvoiceOpen(false)}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingInvoice}
                    className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isCreatingInvoice ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        Create Invoice
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </AppShell>
  );
}
