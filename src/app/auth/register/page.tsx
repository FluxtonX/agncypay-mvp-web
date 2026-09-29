"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { apiRegister } from "../../../lib/api/auth";
import { WorkspaceType } from "../../../types/workspace";

import { useApp } from "../../../context/AppContext";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";



export default function RegisterPage() {
  const router = useRouter();
  const { loginUser } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleType, setRoleType] = useState<"brand" | "agency">("brand");
  const accountType: WorkspaceType =
    roleType === "brand"
      ? "brand"
      : "agency";
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);

  const handlePrefillDemo = () => {
    setFullName("Martin Safi");
    setEmail(DEMO_EMAIL);
    setWorkspaceName("Adidas");
    setPassword(DEMO_PASSWORD);
    setConfirmPassword(DEMO_PASSWORD);
    setRoleType("brand");
    setAgree(true);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!fullName.trim()) nextErrors.fullName = "Name is required";
    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Invalid email format";
    }
    if (!workspaceName.trim()) {
      nextErrors.workspaceName = "Workspace name is required";
    }
    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }
    if (password && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }
    if (!agree) {
      nextErrors.agree = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    const normalizedWorkspaceName = workspaceName.trim();

    setIsLoading(true);
    try {
      const res = await apiRegister({
        email: normalizedEmail,
        password,
        fullName: normalizedName,
        accountType: roleType === "agency" ? "agency" : "brand",
        workspaceName: normalizedWorkspaceName,
      });

      if (res && res.user) {
        loginUser(res.user.email, res.user.fullName, res.user.accountType, {
          uid: res.user.id,
          agencyId: res.user.agncyId,
          workspaceName: normalizedWorkspaceName,
        });
      }

      if (roleType === "agency") {
        router.push("/onboarding/business-setup");
      } else {
        router.push("/branddashboard");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      setErrors({ email: error.message || "Failed to create account. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans relative overflow-hidden flex flex-col items-center justify-start pt-12 sm:pt-16 pb-16 px-4 transition-colors duration-200">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Demo Helper Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="px-4 py-2 bg-white/90 backdrop-blur-md border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-full transition-all shadow-sm cursor-pointer"
        >
          {showDemoHelper ? "Hide Demo" : "Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-xl shadow-slate-200/60 z-50 text-xs">
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Demo Registration</h4>
            <p className="mb-4 text-slate-500 leading-relaxed">Prefills a test brand workspace for instant sandbox verification.</p>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              Prefill Demo Data
            </button>
          </div>
        )}
      </div>

      {/* Brand Logo Header */}
      <div className="mb-8 text-center z-10">
        <Link href="/" className="inline-block transition-transform hover:scale-105 duration-300">
          <img
            src="/agncypaybrand-dark.png"
            alt="AgncyPay"
            className="h-11 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>
      </div>

      {/* Auth Form Card */}
      <div className="w-full max-w-[540px] z-10">
        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 relative overflow-hidden">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Join the unified payment rail built for agencies, brands, and creators.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Toggle */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Account Type</label>
              <div className="p-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-1">
                {[
                  { id: "brand", label: "Brand / Client" },
                  { id: "agency", label: "Agency / Vendor" },
                ].map((role) => (
                  <label
                    key={role.id}
                    className={`flex-1 flex justify-center py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer select-none ${
                      roleType === role.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="roleType"
                      value={role.id}
                      checked={roleType === role.id}
                      onChange={() => setRoleType(role.id as "brand" | "agency")}
                      className="hidden"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({});
                  }}
                  className={`w-full bg-slate-50/70 border ${errors.fullName ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-4 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none`}
                  placeholder="Martin Safi"
                />
                {errors.fullName && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5" htmlFor="email">Work Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className={`w-full bg-slate-50/70 border ${errors.email ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-4 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none`}
                  placeholder="you@company.com"
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5" htmlFor="workspaceName">Company / Workspace Name</label>
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value);
                    if (errors.workspaceName) setErrors({});
                  }}
                  className={`w-full bg-slate-50/70 border ${errors.workspaceName ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-4 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none`}
                  placeholder="e.g. Acme Media Corp"
                />
                {errors.workspaceName && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.workspaceName}</p>}
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({});
                  }}
                  className={`w-full bg-slate-50/70 border ${errors.password ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-4 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none`}
                  placeholder="Min. 8 characters"
                />
                {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>}
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({});
                  }}
                  className={`w-full bg-slate-50/70 border ${errors.confirmPassword ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-4 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Terms of Service Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5 cursor-pointer"
              />
              <label
                htmlFor="agree"
                className="cursor-pointer select-none text-xs leading-relaxed text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                I agree to the <span className="font-bold text-slate-900">Terms of Service</span> and{" "}
                <span className="font-bold text-slate-900">Privacy Policy</span>
              </label>
            </div>
            {errors.agree && (
              <p className="text-xs text-rose-500 font-medium">{errors.agree}</p>
            )}

            {errors.email && !errors.agree && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                {errors.email}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer mt-6 disabled:opacity-50 disabled:active:scale-100 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600">
              <Check className="h-4 w-4 text-emerald-600" />
              Instant workspace setup with automated settlement rails
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-slate-900 hover:underline transition-all">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
