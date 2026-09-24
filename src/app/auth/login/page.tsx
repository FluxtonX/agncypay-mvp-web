"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, Building2, Briefcase } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { apiLogin } from "../../../lib/api/auth";

const DEMO_BRAND_EMAIL = "martin.safi@adidas.com";
const DEMO_AGENCY_EMAIL = "billing@creativeco.com";
const DEMO_PASSWORD = "password123";
const isGmailAddress = (value: string) => value.trim().toLowerCase().endsWith("@gmail.com");

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleType, setRoleType] = useState<"brand" | "agency">("brand");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [safeNextPath, setSafeNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextPath = params.get("next");
    setSafeNextPath(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null);
  }, []);

  const handlePrefill = (type: "brand" | "agency") => {
    setRoleType(type);
    setEmail(type === "brand" ? DEMO_BRAND_EMAIL : DEMO_AGENCY_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password && !isGmailAddress(email)) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();

    setIsLoading(true);
    try {
      const authData = await apiLogin({ email: normalizedEmail, password });
      const userProfile = authData.user;
      
      if (userProfile) {
        loginUser(
          userProfile.email,
          userProfile.fullName,
          userProfile.accountType,
          {
            workspaceName: `${userProfile.fullName}'s Workspace`,
            workspaceType: userProfile.accountType,
            agencyId: userProfile.agncyId,
            uid: userProfile.id,
            kybStatus: userProfile.kybStatus,
          }
        );

        if (userProfile.accountType === "agency") {
          const target = (safeNextPath && !safeNextPath.startsWith("/branddashboard")) ? safeNextPath : "/agencydashboard";
          router.push(`/auth/routing?destination=${encodeURIComponent(target)}`);
        } else {
          const target = (safeNextPath && !safeNextPath.startsWith("/agencydashboard")) ? safeNextPath : "/branddashboard/invoices";
          router.push(`/auth/routing?destination=${encodeURIComponent(target)}`);
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setErrors({ email: error.message || "Failed to log in. Please check your credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 selection:bg-slate-900 selection:text-white">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-70" />

      {/* Floating Demo Helper for verification/testing */}
      <div className="fixed top-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="px-4 py-2 bg-white/95 backdrop-blur-md border border-slate-200 hover:bg-white text-xs font-bold text-slate-800 hover:text-slate-950 rounded-full transition-all shadow-sm hover:shadow cursor-pointer"
        >
          {showDemoHelper ? "Hide Demo" : "Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-bold text-slate-900 mb-3 text-sm">Demo Accounts</h4>
            
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-700" /> Brand Demo
                </p>
                <p className="text-slate-600 font-mono text-[11px] truncate">{DEMO_BRAND_EMAIL}</p>
                <p className="text-slate-500 font-mono text-[10px] mt-0.5">Password: {DEMO_PASSWORD}</p>
                <button
                  type="button"
                  onClick={() => handlePrefill("brand")}
                  className="mt-2 w-full py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-[11px]"
                  style={{ color: "#FFFFFF" }}
                >
                  Prefill Brand
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-700" /> Agency Demo
                </p>
                <p className="text-slate-600 font-mono text-[11px] truncate">{DEMO_AGENCY_EMAIL}</p>
                <p className="text-slate-500 font-mono text-[10px] mt-0.5">Password: {DEMO_PASSWORD}</p>
                <button
                  type="button"
                  onClick={() => handlePrefill("agency")}
                  className="mt-2 w-full py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-[11px]"
                  style={{ color: "#FFFFFF" }}
                >
                  Prefill Agency
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-[540px] sm:max-w-[560px] z-10 space-y-6">
        {/* Logo Header */}
        <div className="text-center">
          <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
            <img 
              src="/agncypaybrand-dark.png" 
              alt="AgncyPay" 
              className="h-11 sm:h-12 w-auto object-contain mx-auto" 
            />
          </Link>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white border border-slate-200/90 rounded-[28px] sm:rounded-3xl p-8 sm:p-11 md:p-12 shadow-xl shadow-slate-200/60 relative">
          <div className="mb-7 text-center">
            <h2 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2 font-medium">
              Sign in to your AgncyPay {roleType === "brand" ? "Brand" : "Agency"} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Type Segmented Control */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider block">
                Account Type
              </label>
              <div className="p-1.5 bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-2">
                {[
                  { id: "brand", label: "Brand", icon: Building2 },
                  { id: "agency", label: "Agency", icon: Briefcase },
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = roleType === role.id;
                  return (
                    <label
                      key={role.id}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base font-bold rounded-xl transition-all duration-200 cursor-pointer select-none ${
                        isSelected
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="roleType"
                        value={role.id}
                        checked={isSelected}
                        onChange={() => setRoleType(role.id as "brand" | "agency")}
                        className="hidden"
                      />
                      <Icon className={`w-4 h-4 ${isSelected ? "text-slate-900" : "text-slate-500"}`} />
                      <span>{role.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className={`h-13 sm:h-14 w-full bg-white border ${errors.email ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} focus:ring-2 rounded-2xl px-4 sm:px-5 text-base text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs`}
                  placeholder={roleType === "brand" ? "you@brandcompany.com" : "you@agency.com"}
                />
              </div>
              {errors.email && (
                <span className="text-xs sm:text-sm text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({});
                  }}
                  className={`h-13 sm:h-14 w-full bg-white border ${errors.password ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"} pr-12 focus:ring-2 rounded-2xl px-4 sm:px-5 text-base text-slate-900 placeholder:text-slate-400 font-medium transition-all outline-none shadow-2xs`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5 text-slate-400" />}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs sm:text-sm text-rose-600 font-semibold flex items-center gap-1.5 mt-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-5 h-5 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer accent-slate-900"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-700 cursor-pointer hover:text-slate-900 transition-colors select-none font-medium"
              >
                Remember me for 30 days
              </label>
            </div>

            {errors.submit ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-semibold">
                {errors.submit}
              </div>
            ) : null}

            {/* Sign In CTA */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ color: "#FFFFFF" }}
              className="force-white-text !text-white w-full flex items-center justify-center gap-2.5 h-13 sm:h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] font-bold text-base sm:text-lg rounded-2xl transition-all duration-150 cursor-pointer mt-6 disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-slate-900/10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin !text-white" style={{ color: "#FFFFFF" }} />
                  <span style={{ color: "#FFFFFF" }} className="!text-white font-bold">Authenticating...</span>
                </>
              ) : (
                <>
                  <span style={{ color: "#FFFFFF" }} className="!text-white font-bold">Sign In</span>
                  <ArrowRight className="w-5 h-5 !text-white" style={{ color: "#FFFFFF" }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Elements */}
        <div className="space-y-4 text-center">
          <div className="text-sm text-slate-600 font-medium">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-slate-900 hover:underline font-bold ml-1 transition-colors">
              Sign up
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-bold tracking-wider uppercase">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Bank-Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
