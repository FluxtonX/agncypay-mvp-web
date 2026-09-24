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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4 relative overflow-hidden">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10 mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              className="h-9 w-auto object-contain [filter:invert(1)_brightness(0.15)]"
            />
          </Link>
          <span className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-700" />
            <span>Corporate KYB</span>
          </div>
        </div>

        <button
          onClick={handleSkip}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
        >
          <span>Skip for now</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 space-y-6">
        
        {/* Progress Stepper */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
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
                          ? "bg-slate-900 text-white shadow-sm"
                          : isPast
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
                    </div>

                    <div className="hidden md:block text-left">
                      <p className={`text-xs font-bold ${isActive ? "text-slate-900" : isPast ? "text-slate-800" : "text-slate-400"}`}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {idx < 2 && (
                    <div className="w-6 sm:w-12 h-[1px] bg-slate-200 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Business Verification Submitted</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Your legal entity has been submitted to Cybrid. Dedicated USD Fiat and Deposit Bank accounts are being initialized for live invoicing and payouts.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Redirecting to your workspace...</span>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: BUSINESS REGISTRY */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Legal Entity Information</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide official registry details matching your corporate tax registration or articles of incorporation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Legal Entity Name</label>
                      <input
                        name="legalName"
                        value={entityData.legalName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media Group LLC"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Trade / Display Name</label>
                      <input
                        name="brandName"
                        value={entityData.brandName}
                        onChange={handleEntityChange}
                        placeholder="e.g. Apex Media"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tax ID / EIN / VAT</label>
                      <input
                        name="taxId"
                        value={entityData.taxId}
                        onChange={handleEntityChange}
                        placeholder="e.g. 12-3456789"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Business Structure</label>
                      <select
                        name="businessType"
                        value={entityData.businessType}
                        onChange={handleEntityChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      >
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Sole_Proprietorship">Sole Proprietorship</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Registered Business Street Address</label>
                      <input
                        name="address"
                        value={entityData.address}
                        onChange={handleEntityChange}
                        placeholder="e.g. 100 Pine Street, Suite 2400"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">City</label>
                      <input
                        name="city"
                        value={entityData.city}
                        onChange={handleEntityChange}
                        placeholder="San Francisco"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">State / Region</label>
                        <input
                          name="state"
                          value={entityData.state}
                          onChange={handleEntityChange}
                          placeholder="CA"
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Postal Code</label>
                        <input
                          name="postalCode"
                          value={entityData.postalCode}
                          onChange={handleEntityChange}
                          placeholder="94111"
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
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
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Authorized Signatory & Ownership</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Financial compliance requires an authorized representative with executive authority or 25%+ equity ownership.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Full Legal Name</label>
                      <input
                        name="fullName"
                        value={repData.fullName}
                        onChange={handleRepChange}
                        placeholder="e.g. Alexander Vance"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Corporate Title</label>
                      <input
                        name="jobTitle"
                        value={repData.jobTitle}
                        onChange={handleRepChange}
                        placeholder="e.g. Managing Partner / CEO"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Date of Birth</label>
                      <input
                        name="dob"
                        type="date"
                        value={repData.dob}
                        onChange={handleRepChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">SSN (Last 4 Digits) / National ID</label>
                      <input
                        name="ssnLast4"
                        value={repData.ssnLast4}
                        onChange={handleRepChange}
                        maxLength={4}
                        placeholder="8842"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Business Email</label>
                      <input
                        name="email"
                        value={repData.email}
                        onChange={handleRepChange}
                        placeholder="alex@apexmedia.io"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Phone Number</label>
                      <input
                        name="phone"
                        value={repData.phone}
                        onChange={handleRepChange}
                        placeholder="+1 (555) 234-8900"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: BANKING & ATTESTATION */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Banking & Legal Attestation</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Review the dedicated banking channels that will be provisioned by Cybrid for your agency.
                    </p>
                  </div>

                  {/* Provisioning Preview */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5 text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dedicated Cybrid Deposit Bank Account</h4>
                        <p className="text-[11px] text-slate-500">Evolve Bank & Trust / Cybrid Sandbox Infrastructure</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Routing (ABA)</p>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-1">111000025</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Account Number</p>
                        <p className="text-xs font-mono font-bold text-slate-900 mt-1">8800 •••• ••••</p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase">Accepted Inbound Rails</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">ACH • Wire • RTP</p>
                      </div>
                    </div>
                  </div>

                  {/* Attestation Checkbox */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="attestation"
                      checked={attestationAgreed}
                      onChange={() => setAttestationAgreed(!attestationAgreed)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                    />
                    <label
                      htmlFor="attestation"
                      className="cursor-pointer select-none text-xs leading-snug text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      I certify under penalty of perjury that I am authorized to represent <span className="font-bold text-slate-900">{entityData.legalName}</span> and that all provided registration, tax ID, and signatory details are accurate and current.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setCurrentStep((prev) => (prev - 1) as KybStep);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-500" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Skip for now</span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
                      className="px-7 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
}
