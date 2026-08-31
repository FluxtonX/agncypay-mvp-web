"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BusinessProfile, BrandVerification } from "../types/business";
import { VerificationDocument } from "../types/document";
import { Invoice } from "../types/invoice";
import { Transaction } from "../types/transaction";
import { INITIAL_BUSINESS_PROFILE } from "../data/verification";
import { INITIAL_DOCUMENTS } from "../data/documents";
import { MOCK_INVOICES } from "../data/invoices";
import { MOCK_TRANSACTIONS } from "../data/transactions";
import {
  AccountType,
  Membership,
  Workspace,
  WorkspaceType,
  getDefaultPermissions,
  getDefaultWorkspaceRole,
  getVerificationTrack,
  normalizeWorkspaceType,
} from "../types/workspace";
import { apiGetMe } from "../lib/api/users";
import { apiLogout } from "../lib/api/auth";
import { apiUpdateInvoiceStatus } from "../lib/api/invoices";

interface AppState {
  user: {
    uid: string;
    agncyId: string;
    fullName: string;
    email: string;
    accountType: AccountType;
    isLoggedIn: boolean;
    emailVerified: boolean;
    kybStatus?: string;
    activeWorkspaceId?: string;
    parentAgencyEmail?: string;
    parentAgencyUid?: string;
  } | null;
  workspaces: Workspace[];
  memberships: Membership[];
  activeWorkspaceId: string | null;
  businessSetup: Partial<BusinessProfile> & {
    industry?: string;
    address?: string;
    city?: string;
    businessState?: string;
    zipCode?: string;
    companyDescription?: string;
    addressLine1?: string;
    addressLine2?: string;
    stateOrProvince?: string;
    postalCode?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    ssnLast4?: string;
  };
  representative: {
    fullName: string;
    jobTitle: string;
    dob: string;
    nationality: string;
    email: string;
    phone: string;
    address: string;
    idType: string;
    idFrontUploaded: boolean;
    idBackUploaded: boolean;
    selfieUploaded: boolean;
    status: "not_started" | "uploaded" | "processing" | "verified" | "rejected";
  };
  authorization: {
    isOwner: boolean | null;
    owns25Percent: boolean | null;
    isAuthorizedForPayments: boolean | null;
    authLetterUploaded: boolean;
    powerOfAttorneyUploaded: boolean;
    signatoryName: string;
    signatoryEmail: string;
    roleInCompany: string;
    formationDate: string;
    incorporationState: string;
    employeeRange: string;
    monthlyPaymentVolume: string;
    owners: {
      fullName: string;
      role: string;
      ownership: number;
      country: string;
      email: string;
      idRequired: boolean;
    }[];
  };
  documents: VerificationDocument[];
  brand: BrandVerification & {
    brandCategory: string;
    logoUploaded: boolean;
    brandProofUploaded: boolean;
    trademarkCertUploaded: boolean;
    distributorContractUploaded: boolean;
    authLetterUploaded: boolean;
    domainVerificationCode: string;
    domainCodeSent: boolean;
    domainCodeAttempts: number;
    emailDomainWarning: boolean;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    country: string;
    currency: string;
    accountNumber: string;
    routingNumber: string;
    bankAddress: string;
    statementUploaded: boolean;
    holderNameWarning: boolean;
    status: "not_started" | "uploaded" | "processing" | "approved" | "rejected";
  };
  verificationStatus: "draft" | "submitted" | "in_review" | "requires_action" | "approved" | "rejected" | "suspended";
  invoices: Invoice[];
  transactions: Transaction[];
}

const DEFAULT_STATE: AppState = {
  user: null,
  workspaces: [],
  memberships: [],
  activeWorkspaceId: null,
  businessSetup: {
    legalName: "",
    brandName: "",
    businessType: "",
    country: "",
    website: "",
    email: "",
    phone: "",
    verificationStatus: "draft",
    industry: "",
  },
  representative: {
    fullName: "",
    jobTitle: "",
    dob: "",
    nationality: "",
    email: "",
    phone: "",
    address: "",
    idType: "Passport",
    idFrontUploaded: false,
    idBackUploaded: false,
    selfieUploaded: false,
    status: "not_started",
  },
  authorization: {
    isOwner: null,
    owns25Percent: null,
    isAuthorizedForPayments: null,
    authLetterUploaded: false,
    powerOfAttorneyUploaded: false,
    signatoryName: "",
    signatoryEmail: "",
    roleInCompany: "",
    formationDate: "",
    incorporationState: "",
    employeeRange: "",
    monthlyPaymentVolume: "",
    owners: [],
  },
  documents: INITIAL_DOCUMENTS,
  brand: {
    id: "",
    brandName: "",
    officialWebsite: "",
    officialEmail: "",
    domainVerified: false,
    trademarkNumber: "",
    status: "draft",
    brandCategory: "",
    logoUploaded: false,
    brandProofUploaded: false,
    trademarkCertUploaded: false,
    distributorContractUploaded: false,
    authLetterUploaded: false,
    domainVerificationCode: "123456",
    domainCodeSent: false,
    domainCodeAttempts: 0,
    emailDomainWarning: false,
  },
  bankDetails: {
    accountHolderName: "",
    bankName: "",
    country: "",
    currency: "USD",
    accountNumber: "",
    routingNumber: "",
    bankAddress: "",
    statementUploaded: false,
    holderNameWarning: false,
    status: "not_started",
  },
  verificationStatus: "draft",
  invoices: MOCK_INVOICES,
  transactions: MOCK_TRANSACTIONS,
};

interface AppContextType {
  state: AppState;
  loginUser: (
    email: string,
    fullName: string,
    accountType: AccountType,
    workspaceOptions?: {
      workspaceName?: string;
      workspaceType?: WorkspaceType;
      agencyId?: string;
      uid?: string;
      kybStatus?: string;
    }
  ) => void;
  verifyEmail: (code: string) => boolean;
  resendEmailCode: () => void;
  updateBusinessSetup: (data: Partial<AppState["businessSetup"]>) => void;
  updateRepresentative: (data: Partial<AppState["representative"]>) => void;
  updateAuthorization: (data: Partial<AppState["authorization"]>) => void;
  uploadDocument: (docId: string, updates: Partial<VerificationDocument>) => void;
  updateBrand: (data: Partial<AppState["brand"]>) => void;
  sendBrandDomainCode: (email: string) => boolean;
  verifyBrandDomainCode: (code: string) => boolean;
  updateBankDetails: (data: Partial<AppState["bankDetails"]>) => void;
  submitForVerification: () => void;
  payInvoice: (invoiceId: string) => Promise<{ success: boolean; error?: string }>;
  switchWorkspace: (workspaceId: string) => void;
  resetState: () => void;
  logoutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setVerificationStatusDirectly: (status: AppState["verificationStatus"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function createAgncyId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeStoredState(state: AppState): AppState {
  return {
    ...DEFAULT_STATE,
    ...state,
    workspaces: Array.isArray(state.workspaces) ? state.workspaces : [],
    memberships: Array.isArray(state.memberships) ? state.memberships : [],
    activeWorkspaceId: state.activeWorkspaceId ?? state.user?.activeWorkspaceId ?? null,
    user: state.user
      ? {
          ...state.user,
          uid: state.user.uid ?? "",
          agncyId: state.user.agncyId ?? createAgncyId("USR"),
          activeWorkspaceId: state.user.activeWorkspaceId ?? state.activeWorkspaceId ?? undefined,
        }
      : null,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore session from JWT token or localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agncypay_state");
      if (stored) {
        setState(normalizeStoredState(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
    setIsLoaded(true);

    // Fetch user from NestJS backend if JWT token exists
    const token = localStorage.getItem("agncypay_token");
    if (token) {
      apiGetMe()
        .then((userData) => {
          if (userData && userData.email) {
            const workspaceType = normalizeWorkspaceType(userData.accountType);
            const workspaceId = `ws-${userData.id}`;

            const verificationStatus = userData.kybStatus === "approved" ? "approved" : "draft";
            const userWorkspace: Workspace = {
              id: workspaceId,
              type: workspaceType,
              name: `${userData.fullName}'s Workspace`,
              agncyId: userData.agncyId,
              verificationTrack: getVerificationTrack(workspaceType),
              verificationStatus,
            };

            setState((prev) => ({
              ...prev,
              user: {
                uid: userData.id,
                agncyId: userData.agncyId,
                fullName: userData.fullName,
                email: userData.email,
                accountType: userData.accountType,
                isLoggedIn: true,
                emailVerified: true,
                kybStatus: userData.kybStatus || "not_started",
                activeWorkspaceId: workspaceId,
              },
              workspaces: [userWorkspace],
              activeWorkspaceId: workspaceId,
            }));
          }
        })
        .catch((err) => {
          console.warn("Session restore from API warning:", err.message);
        });
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("agncypay_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save local storage state:", e);
    }
  }, [state, isLoaded]);

  const loginUser = (
    email: string,
    fullName: string,
    accountType: AccountType,
    workspaceOptions?: {
      workspaceName?: string;
      workspaceType?: WorkspaceType;
      agencyId?: string;
      uid?: string;
      kybStatus?: string;
    }
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    const workspaceType = workspaceOptions?.workspaceType ?? normalizeWorkspaceType(accountType);
    const workspaceName = workspaceOptions?.workspaceName?.trim() || "AgncyPay Workspace";
    const workspaceId = `${workspaceType}-${Date.now()}`;
    const role = getDefaultWorkspaceRole(workspaceType);
    const kybStatus = workspaceOptions?.kybStatus || "not_started";
    const verificationStatus = kybStatus === "approved" ? "approved" : "draft";

    const workspace: Workspace = {
      id: workspaceId,
      type: workspaceType,
      name: workspaceName,
      agncyId: workspaceOptions?.agencyId || createAgncyId("ORG"),
      externalId: workspaceOptions?.agencyId,
      verificationTrack: getVerificationTrack(workspaceType),
      verificationStatus,
    };
    const membership: Membership = {
      id: `mem-${Date.now()}`,
      userEmail: normalizedEmail,
      workspaceId,
      role,
      permissions: getDefaultPermissions(role),
      status: "active",
    };

    setState((prev) => ({
      ...prev,
      user: {
        uid: workspaceOptions?.uid || createAgncyId("USR"),
        agncyId: workspaceOptions?.agencyId || createAgncyId("USR"),
        fullName: fullName.trim(),
        email: normalizedEmail,
        accountType,
        isLoggedIn: true,
        emailVerified: true,
        kybStatus,
        activeWorkspaceId: workspaceId,
      },
      workspaces: [
        ...prev.workspaces.filter((existingWorkspace) => existingWorkspace.id !== workspaceId),
        workspace,
      ],
      memberships: [
        ...prev.memberships.filter(
          (existingMembership) =>
            existingMembership.userEmail !== normalizedEmail ||
            existingMembership.workspaceId !== workspaceId
        ),
        membership,
      ],
      activeWorkspaceId: workspaceId,
    }));
  };

  const verifyEmail = (code: string) => {
    if (code === "123456" && state.user) {
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, emailVerified: true } : null,
      }));
      return true;
    }
    return false;
  };

  const switchWorkspace = (workspaceId: string) => {
    setState((prev) => {
      const workspace = prev.workspaces.find((item) => item.id === workspaceId);
      if (!workspace || !prev.user) return prev;

      return {
        ...prev,
        activeWorkspaceId: workspace.id,
        user: {
          ...prev.user,
          accountType: workspace.type,
          activeWorkspaceId: workspace.id,
        },
      };
    });
  };

  const resendEmailCode = () => {
    console.log("Verification email resent to:", state.user?.email);
  };

  const updateBusinessSetup = (data: Partial<AppState["businessSetup"]>) => {
    setState((prev) => ({
      ...prev,
      businessSetup: { ...prev.businessSetup, ...data },
    }));
  };

  const updateRepresentative = (data: Partial<AppState["representative"]>) => {
    setState((prev) => {
      const newRep = { ...prev.representative, ...data };
      if (newRep.idFrontUploaded && newRep.selfieUploaded) {
        newRep.status = "uploaded";
      }
      return {
        ...prev,
        representative: newRep,
      };
    });
  };

  const updateAuthorization = (data: Partial<AppState["authorization"]>) => {
    setState((prev) => ({
      ...prev,
      authorization: { ...prev.authorization, ...data },
    }));
  };

  const uploadDocument = (docId: string, updates: Partial<VerificationDocument>) => {
    setState((prev) => {
      const docs = prev.documents.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            ...updates,
            uploadedAt: updates.status === "uploaded" ? new Date().toISOString() : doc.uploadedAt,
          };
        }
        return doc;
      });
      return { ...prev, documents: docs };
    });
  };

  const updateBrand = (data: Partial<AppState["brand"]>) => {
    setState((prev) => ({
      ...prev,
      brand: { ...prev.brand, ...data },
    }));
  };

  const sendBrandDomainCode = (email: string) => {
    const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"];
    const emailDomain = email.split("@")[1]?.toLowerCase() || "";
    const isEnterprise = emailDomain.length > 0 && !genericDomains.includes(emailDomain);
    setState((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        officialEmail: email,
        domainCodeSent: true,
        emailDomainWarning: !isEnterprise,
      },
    }));
    return true;
  };

  const verifyBrandDomainCode = (code: string) => {
    if (code === "123456") {
      setState((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          domainVerified: true,
          status: "approved",
        },
      }));
      return true;
    }
    setState((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        domainCodeAttempts: prev.brand.domainCodeAttempts + 1,
      },
    }));
    return false;
  };

  const updateBankDetails = (data: Partial<AppState["bankDetails"]>) => {
    setState((prev) => {
      const newBank = { ...prev.bankDetails, ...data };
      const legalName = prev.businessSetup.legalName || "";
      const holderName = newBank.accountHolderName || "";
      newBank.holderNameWarning = holderName.trim().toLowerCase() !== legalName.trim().toLowerCase();

      return {
        ...prev,
        bankDetails: newBank,
      };
    });
  };

  const submitForVerification = () => {
    setState((prev) => ({
      ...prev,
      verificationStatus: "approved",
      representative: { ...prev.representative, status: "verified" },
      bankDetails: { ...prev.bankDetails, status: "approved", statementUploaded: true },
      documents: prev.documents.map((doc) => ({ ...doc, status: "approved" })),
      brand: {
        ...prev.brand,
        officialEmail: prev.brand.officialEmail || prev.user?.email || "demo@gmail.com",
        domainVerified: true,
        domainCodeSent: true,
        status: "approved",
        trademarkCertUploaded: true,
        logoUploaded: true,
        brandProofUploaded: true,
        authLetterUploaded: true,
      },
    }));
  };

  const payInvoice = async (invoiceId: string): Promise<{ success: boolean; error?: string }> => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "processing" } : inv
      ),
    }));

    try {
      await apiUpdateInvoiceStatus(invoiceId, "paid", "disbursed");
    } catch (e) {
      console.warn("Backend pay error, executing optimistic local update:", e);
    }

    let isSuccess = true;
    setState((prev) => {
      const selectedInvoice = prev.invoices.find((inv) => inv.id === invoiceId);
      if (!selectedInvoice) return prev;

      return {
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: "paid" } : inv
        ),
        transactions: [
          {
            id: `TX-AD-${Math.floor(100000 + Math.random() * 900000)}`,
            invoiceId: invoiceId,
            amount: selectedInvoice.amount,
            currency: "USD",
            timestamp: new Date().toISOString(),
            paymentMethod: "AgncyPay ACH Secure",
            status: "success",
          },
          ...prev.transactions,
        ],
      };
    });

    return { success: isSuccess, error: isSuccess ? undefined : "Declined: Insufficient Corporate Treasury balance authorization." };
  };

  const setVerificationStatusDirectly = (status: AppState["verificationStatus"]) => {
    setState((prev) => {
      if (status === "approved") {
        return {
          ...prev,
          verificationStatus: "approved",
          representative: { ...prev.representative, status: "verified" },
          bankDetails: { ...prev.bankDetails, status: "approved" },
          documents: prev.documents.map((doc) => ({ ...doc, status: "approved" })),
          brand: { ...prev.brand, status: "approved" },
        };
      }
      return {
        ...prev,
        verificationStatus: status,
      };
    });
  };

  const resetState = async () => {
    await apiLogout();
    setState(DEFAULT_STATE);
  };

  const refreshUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("agncypay_token") : null;
      if (!token) return;
      const userData: any = await apiGetMe();
      if (userData && userData.email) {
        const workspaceType = normalizeWorkspaceType(userData.accountType);
        const workspaceId = `ws-${userData.id}`;
        const kybStatus = userData.kybStatus || "not_started";
        const verificationStatus = kybStatus === "approved" ? "approved" : "draft";

        setState((prev) => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            uid: userData.id,
            agncyId: userData.agncyId,
            fullName: userData.fullName,
            email: userData.email,
            accountType: userData.accountType,
            kybStatus,
          } : {
            uid: userData.id,
            agncyId: userData.agncyId,
            fullName: userData.fullName,
            email: userData.email,
            accountType: userData.accountType,
            isLoggedIn: true,
            emailVerified: true,
            kybStatus,
            activeWorkspaceId: workspaceId,
          },
          verificationStatus,
          workspaces: (prev.workspaces && prev.workspaces.length > 0)
            ? prev.workspaces.map(w => ({ ...w, verificationStatus }))
            : [{
                id: workspaceId,
                type: workspaceType,
                name: `${userData.fullName}'s Workspace`,
                agncyId: userData.agncyId,
                verificationTrack: getVerificationTrack(workspaceType),
                verificationStatus,
              }],
        }));
      }
    } catch (err: any) {
      console.warn("User refresh warning:", err?.message);
    }
  };

  const logoutUser = async () => {
    await resetState();
    if (typeof window !== "undefined") {
      localStorage.removeItem("agncypay_state");
      localStorage.removeItem("agncypay_token");
      localStorage.removeItem("agncypay_refresh_token");
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        loginUser,
        verifyEmail,
        resendEmailCode,
        updateBusinessSetup,
        updateRepresentative,
        updateAuthorization,
        uploadDocument,
        updateBrand,
        sendBrandDomainCode,
        verifyBrandDomainCode,
        updateBankDetails,
        submitForVerification,
        payInvoice,
        switchWorkspace,
        resetState,
        logoutUser,
        refreshUser,
        setVerificationStatusDirectly,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
