"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CreditCard,
  X,
  Plus,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ChevronRight,
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
  Sun,
  Moon,
  Link2,
  Link2Off,
  Plug,
  Wallet,
  Landmark,
  Award,
  Zap,
  Gift,
  Eye
} from "lucide-react";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, apiUpdateInvoiceStatus as updateInvoiceStatus, apiCreateInvoice as createFirestoreInvoice, apiGetBrands as getRegisteredBrands, apiGetInvoices as getRegisteredTalents, apiGetInvoices as getRegisteredTalentsByAgency } from "../../lib/api/invoices";
import { apiRecordDeposit as recordFirestoreDeposit } from "../../lib/api/treasury";
import { useApp } from "../../context/AppContext";
type FirestoreUser = any;
import { BatchPaymentCheckoutModal } from "../../components/payment/BatchPaymentCheckoutModal";
import { IntegrationsPanel } from "../../components/dashboard/IntegrationsPanel";
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

interface PlaidAccount {
  id: string;
  itemId: string;
  institutionName: string;
  name: string;
  officialName?: string;
  mask: string;
  type: string;
  subtype: string;
  availableBalance: number;
  currentBalance: number;
  currency: string;
  connectedAt: string;
}

const getCardImage = (institutionName: string) => {
  const norm = institutionName.toLowerCase();
  if (norm.includes("chase")) return "/chase-ink-business-unlimited.png";
  if (norm.includes("mercury")) return "/mercury-io-cards-3x2.png";
  if (norm.includes("bank of america")) return "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
  return undefined;
};

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

export default function BrandDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [livePaidVolume, setLivePaidVolume] = useState(0);
  const [liveNet0Funded, setLiveNet0Funded] = useState(0);
  const [liveAutosplitSavings, setLiveAutosplitSavings] = useState(0);

  // Widget invoices state
  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isPayingAll, setIsPayingAll] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [payoutingInvoiceId, setPayoutingInvoiceId] = useState<string | null>(null);

  // Embedded Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentRail, setPaymentRail] = useState("ACH");
  const [paymentTerm, setPaymentTerm] = useState("Pay Now");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // QuickBooks / Xero sync status
  const [qbSyncStatus, setQbSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [qbSyncMessage, setQbSyncMessage] = useState("");

  // Deposit Balance & Deposit Modal State (Brand Side) - REMOVED

  const [isLightTheme, setIsLightTheme] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
      if (savedTheme) {
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      } else {
        if (true) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      }
    }
  }, []);

  const [linkedCards, setLinkedCards] = useState([
    {
      id: "card-1",
      name: "Chase Ink Business Unlimited Visa",
      detail: "Visa ****86 • Primary Disbursement",
      image: "/chase-ink-business-unlimited.png",
      fallback: "Chase"
    },
    {
      id: "card-2",
      name: "Mercury Business IO Mastercard",
      detail: "Mastercard ****57 • Instant Settlement",
      image: "/mercurycard.png",
      fallback: "Mercury"
    }
  ]);

  // Plaid Connection State & Handlers
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [connectingBankName, setConnectingBankName] = useState<string | null>(null);

  const availablePlaidBanks = [
    { institutionName: "Bank of America", name: "Corporate Commercial Checking", mask: "3910", balance: 310000.00 },
    { institutionName: "Wells Fargo", name: "Business Treasury Account", mask: "7421", balance: 195400.00 },
    { institutionName: "Silicon Valley Bank", name: "Venture Operating Account", mask: "9912", balance: 450000.00 },
    { institutionName: "Citibank", name: "Commercial Operating Feed", mask: "5521", balance: 220000.00 },
    { institutionName: "Brex Treasury", name: "Corporate Cash Feed", mask: "1184", balance: 380000.00 },
    { institutionName: "Ramp Business", name: "Operating Settlement Account", mask: "6620", balance: 150000.00 },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear out legacy mock default accounts
      localStorage.removeItem("brand_plaid_accounts_v3");
      const savedPlaid = localStorage.getItem("brand_plaid_real_accounts");
      if (savedPlaid) {
        try {
          const parsed = JSON.parse(savedPlaid);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlaidAccounts(parsed);
          }
        } catch (e) {
          console.error("Error loading saved Plaid accounts", e);
        }
      }
    }
  }, []);

  const handleConnectPlaid = () => {
    setIsPlaidModalOpen(true);
  };

  const handleSelectPlaidBank = (bank: typeof availablePlaidBanks[0]) => {
    setConnectingBankName(bank.institutionName);
    setTimeout(() => {
      const newAcc: PlaidAccount = {
        id: `plaid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        itemId: `item-${Date.now()}`,
        institutionName: bank.institutionName,
        name: bank.name,
        mask: bank.mask,
        type: "depository",
        subtype: "checking",
        availableBalance: bank.balance,
        currentBalance: bank.balance,
        currency: "USD",
        connectedAt: new Date().toISOString()
      };
      setPlaidAccounts(prev => {
        const updated = [...prev, newAcc];
        if (typeof window !== "undefined") {
          localStorage.setItem("brand_plaid_accounts_v3", JSON.stringify(updated));
        }
        return updated;
      });
      setConnectingBankName(null);
      setIsPlaidModalOpen(false);
    }, 1200);
  };

  const handleDisconnectPlaidAccount = (id: string) => {
    setPlaidAccounts((prev) => {
      const updated = prev.filter((acc) => acc.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("brand_plaid_accounts_v3", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Treasury Deposit functionality removed

  const fetchQbInvoices = async () => {
    setQbSyncStatus("loading");
    setQbSyncMessage("Syncing QuickBooks...");
    try {
      const res = await fetch("/api/quickbooks/invoices");
      const data = await res.json();
      if (!res.ok) {
        setQbSyncStatus("error");
        setQbSyncMessage(
          data.error === "not_connected"
            ? "Please connect QuickBooks first."
            : "Failed to fetch QuickBooks invoices."
        );
        return;
      }
      
      // Update widgetInvoices state with the new invoices from QB
      setWidgetInvoices(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        const newInvoices = data.invoices.filter((inv: any) => !existingIds.has(inv.id)).map((inv: any) => ({
          ...inv,
          status: inv.status.toLowerCase() === "paid" ? "settled" : "pending"
        }));
        return [...newInvoices, ...prev];
      });
      setQbSyncStatus("success");
      setQbSyncMessage(`Synced ${data.count || 0} invoices!`);
      
      // Reset status after a few seconds
      setTimeout(() => setQbSyncStatus("idle"), 5000);
    } catch (e) {
      setQbSyncStatus("error");
      setQbSyncMessage("Network error fetching QuickBooks invoices.");
    }
  };

  const fetchXeroInvoices = async () => {
    setQbSyncStatus("loading");
    setQbSyncMessage("Syncing Xero...");
    try {
      const res = await fetch("/api/xero/invoices");
      const data = await res.json();
      if (!res.ok) {
        setQbSyncStatus("error");
        setQbSyncMessage(
          data.error === "not_connected"
            ? "Please connect Xero first."
            : "Failed to fetch Xero invoices."
        );
        return;
      }
      
      // Update widgetInvoices state with the new invoices from Xero
      setWidgetInvoices(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        const newInvoices = data.invoices.filter((inv: any) => !existingIds.has(inv.id)).map((inv: any) => ({
          ...inv,
          status: inv.status.toLowerCase() === "paid" ? "settled" : "pending"
        }));
        return [...newInvoices, ...prev];
      });
      setQbSyncStatus("success");
      setQbSyncMessage(`Synced ${data.count || 0} invoices!`);
      
      // Reset status after a few seconds
      setTimeout(() => setQbSyncStatus("idle"), 5000);
    } catch (e) {
      setQbSyncStatus("error");
      setQbSyncMessage("Network error fetching Xero invoices.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const qbConnected = searchParams.get("qb_connected");
      const qbError = searchParams.get("qb_error");
      const xeroConnected = searchParams.get("xero_connected");
      const xeroError = searchParams.get("xero_error");
      
      if (qbConnected === "true") {
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchQbInvoices();
      } else if (qbError) {
        setQbSyncStatus("error");
        setQbSyncMessage(`QuickBooks error: ${qbError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (xeroConnected === "true") {
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchXeroInvoices();
      } else if (xeroError) {
        setQbSyncStatus("error");
        setQbSyncMessage(`Xero error: ${xeroError.replace(/_/g, " ")}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        fetch("/api/auth/status")
          .then(res => res.json())
          .then(data => {
            if (data.quickbooks) {
              fetchQbInvoices();
            } else if (data.xero) {
              fetchXeroInvoices();
            }
          })
          .catch(err => console.error("Failed to check auth status", err));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const selectedInvoicesList = widgetInvoices.filter(i => selectedIds.includes(i.id));
      for (const inv of selectedInvoicesList) {
        if (inv.status === "pending") {
          await updateInvoiceStatus(inv.id, "paid", "pending");
        }
      }
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsSuccess(false);
        setSelectedIds([]);
        window.dispatchEvent(new Event("syncBrandDashboard"));
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };


  const [mounted, setMounted] = useState(false);
  const [registeredBrands, setRegisteredBrands] = useState<FirestoreUser[]>([]);
  const [registeredTalents, setRegisteredTalents] = useState<FirestoreUser[]>([]);
  const [selectedBrandEmail, setSelectedBrandEmail] = useState("");
  const [selectedTalentEmail, setSelectedTalentEmail] = useState("");



  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const brands = await getRegisteredBrands();
      const userEmail = state.user?.email || "";
      const accountType = state.user?.accountType || "agency";
      
      let talents: FirestoreUser[] = [];
      if (accountType === "agency" && userEmail) {
        talents = await getRegisteredTalentsByAgency();
      } else {
        talents = await getRegisteredTalents();
      }
      setRegisteredBrands(brands);
      setRegisteredTalents(talents);
      if (brands.length > 0) setSelectedBrandEmail(brands[0].email);
      if (talents.length > 0) setSelectedTalentEmail(talents[0].email);
    }
    loadData();
  }, [state.user]);



  // Role Guard: Redirect Agency users to /agencydashboard
  useEffect(() => {
    if (state.user && state.user.accountType === "agency") {
      router.push("/agencydashboard");
    }
  }, [state.user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_brand");
      if (savedTheme) {
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      } else {
        if (true) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      }
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
      localStorage.setItem("agncypay_theme_brand", isLight ? "light" : "dark");
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



  useEffect(() => {
    const userEmail = state.user?.email || "";
    if (!userEmail) return;
    
    const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${userEmail}`);
    if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
    
    const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${userEmail}`);
    if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

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
    };

    subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);

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
    window.addEventListener("syncBrandDashboard", syncStates);

    return () => {
      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncBrandDashboard", syncStates);
    };
  }, [state.user]);

  const handlePayInvoice = (id: string) => {
    const userEmail = state.user?.email || "";
    setPayingInvoiceId(id);
    setTimeout(() => {
      setWidgetInvoices((prev) => {
        const next = prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv));
        localStorage.setItem(`brand_widget_invoices_${userEmail}`, JSON.stringify(next));
        
        const paidInvoice = prev.find((inv) => inv.id === id);
        if (paidInvoice) {
          const amt = paidInvoice.amount;
          setLivePaidVolume((v) => {
            const nv = v + amt;
            localStorage.setItem(`brand_stats_paid_volume_${userEmail}`, nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + amt * 0.015;
            localStorage.setItem(`brand_stats_autosplit_savings_${userEmail}`, nv.toString());
            return nv;
          });

          // Add notification
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand paid invoice to ${paidInvoice.agency} ($${paidInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${paidInvoice.campaign}`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify(updated));
            return updated;
          });
        }
        return next;
      });
      setPayingInvoiceId(null);
      window.dispatchEvent(new Event("syncBrandDashboard"));
    }, 1500);
  };

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
        agencyName: activeAgencyName,
        agencyEmail: agencyEmail,
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

  const handlePayAll = async () => {
    const userEmail = state.user?.email || "";
    setIsPayingAll(true);
    setProcessingStage("verifying");

    setTimeout(async () => {
      setProcessingStage("routing");
      try {
        const unpaid = widgetInvoices.filter((inv) => inv.status === "pending");
        const totalPaid = unpaid.reduce((sum, inv) => sum + inv.amount, 0);

        // Perform updates in Firestore
        for (const inv of unpaid) {
          await updateInvoiceStatus(inv.id, "paid", "pending");
        }

        if (totalPaid > 0) {
          setLivePaidVolume((v) => {
            const nv = v + totalPaid;
            localStorage.setItem(`brand_stats_paid_volume_${userEmail}`, nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + totalPaid * 0.015;
            localStorage.setItem(`brand_stats_autosplit_savings_${userEmail}`, nv.toString());
            return nv;
          });

          // Add notifications to localStorage
          const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotifs = unpaid.map((inv, idx) => ({
            id: `notif-${Date.now()}-${idx}`,
            message: `Brand paid invoice to ${inv.agency} ($${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${inv.campaign}`,
            timestamp: "Just now",
            unread: true,
          }));
          localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify([...newNotifs, ...notifs]));
        }

        // Show success state
        setProcessingStage("success");
        setTimeout(() => {
          setIsPayingAll(false);
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncBrandDashboard"));
        }, 1800);
      } catch (e) {
        console.error("Error paying all invoices in Firestore:", e);
        setIsPayingAll(false);
        setProcessingStage("idle");
      }
    }, 1200);
  };

  const handlePayoutTalent = (id: string) => {
    setPayoutingInvoiceId(id);
    setTimeout(() => {
      setWidgetInvoices((prev) => {
        const next = prev.map((inv) => (inv.id === id ? { ...inv, talentPayoutStatus: "disbursed" } : inv));
        localStorage.setItem("brand_widget_invoices", JSON.stringify(next));

        const targetInvoice = prev.find((inv) => inv.id === id);
        if (targetInvoice) {
          const totalAmount = targetInvoice.amount;
          const agencyFee = totalAmount * 0.15;
          const talentPayout = totalAmount - agencyFee;

          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `${targetInvoice.agency} paid talent ${targetInvoice.talent} ($${talentPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting 15% agency fee ($${agencyFee.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem("agency_notifications", JSON.stringify(updated));
            return updated;
          });
        }
        return next;
      });
      setPayoutingInvoiceId(null);
      window.dispatchEvent(new Event("syncBrandDashboard"));
    }, 1500);
  };

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
        setTimeout(() => {
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ID: {state.user?.activeWorkspaceId || state.user?.agncyId || "WS-2026-Q3"}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {state.user?.email || "adidas.admin@company.com"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {state.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name ||
              (state.user?.fullName ? `${state.user.fullName}'s Workspace` : "Adidas Workspace")}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Commercial payables, multi-split settlement engine, and connected banking feeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {workspaceType === "agency" && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Core Approval and Splits */}
        <div className="lg:col-span-8 space-y-6">
          {/* Analytics Cards Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${workspaceType === "brand" ? "md:grid-cols-2" : "md:grid-cols-4"} gap-4`}>
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

              if (workspaceType === "brand") {
                return (
                  <>
                    <MetricCard
                      title="Total Paid Volume"
                      value={displayPaidVolume}
                      isCurrency={true}
                      icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
                    />
                    <MetricCard
                      title="Awaiting Payments"
                      value={awaitingTotal}
                      isCurrency={true}
                      deltaPeriod={`${awaitingCount} pending invoice${awaitingCount !== 1 ? "s" : ""}`}
                      icon={<Clock className="w-4 h-4 text-amber-600" />}
                    />
                  </>
                );
              }

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
                    title="Total Paid"
                    value={displayPaidVolume}
                    isCurrency={true}
                    deltaPeriod="Settled to agency"
                    icon={<Coins className="w-4 h-4 text-blue-600" />}
                  />
                  <MetricCard
                    title="Talent Payouts"
                    value={disbursedVolume}
                    isCurrency={true}
                    deltaPeriod="Disbursed to talent"
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
                  {workspaceType === "brand" ? "Pending Invoices (To Pay)" : "Pending Invoices (Unpaid)"}
                </span>
              </div>
              {qbSyncStatus === "loading" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-700" />
                  <span>Syncing...</span>
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              {qbSyncStatus === "loading" ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/40">
                  <RefreshCw className="h-8 w-8 animate-spin text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Fetching Invoices</p>
                  <p className="text-xs text-slate-500 mt-1">{qbSyncMessage || "Syncing with connected accounting platform..."}</p>
                </div>
              ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="p-4">
                      {workspaceType === "brand" && (
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 accent-slate-900 rounded border-slate-300"
                          onChange={(e) => {
                            const pendingInvs = widgetInvoices.filter(i => i.status === "pending").slice(0, 4);
                            setSelectedIds(e.target.checked ? pendingInvs.map(i => i.id) : []);
                          }}
                          checked={selectedIds.length > 0 && selectedIds.length === widgetInvoices.filter(i => i.status === "pending").slice(0, 4).length}
                        />
                      )}
                    </th>
                    <th className="py-4 font-semibold">Invoice</th>
                    <th className="py-4 font-semibold">Payee</th>
                    <th className="py-4 font-semibold">Job</th>
                    <th className="py-4 font-semibold">Total</th>
                    <th className="py-4 pr-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {widgetInvoices.filter(i => i.status === "pending").slice(0, 4).map((inv) => {
                    const isSelected = selectedIds.includes(inv.id);
                    return (
                      <tr key={inv.id} className={`transition-colors hover:bg-slate-50/70 ${isSelected ? "bg-slate-50" : ""}`}>
                        <td className="p-4">
                          {workspaceType === "brand" && (
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 accent-slate-900 rounded border-slate-300"
                              checked={isSelected}
                              onChange={(e) => {
                                setSelectedIds(curr => 
                                  curr.includes(inv.id) ? curr.filter(id => id !== inv.id) : [...curr, inv.id]
                                );
                              }}
                            />
                          )}
                        </td>
                        <td className="py-4 text-xs font-mono font-semibold text-slate-500">{inv.id.substring(0,8).toUpperCase()}</td>
                        <td className="py-4">
                          <p className="font-bold text-slate-900">{inv.agency}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-slate-800 font-medium">{inv.campaign}</p>
                          <p className="text-[11px] text-slate-500">Due {inv.dueDate || inv.due}</p>
                        </td>
                        <td className="py-4 font-bold text-slate-900">
                          ${(inv.amount * (workspaceType === "brand" ? 1.015 : 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                              title="View Invoice Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {workspaceType === "brand" && (
                              <button
                                onClick={() => {
                                  setSelectedIds([inv.id]);
                                  setIsCheckoutOpen(true);
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {widgetInvoices.filter(i => i.status === "pending").length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-3.5 shadow-2xs">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                          </div>
                          <h4 className="text-base font-bold text-slate-900 tracking-tight">No Pending Invoices</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            All invoices are clear and settled. New incoming payment requests will appear here for one-click approval.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
            
            {widgetInvoices.filter(i => i.status === "pending").length > 4 && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex justify-center items-center">
                <button
                  onClick={() => router.push("/branddashboard/invoices")}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <span>View All ({widgetInvoices.filter(i => i.status === "pending").length}) Invoices</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {workspaceType === "brand" && selectedIds.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedIds.length} invoice(s) selected</p>
                  <p className="text-xs text-slate-500">Ready for batch payment.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">Clear</button>
                  <button onClick={() => setIsCheckoutOpen(true)} className="px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer">
                    <ShieldCheck className="w-4 h-4 text-white" /> Batch Pay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Open an Account Banner under Pending Invoices */}
          <div className="mt-6 w-full h-[300px] md:h-[360px] rounded-2xl overflow-hidden shadow-xs border border-slate-200 transition-transform hover:scale-[1.005] duration-300 relative">
            <img 
              src="/models/homepagebottomimage1.png" 
              alt="Open an Account" 
              className="w-full h-full object-cover block"
            />
          </div>

        </div>

        {/* Right Column - Queue and History Ledger (Narrower) */}
        <div id="approval-queue-section" className="lg:col-span-4 space-y-6">
          
          {/* Integrations Widget */}
          <IntegrationsPanel
            onSync={(provider) => {
              if (provider === "quickbooks") fetchQbInvoices();
              else if (provider === "xero") fetchXeroInvoices();
            }}
            onDisconnect={(provider) => {
              setWidgetInvoices(prev => prev.filter(inv => inv._source !== provider));
            }}
          />

          {/* Connected Banking Feeds */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">CONNECTED BANKING FEEDS</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Real-time commercial balances verified via Plaid</p>
              </div>
              <button
                type="button"
                onClick={handleConnectPlaid}
                disabled={isPlaidLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs shrink-0"
                style={{ backgroundColor: "#0F172A", color: "#FFFFFF" }}
              >
                {isPlaidLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" style={{ color: "#FFFFFF" }} />
                    <span style={{ color: "#FFFFFF" }}>Connecting...</span>
                  </>
                ) : (
                  <span style={{ color: "#FFFFFF" }}>Connect Bank (Plaid)</span>
                )}
              </button>
            </div>

            {plaidError && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between px-5">
                <span>{plaidError}</span>
                <button onClick={() => setPlaidError(null)} className="text-red-700 hover:opacity-75 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="p-5 flex flex-col gap-3 bg-white">
              {plaidAccounts.length > 0 ? (
                plaidAccounts.map((acc, accIdx) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: accIdx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-9 sm:w-16 sm:h-10 rounded-lg border border-slate-200 bg-slate-900 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden relative">
                        {getCardImage(acc.institutionName) ? (
                          <img
                            src={getCardImage(acc.institutionName)}
                            alt={acc.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <CreditCard className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{acc.institutionName} — {acc.name}</h4>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 font-mono">
                          {acc.subtype?.toUpperCase()} ••••{acc.mask}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-mono block">
                          ${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Available Balance</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDisconnectPlaidAccount(acc.id)}
                        title="Disconnect Bank Feed"
                        className="p-2 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer group shadow-2xs shrink-0"
                        style={{ backgroundColor: "#F1F5F9" }}
                      >
                        <X className="h-3.5 w-3.5 transition-colors group-hover:scale-110" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-medium text-slate-500">
                  No bank feeds connected. Click &quot;+ Connect Bank (Plaid)&quot; above to link your commercial checking or treasury account.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {isNewInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/65 px-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[460px] rounded-2xl border border-slate-200 dark:border-white/20 bg-white dark:bg-[#0A0A0A] p-6 sm:p-7 shadow-2xl relative text-left"
            >
              <div className="pb-4 border-b border-slate-200 dark:border-white/20">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-slate-800 dark:text-white" />
                  Create New Invoice
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Issue a campaign split invoice. Payout structures (15% agency, 85% talent) will auto-generate.
                </p>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Brand Socials"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-black rounded-xl px-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                    Select Brand Client
                  </label>
                  <select
                    required
                    value={selectedBrandEmail}
                    onChange={(e) => setSelectedBrandEmail(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-black rounded-xl px-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white transition-all cursor-pointer"
                  >
                    {registeredBrands.length === 0 ? (
                      <option value="" disabled>No registered brands found</option>
                    ) : (
                      registeredBrands.map((b) => (
                        <option key={b.uid} value={b.email} className="bg-white text-slate-900">
                          {b.workspaceName} ({b.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                      Select Talent
                    </label>
                    <select
                      value={selectedTalentEmail}
                      onChange={(e) => setSelectedTalentEmail(e.target.value)}
                      disabled={newSplits.length > 0}
                      className={`mt-1.5 h-11 w-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-black rounded-xl px-3 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white transition-all cursor-pointer ${newSplits.length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Select Talent</option>
                      {registeredTalents.map((t) => (
                        <option key={t.uid} value={t.email} className="bg-white text-slate-900">
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                      Invoice Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      readOnly={newSplits.length > 0}
                      placeholder="e.g. 14999.98"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className={`mt-1.5 h-11 w-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-black rounded-xl px-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:bg-white transition-all ${newSplits.length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>

                {/* Multi-Talent Splits Builder Section */}
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-3.5 bg-slate-50/70 dark:bg-white/[0.01] space-y-3">
                  <span className="block text-[11px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                    Campaign splits (Multi-Talent Payouts)
                  </span>

                  {newSplits.length > 0 && (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {newSplits.map((split, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-white/5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-2xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{split.talentName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{split.talentEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-emerald-600 font-bold">${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = newSplits.filter((_, i) => i !== idx);
                                setNewSplits(next);
                                const sum = next.reduce((acc, cur) => acc + cur.amount, 0);
                                if (sum > 0) {
                                  setNewAmount((sum / 0.85).toFixed(2));
                                } else {
                                  setNewAmount("");
                                  setSelectedTalentEmail("");
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-bold px-1 text-sm cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={splitTalentEmail}
                        onChange={(e) => setSplitTalentEmail(e.target.value)}
                        className="h-9.5 w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-black rounded-lg px-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 transition-all cursor-pointer"
                      >
                        <option value="">Choose Talent</option>
                        {registeredTalents
                          .filter(t => !newSplits.some(s => s.talentEmail === t.email))
                          .map((t) => (
                            <option key={t.uid} value={t.email} className="bg-white text-slate-900">
                              {t.fullName}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="w-[90px]">
                      <input
                        type="number"
                        placeholder="USD ($)"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                        className="h-9.5 w-full border border-slate-200 dark:border-white/10 bg-white dark:bg-black rounded-lg px-2.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!splitTalentEmail || !splitAmount) return;
                        const talentUser = registeredTalents.find(t => t.email === splitTalentEmail);
                        if (!talentUser) return;
                        const amt = parseFloat(splitAmount);
                        if (isNaN(amt) || amt <= 0) return;

                        const next = [...newSplits, {
                          talentName: talentUser.fullName,
                          talentEmail: splitTalentEmail,
                          amount: amt,
                          status: "pending" as const
                        }];
                        setNewSplits(next);
                        
                        const sum = next.reduce((acc, cur) => acc + cur.amount, 0);
                        setNewAmount((sum / 0.85).toFixed(2));

                        if (next.length === 1) {
                          setSelectedTalentEmail(splitTalentEmail);
                        }

                        setSplitTalentEmail("");
                        setSplitAmount("");
                      }}
                      className="h-9.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {newSplits.length > 0 && (
                    <div className="text-xs text-slate-500 space-y-0.5 pt-1.5 border-t border-slate-200 font-medium leading-4">
                      <div className="flex justify-between">
                        <span>Total Talent Payout (85%):</span>
                        <span className="font-semibold text-slate-900">${newSplits.reduce((acc, cur) => acc + cur.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agency Commission (15%):</span>
                        <span className="font-semibold text-slate-900">${(newSplits.reduce((acc, cur) => acc + cur.amount, 0) * 0.15 / 0.85).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="mt-1.5 h-11 w-full border border-slate-200 dark:border-white/20 bg-slate-50 dark:bg-black rounded-xl px-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-slate-900 transition-all"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/20 flex gap-3 justify-end text-xs">
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

      {/* High-Contrast Batch Payment Checkout Overlay */}
      <BatchPaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedInvoices={widgetInvoices.filter(i => selectedIds.includes(i.id))}
        onAuthorizePayment={handleProcessPayment}
      />

      {/* Plaid Institution Link Modal */}
      {isPlaidModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/20 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Link Bank Account</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified by Plaid
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Select an institution to connect your commercial banking feed</p>
                </div>
              </div>
              <button
                onClick={() => !connectingBankName && setIsPlaidModalOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Major Commercial Institutions</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlaidBanks.map((bank) => {
                  const isConnected = plaidAccounts.some(acc => acc.institutionName === bank.institutionName);
                  const isThisConnecting = connectingBankName === bank.institutionName;

                  return (
                    <button
                      key={bank.institutionName}
                      onClick={() => !isConnected && !connectingBankName && handleSelectPlaidBank(bank)}
                      disabled={isConnected || !!connectingBankName}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                        isConnected 
                          ? "bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed"
                          : isThisConnecting
                          ? "bg-slate-100 border-slate-400 cursor-wait"
                          : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white cursor-pointer shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                            <Building2 className="w-4 h-4 text-slate-700" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight">{bank.institutionName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">••••{bank.mask}</p>
                          </div>
                        </div>
                        {isConnected && (
                          <span className="text-[10px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
                            Linked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">{bank.name}</span>
                        {isThisConnecting ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Linking...</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold font-mono text-slate-900">
                            ${bank.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 px-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                256-bit AES end-to-end encryption via Plaid
              </span>
              <button 
                onClick={() => !connectingBankName && setIsPlaidModalOpen(false)}
                className="font-bold text-slate-900 hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Static Popup Modal */}
      {viewingInvoice && (() => {
        const isLight = isLightTheme || (typeof document !== "undefined" && document.documentElement.classList.contains("light"));
        const amount = Number(viewingInvoice.amount || 0);
        const rateAmt = amount ? amount * 0.85 : 25000;
        const reimbAmt = amount ? amount * 0.15 : 3750;
        
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setViewingInvoice(null)} />
            
            <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
              isLight 
                ? "bg-white border-black/20 text-[#0F172A]" 
                : "bg-[#0A0A0C] border-white/20 text-white"
            }`}>
              {/* Modal Header */}
              <div className={`p-6 border-b flex items-center justify-between ${
                isLight ? "border-black/10 bg-slate-50" : "border-white/10 bg-white/[0.02]"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
                    isLight ? "bg-white border-black/20 text-[#0F172A] shadow-xs" : "bg-white/10 border-white/20 text-white"
                  }`}>
                    <FileText className="h-5 w-5 text-current" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Invoice Details</h3>
                    <p className={`text-xs font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                      {viewingInvoice.id?.toUpperCase() || "W-INV-001"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingInvoice(null)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isLight ? "border-black/10 hover:bg-black/5 text-[#0F172A]" : "border-white/10 hover:bg-white/10 text-neutral-400 hover:text-white"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? "bg-slate-50 border-black/10" : "bg-white/[0.02] border-white/10"
                }`}>
                  <div className="flex justify-between items-center border-b pb-2 border-current/10">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Payee</span>
                    <span className="font-bold text-sm">{viewingInvoice.agency || "Ogilvy USA"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2 border-current/10">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Email</span>
                    <span className="font-mono">{viewingInvoice.agencyEmail || viewingInvoice.talentEmail || "billing@agency.com"}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2 border-current/10">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Job Title</span>
                    <span className="font-semibold text-right max-w-[200px] truncate">{viewingInvoice.campaign || "Global Brand Retainer"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Date</span>
                    <span className="font-semibold">{viewingInvoice.createdDate || viewingInvoice.dueDate || viewingInvoice.due || "Jul 26, 2026"}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? "bg-slate-50 border-black/10" : "bg-white/[0.02] border-white/10"
                }`}>
                  <div>
                    <span className={`block font-medium mb-1 ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Usage</span>
                    <p className="font-semibold">Commercial Broadcast &amp; Digital (Global usage rights, 2 yr term)</p>
                  </div>
                  <div className="border-t pt-2 border-current/10 flex justify-between items-center">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Rate</span>
                    <span className="font-mono font-bold">${rateAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-2 border-current/10 flex justify-between items-center">
                    <span className={`font-medium ${isLight ? "text-slate-500" : "text-neutral-400"}`}>Reimbursement</span>
                    <span className="font-mono font-bold">${reimbAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t pt-2 border-current/10 flex justify-between items-center text-sm">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-mono font-extrabold text-emerald-500">${amount ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "28,750.00"}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-6 border-t flex items-center justify-end gap-3 ${
                isLight ? "border-black/10 bg-slate-50" : "border-white/10 bg-white/[0.02]"
              }`}>
                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isLight 
                      ? "bg-white border-black/20 text-[#0F172A] hover:bg-slate-100" 
                      : "border-white/20 text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Close
                </button>
                {workspaceType === "brand" && viewingInvoice.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      const invId = viewingInvoice.id;
                      setViewingInvoice(null);
                      setSelectedIds([invId]);
                      setIsCheckoutOpen(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isLight 
                        ? "bg-[#0F172A] text-white hover:bg-black" 
                        : "bg-white text-black hover:bg-neutral-200"
                    }`}
                  >
                    Pay This Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </AppShell>
  );
}
