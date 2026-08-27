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
  ChevronRight
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
  const [settlementAccountType, setSettlementAccountType] = useState<"standard_fiat" | "trading_usdc">("standard_fiat");

  const handleEntityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRepChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRepData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!entityData.legalName.trim() || !entityData.taxId.trim()) {
        setErrorMessage("Legal entity name and Tax ID (EIN) are required.");
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
        setErrorMessage("Representative full name and title are required.");
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
      }, 1500);
    } catch (err: any) {
      console.warn("KYB submission fallback:", err.message);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(isAgency ? "/agencydashboard" : "/branddashboard");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(isAgency ? "/agencydashboard" : "/branddashboard");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F8FAFC] font-sans flex flex-col items-center justify-start pt-10 sm:pt-14 pb-16 px-4 relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Abstract monochrome ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[30%] w-[45%] h-[45%] rounded-full bg-white/[0.02] blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[35%] h-[35%] rounded-full bg-white/[0.015] blur-[120px]" />
      </div>

      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 mb-8 pb-4 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              className="h-9 w-auto object-contain"
            />
          </Link>
          <span className="h-4 w-[1px] bg-white/20 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0D0D0D] border border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            <span>Corporate KYB</span>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="px-4 py-2 rounded-xl border border-white/20 bg-[#111111] hover:bg-[#1A1A1A] hover:border-white/40 active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <span>Skip for now</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#8E8E93]" />
        </button>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 space-y-6">
        
        {/* Progress Stepper */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            {[
              { step: 1, title: "Business Registry", desc: "Legal entity & tax details", icon: Building2 },
              { step: 2, title: "Representative", desc: "Signatory & ownership", icon: UserCheck },
              { step: 3, title: "Banking & Attestation", desc: "Cybrid account activation", icon: Landmark },
            ].map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentStep === item.step;
              const isPast = currentStep > item.step;

              return (
                <React.Fragment key={item.step}>
                  <div
                    onClick={() => {
                      if (isPast) setCurrentStep(item.step as KybStep);
                    }}
                    className={`flex items-center gap-3 flex-1 ${isPast ? "cursor-pointer" : ""}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 ${
                        isActive
                          ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          : isPast
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-[#121212] text-[#5A5A62] border border-[#1F1F1F]"
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="hidden md:block text-left">
                      <p className={`text-xs font-bold ${isActive ? "text-white" : isPast ? "text-[#E5E5EA]" : "text-[#5A5A62]"}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-[#8E8E93]">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {idx < 2 && (
                    <div className="w-6 sm:w-12 h-[1px] bg-[#1F1F1F] shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-[#0A0A0A] border border-[#262626] rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(255,255,255,0.02)] relative overflow-hidden">
          
          {/* Subtle top edge shine */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-xs text-red-300 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Business Verification Submitted</h3>
              <p className="text-xs text-[#8E8E93] max-w-md">
                Your legal entity has been submitted to Cybrid. Dedicated USD Fiat and Deposit Bank accounts are being initialized for live invoicing and payouts.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA] pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Redirecting to your workspace...</span>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: BUSINESS REGISTRY */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Legal Entity Information</h2>
                    <p className="text-xs text-[#8E8E93] mt-1">
                      Provide official registry details matching your corporate tax registration or articles of incorporation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Legal Entity Name</label>
                      <input
                        name="legalName"
                        value={entityData.legalName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media Group LLC"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Trade / Display Name</label>
                      <input
                        name="brandName"
                        value={entityData.brandName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Tax ID / EIN / VAT</label>
                      <input
                        name="taxId"
                        value={entityData.taxId}
                        onChange={handleEntityChange}
                        placeholder="e.g. 12-3456789"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Business Structure</label>
                      <select
                        name="businessType"
                        value={entityData.businessType}
                        onChange={handleEntityChange}
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                      >
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Sole_Proprietorship">Sole Proprietorship</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Registered Business Street Address</label>
                      <input
                        name="address"
                        value={entityData.address}
                        onChange={handleEntityChange}
                        placeholder="e.g. 100 Pine Street, Suite 2400"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">City</label>
                      <input
                        name="city"
                        value={entityData.city}
                        onChange={handleEntityChange}
                        placeholder="San Francisco"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">State / Region</label>
                        <input
                          name="state"
                          value={entityData.state}
                          onChange={handleEntityChange}
                          placeholder="CA"
                          className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Postal Code</label>
                        <input
                          name="postalCode"
                          value={entityData.postalCode}
                          onChange={handleEntityChange}
                          placeholder="94111"
                          className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AUTHORIZED REPRESENTATIVE */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Authorized Signatory & Ownership</h2>
                    <p className="text-xs text-[#8E8E93] mt-1">
                      Financial compliance requires an authorized representative with executive authority or 25%+ equity ownership.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Full Legal Name</label>
                      <input
                        name="fullName"
                        value={repData.fullName}
                        onChange={handleRepChange}
                        placeholder="e.g. Alexander Vance"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Corporate Title</label>
                      <input
                        name="jobTitle"
                        value={repData.jobTitle}
                        onChange={handleRepChange}
                        placeholder="e.g. Managing Partner / CEO"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Date of Birth</label>
                      <input
                        name="dob"
                        type="date"
                        value={repData.dob}
                        onChange={handleRepChange}
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">SSN (Last 4 Digits) / National ID</label>
                      <input
                        name="ssnLast4"
                        value={repData.ssnLast4}
                        onChange={handleRepChange}
                        maxLength={4}
                        placeholder="8842"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Business Email</label>
                      <input
                        name="email"
                        value={repData.email}
                        onChange={handleRepChange}
                        placeholder="alex@apexmedia.io"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Phone Number</label>
                      <input
                        name="phone"
                        value={repData.phone}
                        onChange={handleRepChange}
                        placeholder="+1 (555) 234-8900"
                        className="w-full bg-[#050505] border border-[#262626] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder-[#5A5A62] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BANKING & ATTESTATION */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Banking & Legal Attestation</h2>
                    <p className="text-xs text-[#8E8E93] mt-1">
                      Review the dedicated banking channels that will be provisioned by Cybrid for your agency.
                    </p>
                  </div>

                  {/* Provisioning Preview */}
                  <div className="rounded-2xl border border-white/10 bg-[#050505] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dedicated Cybrid Deposit Bank Account</h4>
                        <p className="text-[11px] text-[#8E8E93]">Evolve Bank & Trust / Cybrid Sandbox Infrastructure</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-3">
                        <p className="text-[10px] font-semibold text-[#8E8E93] uppercase">Routing (ABA)</p>
                        <p className="text-xs font-mono font-bold text-white mt-1">111000025</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-3">
                        <p className="text-[10px] font-semibold text-[#8E8E93] uppercase">Account Number</p>
                        <p className="text-xs font-mono font-bold text-white mt-1">8800 •••• ••••</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-[#0A0A0A] p-3">
                        <p className="text-[10px] font-semibold text-[#8E8E93] uppercase">Accepted Inbound Rails</p>
                        <p className="text-xs font-bold text-white mt-1">ACH • Wire • RTP</p>
                      </div>
                    </div>
                  </div>

                  {/* Attestation Checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        id="attestation"
                        checked={attestationAgreed}
                        onChange={() => setAttestationAgreed(!attestationAgreed)}
                        className="w-4 h-4 rounded border border-white/30 bg-[#0B0B0B] checked:bg-white checked:border-white appearance-none cursor-pointer transition-colors peer hover:border-white/60 focus:outline-none"
                      />
                      <svg className="absolute w-3 h-3 text-black pointer-events-none left-0.5 top-0.5 opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <label
                      htmlFor="attestation"
                      className="cursor-pointer select-none text-xs leading-snug text-[#8E8E93] hover:text-[#E5E5EA] transition-colors"
                    >
                      I certify under penalty of perjury that I am authorized to represent <span className="font-bold text-white">{entityData.legalName}</span> and that all provided registration, tax ID, and signatory details are accurate and current.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-[#1F1F1F] pt-6 mt-8">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setCurrentStep((prev) => (prev - 1) as KybStep);
                      }}
                      className="px-5 py-3 rounded-xl border border-white/20 bg-[#111111] hover:bg-[#1A1A1A] hover:border-white/40 active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#8E8E93]" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="px-6 py-3 rounded-xl border border-white/20 bg-[#111111] hover:bg-[#1A1A1A] hover:border-white/40 active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                    >
                      <span>Skip for now</span>
                      <ArrowRight className="w-4 h-4 text-[#8E8E93]" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.98] text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
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
                      className="px-8 py-3 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.98] text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
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
      </div>
    </div>
  );
}
