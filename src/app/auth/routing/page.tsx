"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Server, Zap, CheckCircle2 } from "lucide-react";

function RoutingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination") || "/dashboard";
  
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Authenticating encrypted session...", icon: <ShieldCheck className="w-4 h-4 text-emerald-600" /> },
    { text: "Securing workspace clearing rails...", icon: <Server className="w-4 h-4 text-sky-600" /> },
    { text: "Preparing fintech dashboard...", icon: <Zap className="w-4 h-4 text-amber-600" /> }
  ];

  useEffect(() => {
    const step1 = setTimeout(() => setStep(1), 800);
    const step2 = setTimeout(() => setStep(2), 1600);
    
    const redirect = setTimeout(() => {
      router.push(destination);
    }, 2400);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(redirect);
    };
  }, [router, destination]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-slate-900 selection:text-white">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-sm w-full px-6">
        <motion.img 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          src="/agncypaybrand-dark.png" 
          alt="AgncyPay" 
          className="h-10 mb-10 object-contain"
        />

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mb-6 relative">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
            className="absolute top-0 left-0 h-full bg-slate-900 rounded-full"
          />
        </div>

        {/* Dynamic Status Text Card */}
        <div className="h-10 flex items-center justify-center px-4 py-2 rounded-full border border-slate-200 bg-white/90 shadow-2xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-xs font-semibold tracking-normal"
            >
              {steps[step].icon}
              <span className="text-slate-700">{steps[step].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function RoutingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse w-32 h-1.5 bg-slate-300 rounded-full" />
      </div>
    }>
      <RoutingContent />
    </Suspense>
  );
}
