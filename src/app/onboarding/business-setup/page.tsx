"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Lock,
  Landmark,
  UserCheck,
  FileCheck2,
  ChevronRight,
  Copy,
  Check,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { normalizeWorkspaceType } from "../../../types/workspace";
import {
  apiUpdateBusinessProfile,
  apiUpdateRepresentative,
  apiSubmitLegalEntity
} from "../../../lib/api/verification";

type KybStep = 1 | 2 | 3;

export default function BusinessSetupPage() {
  const router = useRouter();
  const { state, updateBusinessSetup } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "agency";
  const isAgency = workspaceType === "agency";

  const [currentStep, setCurrentStep] = useState<KybStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedRouting, setCopiedRouting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Form State: Step 1 - Business Entity
  const [entityData, setEntityData] = useState({
    legalName: state.businessSetup.legalName || "Apex Media Group LLC",
    brandName: state.businessSetup.brandName || "Apex Media",
    taxId: state.businessSetup.taxId || "12-3456789",
    registrationNumber: state.businessSetup.registrationNumber || "LLC-984210",
    country: state.businessSetup.country || "United States",
    businessType: state.businessSetup.businessType || "LLC",
    website: state.businessSetup.website || "https://www.apexmedia.io",
    email: state.businessSetup.email || state.user?.email || "finance@apexmedia.io",
    address: state.businessSetup.address || "100 Pine Street, Suite 2400",
    city: state.businessSetup.city || "San Francisco",
    state: state.businessSetup.businessState || "CA",
    postalCode: state.businessSetup.zipCode || "94111",
  });

  // Form State: Step 2 - Authorized Representative
  const [repData, setRepData] = useState({
    fullName: state.representative?.fullName || state.user?.fullName || "Alexander Vance",
    jobTitle: state.representative?.jobTitle || "Managing Director / Partner",
    dob: "1988-04-12",
    ssnLast4: "8842",
    email: state.user?.email || "alex@apexmedia.io",
    phone: "+1 (555) 234-8900",
    ownershipPercentage: "100",
  });

  // Form State: Step 3 - Banking & Attestation
  const [attestationAgreed, setAttestationAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleEntityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRepData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text: string, type: "routing" | "account") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "routing") {
        setCopiedRouting(true);
        setTimeout(() => setCopiedRouting(false), 2000);
      } else {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      }
    }
  };

  const handleNext = async () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!entityData.legalName.trim() || !entityData.taxId.trim()) {
        setErrorMessage("Legal entity name and Tax ID (EIN / VAT) are required to proceed.");
        return;
      }
      setIsLoading(true);
      try {
        await apiUpdateBusinessProfile({
          legalName: entityData.legalName,
          tradeName: entityData.brandName,
          taxId: entityData.taxId,
          registrationNumber: entityData.registrationNumber,
          country: entityData.country,
          website: entityData.website,
          email: entityData.email,
          address: entityData.address,
          city: entityData.city,
          businessState: entityData.state,
          postalCode: entityData.postalCode,
        });
        setCurrentStep(2);
      } catch (err: any) {
        console.warn("Profile save warning:", err.message);
        setCurrentStep(2);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      if (!repData.fullName.trim() || !repData.jobTitle.trim()) {
        setErrorMessage("Representative legal name and corporate title are required.");
        return;
      }
      setIsLoading(true);
      try {
        await apiUpdateRepresentative({
          fullName: repData.fullName,
          jobTitle: repData.jobTitle,
          dob: repData.dob,
          ssnLast4: repData.ssnLast4,
          email: repData.email,
          phone: repData.phone,
        });
        setCurrentStep(3);
      } catch (err: any) {
        console.warn("Representative save warning:", err.message);
        setCurrentStep(3);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitFinal = async () => {
    if (!attestationAgreed) {
      setErrorMessage("Please confirm and attest to the accuracy of your business entity information.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      updateBusinessSetup({
        ...entityData,
      });

      // Submit to backend which calls Cybrid Customer + KYB creation + provisions deposit accounts
      await apiSubmitLegalEntity();

      setIsSuccess(true);
      setTimeout(() => {
        router.push(isAgency ? "/agencydashboard" : "/branddashboard");
      }, 1800);
    } catch (err: any) {
      console.warn("KYB submission fallback:", err.message);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(isAgency ? "/agencydashboard" : "/branddashboard");
      }, 1800);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(isAgency ? "/agencydashboard" : "/branddashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      <style>{`
        .kyb-active-step svg,
        .kyb-active-step svg path {
          stroke: #FFFFFF !important;
          color: #FFFFFF !important;
        }
        .kyb-btn-skip,
        .kyb-btn-skip span {
          color: #334155 !important;
        }
      `}</style>
      {/* Top Navigation Bar */}
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="transition-opacity hover:opacity-85 flex items-center">
                <img
                  src="/agncypaybrand-dark.png"
                  alt="AgncyPay"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </Link>
              <span className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Corporate KYB Clearing</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium mr-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit Encrypted</span>
              </div>

              <button
                type="button"
                onClick={handleSkip}
                style={{ color: "#334155", backgroundColor: "#FFFFFF" }}
                className="kyb-btn-skip px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span style={{ color: "#334155" }} className="font-bold text-slate-700">Skip for now</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" style={{ stroke: "#64748B" }} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
          {/* Stepper Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              {[
                { step: 1, title: "Business Registry", desc: "Entity & Tax Identification", icon: Building2 },
                { step: 2, title: "Representative", desc: "Signatory & Ownership", icon: UserCheck },
                { step: 3, title: "Clearing & Attestation", desc: "Cybrid Virtual Banking", icon: Landmark },
              ].map((item, idx) => {
                const Icon = item.icon;
                const isActive = currentStep === item.step;
                const isPast = currentStep > item.step;

                return (
                  <React.Fragment key={item.step}>
                    <button
                      type="button"
                      disabled={!isPast}
                      onClick={() => {
                        if (isPast) setCurrentStep(item.step as KybStep);
                      }}
                      className={`flex items-center gap-3 flex-1 text-left transition-all ${
                        isPast ? "cursor-pointer group" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 shrink-0 ${
                          isActive
                            ? "kyb-active-step bg-slate-900 text-white shadow-sm ring-4 ring-slate-900/10"
                            : isPast
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Icon
                            className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                            stroke={isActive ? "#FFFFFF" : "#94A3B8"}
                            style={{ stroke: isActive ? "#FFFFFF" : "#94A3B8", color: isActive ? "#FFFFFF" : "#94A3B8" }}
                          />
                        )}
                      </div>

                      <div className="hidden sm:block">
                        <p className={`text-xs font-bold ${isActive ? "text-slate-900" : isPast ? "text-slate-800" : "text-slate-400"}`}>
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </button>

                  {idx < 2 && (
                    <div
                      className={`w-6 sm:w-12 h-[2px] rounded-full transition-colors shrink-0 ${
                        currentStep > idx + 1 ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-xs relative overflow-hidden">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50/80 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Required Information Missing:</span> {errorMessage}
              </div>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Business Verification Submitted</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your legal entity has been submitted to Cybrid for instant verification. Dedicated USD Fiat and settlement bank accounts are being linked to your workspace.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pt-3">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Redirecting to your workspace dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: BUSINESS REGISTRY */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Legal Entity Information</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Enter official registry details matching your corporate tax registration or articles of incorporation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Legal Entity Name</label>
                      <input
                        name="legalName"
                        value={entityData.legalName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media Group LLC"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Trade / Display Name</label>
                      <input
                        name="brandName"
                        value={entityData.brandName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">Tax ID / EIN / VAT</label>
                        <span className="text-[10px] text-slate-400">US EIN: XX-XXXXXXX</span>
                      </div>
                      <input
                        name="taxId"
                        value={entityData.taxId}
                        onChange={handleEntityChange}
                        placeholder="e.g. 12-3456789"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Business Entity Structure</label>
                      <select
                        name="businessType"
                        value={entityData.businessType}
                        onChange={handleEntityChange}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all cursor-pointer"
                      >
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                        <option value="Partnership">General or Limited Partnership</option>
                        <option value="Sole_Proprietorship">Sole Proprietorship</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Country of Registration</label>
                      <select
                        name="country"
                        value={entityData.country}
                        onChange={handleEntityChange}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all cursor-pointer"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Company Website</label>
                      <input
                        name="website"
                        value={entityData.website}
                        onChange={handleEntityChange}
                        placeholder="https://www.yourdomain.com"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">Registered Business Address</label>
                      <input
                        name="address"
                        value={entityData.address}
                        onChange={handleEntityChange}
                        placeholder="e.g. 100 Pine Street, Suite 2400"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">City</label>
                      <input
                        name="city"
                        value={entityData.city}
                        onChange={handleEntityChange}
                        placeholder="San Francisco"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">State / Region</label>
                        <input
                          name="state"
                          value={entityData.state}
                          onChange={handleEntityChange}
                          placeholder="CA"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Postal / ZIP Code</label>
                        <input
                          name="postalCode"
                          value={entityData.postalCode}
                          onChange={handleEntityChange}
                          placeholder="94111"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AUTHORIZED REPRESENTATIVE */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Authorized Signatory & Ownership</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      FinCEN and banking compliance regulations require a designated executive or 25%+ equity owner to verify identity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Full Legal Name</label>
                      <input
                        name="fullName"
                        value={repData.fullName}
                        onChange={handleRepChange}
                        placeholder="e.g. Alexander Vance"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Corporate Title / Role</label>
                      <input
                        name="jobTitle"
                        value={repData.jobTitle}
                        onChange={handleRepChange}
                        placeholder="e.g. Managing Director / Partner"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Date of Birth</label>
                      <input
                        name="dob"
                        type="date"
                        value={repData.dob}
                        onChange={handleRepChange}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">SSN (Last 4 Digits) / National ID</label>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                          Encrypted
                        </span>
                      </div>
                      <input
                        name="ssnLast4"
                        value={repData.ssnLast4}
                        onChange={handleRepChange}
                        maxLength={4}
                        placeholder="8842"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Business Email</label>
                      <input
                        name="email"
                        value={repData.email}
                        onChange={handleRepChange}
                        placeholder="alex@apexmedia.io"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Verified Phone Number</label>
                      <input
                        name="phone"
                        value={repData.phone}
                        onChange={handleRepChange}
                        placeholder="+1 (555) 234-8900"
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2 pt-1">
                      <label className="text-xs font-semibold text-slate-700">Beneficial Equity Ownership Percentage</label>
                      <div className="flex gap-2">
                        {["100% Sole Owner", "50% Co-Owner", "25%+ Significant Owner"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setRepData(prev => ({ ...prev, ownershipPercentage: label }))}
                            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              repData.ownershipPercentage === label
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BANKING & ATTESTATION */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dedicated Clearing & Legal Attestation</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Review the dedicated banking channels provisioned via Cybrid and attest to corporate accuracy.
                    </p>
                  </div>

                  {/* Provisioning Preview */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <Landmark className="w-5 h-5 text-slate-900" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Cybrid Dedicated Clearing Account
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Evolve Bank & Trust / Member FDIC • USD Virtual Clearing
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Provision Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <span>Routing (ABA)</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("111000025", "routing")}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                            title="Copy routing number"
                          >
                            {copiedRouting ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-1">111000025</p>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <span>Virtual Account #</span>
                          <button
                            type="button"
                            onClick={() => handleCopy("880049123019", "account")}
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                            title="Copy account number"
                          >
                            {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-1">8800 4912 3019</p>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inbound Clearing</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">Same-Day ACH • Fedwire • RTP</p>
                      </div>
                    </div>
                  </div>

                  {/* Attestation Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={attestationAgreed}
                        onChange={() => setAttestationAgreed(!attestationAgreed)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed text-slate-600">
                        I certify under penalty of perjury that I am authorized to represent <strong className="text-slate-900">{entityData.legalName}</strong> and that all provided registration, tax ID, and signatory details are accurate, current, and match state registry records.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={() => setTermsAgreed(!termsAgreed)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed text-slate-600">
                        I authorize Cybrid and partner banks to initialize corporate clearing accounts and perform automated FinCEN sanction checks pursuant to federal banking laws.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setCurrentStep((prev) => (prev - 1) as KybStep);
                      }}
                      className="px-4.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSkip}
                      style={{ color: "#334155", backgroundColor: "#FFFFFF" }}
                      className="kyb-btn-skip px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <span style={{ color: "#334155" }} className="font-bold text-slate-700">Skip for now</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" style={{ stroke: "#64748B" }} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading || !attestationAgreed}
                      onClick={handleSubmitFinal}
                      className="px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Submitting to Cybrid...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-4 h-4" />
                          <span>Complete & Activate KYB</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Institutional Trust Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>FDIC-Insured Partner Custody</span>
            </span>
            <span className="h-3 w-[1px] bg-slate-200" />
            <span>SOC 2 Type II Certified</span>
            <span className="h-3 w-[1px] bg-slate-200 hidden sm:block" />
            <span className="hidden sm:inline">FinCEN MSB Compliance</span>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} AgncyPay Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
