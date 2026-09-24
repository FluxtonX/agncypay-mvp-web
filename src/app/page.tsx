"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Globe2,
  Layers,
  Lock,
  Mail,
  Percent,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

/* ─── Shared animation ease ─── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Data ─── */

const PAIN_POINTS = [
  {
    icon: FileText,
    title: "Manual Invoicing",
    desc: "Agencies create invoices across QuickBooks, Mainboard, MediaSlide — then email them to brands one-by-one.",
  },
  {
    icon: Mail,
    title: "Email-Based Payments",
    desc: "Brands receive invoices via email, pay outside the CRM through wire transfers or checks — zero visibility.",
  },
  {
    icon: Percent,
    title: "Manual Revenue Splits",
    desc: "Agencies manually split payments — 10% commission here, 90% talent payout there — in spreadsheets.",
  },
  {
    icon: Wallet,
    title: "Talent Left in the Dark",
    desc: "Creators have no real-time visibility into what they've earned, what's pending, or when they'll get paid.",
  },
];

const SOLUTIONS = [
  {
    icon: CreditCard,
    title: "Pay Widget for Brands",
    desc: "A white-label payment widget brands embed in their workflows. Approve an invoice, fund it, done — no emails, no wires.",
    tag: "For Brands",
  },
  {
    icon: Layers,
    title: "Agency Command Center",
    desc: "One dashboard to manage talent rosters, create invoices, automate commission splits, and track every dollar in or out.",
    tag: "For Agencies",
  },
  {
    icon: DollarSign,
    title: "Talent Balance & Payouts",
    desc: "Real-time liquidity balance, crystallized earnings, and instant payout requests — finally, full financial clarity for creators.",
    tag: "For Talent",
  },
];

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Real-Time Settlements",
    desc: "Payments move the moment they're approved. Track every settlement from brand wallet to talent balance — live.",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Executive-grade dashboards with deep visibility into payment flows, revenue allocation, and commission breakdowns.",
  },
  {
    icon: Users,
    title: "Multi-Stakeholder Management",
    desc: "Brands, agencies, and talent — all managed through a single platform. Every relationship, every payment, one source of truth.",
  },
  {
    icon: Shield,
    title: "Compliance Built-In",
    desc: "KYB/KYC verification, automated audit trails, and compliance controls woven into every transaction.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Bank-Grade Security",
    desc: "End-to-end encryption, MFA, role-based access, and SOC 2 Type II certified infrastructure protects every dollar.",
  },
  {
    icon: Globe2,
    title: "CRM Integration",
    desc: "Plug into QuickBooks, Mainboard, MediaSlide, and more. Invoice data flows in automatically — no double entry.",
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Invoice Created",
    desc: "Agency creates an invoice inside AgncyPay or syncs from their CRM — talent, amounts, and splits attached.",
  },
  {
    step: "02",
    title: "Brand Pays via Widget",
    desc: "Brand receives a pay link or embeds the AgncyPay widget. One click to review, approve, and fund.",
  },
  {
    step: "03",
    title: "Automatic Split",
    desc: "AgncyPay splits the payment: agency commission is deposited, talent earnings crystallize in real-time.",
  },
  {
    step: "04",
    title: "Talent Gets Paid",
    desc: "Creators see updated balances instantly — request payouts at any time, track every earning.",
  },
];

const TRUST_BADGES = [
  "SOC 2 Type II Certified",
  "End-to-end encryption (AES-256)",
  "Multi-factor authentication",
  "Role-based access control",
  "Complete audit trails",
  "PCI DSS compliant infrastructure",
];

/* ─── Reveal Component (scroll-triggered) ─── */

type RevealDirection = "up" | "down" | "left" | "right" | "zoom";

function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const offsets: Record<RevealDirection, { x: number; y: number; scale: number }> = {
    up: { x: 0, y: 40, scale: 0.98 },
    down: { x: 0, y: -40, scale: 0.98 },
    left: { x: -50, y: 0, scale: 0.98 },
    right: { x: 50, y: 0, scale: 0.98 },
    zoom: { x: 0, y: 20, scale: 0.94 },
  };
  const start = offsets[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x: start.x, y: start.y, scale: start.scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 1800;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Stat Card ─── */

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-8 text-center">
      <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 font-sans">
        <AnimatedNumber target={value} suffix={suffix} />
      </span>
      <span className="text-sm sm:text-base font-semibold text-slate-600 mt-1">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE (PURE WHITE / BLACK THEME)
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* ── MODERN HIGH-END NAVBAR ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all shadow-[0_2px_15px_rgba(0,0,0,0.03)]"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] duration-200" aria-label="AgncyPay home">
            <img
              src="/agncypaybrand-dark.png"
              alt="AgncyPay"
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Large Modern Nav Links */}
          <nav className="hidden items-center gap-10 md:flex">
            <a
              href="#problem"
              className="text-[15px] sm:text-base font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5"
            >
              Problem
            </a>
            <a
              href="#solution"
              className="text-[15px] sm:text-base font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5"
            >
              Solution
            </a>
            <a
              href="#features"
              className="text-[15px] sm:text-base font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5"
            >
              Features
            </a>
            <a
              href="#security"
              className="text-[15px] sm:text-base font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1.5"
            >
              Security
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/auth/login"
              className="text-[15px] sm:text-base font-bold text-slate-700 hover:text-slate-950 transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-6 sm:px-7 text-[14px] sm:text-[15px] font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-950/20 active:scale-95 cursor-pointer"
              style={{ color: "#FFFFFF" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="pt-20">
        {/* ── HERO SECTION ── */}
        <section className="relative min-h-[92vh] overflow-hidden border-b border-slate-200/80 bg-white flex items-center justify-center">
          {/* Subtle Clean Background Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-70" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

          <div className="relative z-10 mx-auto flex w-full max-w-[1140px] flex-col items-center justify-center px-6 py-20 sm:py-28 text-center">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-300/80 bg-slate-100/90 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              The Payment Layer for the Creative Economy
            </motion.div>

            {/* Giant High-Impact Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="max-w-[980px] text-5xl sm:text-7xl lg:text-[86px] font-black leading-[1.02] tracking-tight text-slate-950"
            >
              <span>Stop Chasing Payments.</span>
              <br />
              <span className="text-slate-600">Start Getting Paid.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mt-8 max-w-[740px] text-xl sm:text-2xl font-normal leading-relaxed text-slate-600"
            >
              AgncyPay connects brands, agencies, and talent on a single payment rail.
              Invoices flow in, payments split automatically, and creators see
              every dollar — in real time.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.48, ease: EASE }}
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row w-full sm:w-auto"
            >
              <Link
                href="/auth/register"
                className="group inline-flex h-14 w-full sm:w-[230px] items-center justify-center gap-3 rounded-2xl bg-slate-950 text-base font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-950/15 cursor-pointer"
                style={{ color: "#FFFFFF" }}
              >
                <span>Start Free</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: "#FFFFFF" }} />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-14 w-full sm:w-[230px] items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-base font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Schedule a Demo
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
              className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm font-semibold text-slate-500"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-slate-700" />
                Bank-Level Security
              </span>
              <span className="flex items-center gap-2.5">
                <Globe2 className="h-4 w-4 text-slate-700" />
                Global Infrastructure
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── STATS RIBBON ── */}
        <section className="border-b border-slate-200 bg-slate-50/80 py-6">
          <div className="mx-auto max-w-[1240px] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <Reveal delay={0}><StatCard value={3} suffix="" label="Stakeholders, One Rail" /></Reveal>
            <Reveal delay={0.08}><StatCard value={90} suffix="%" label="Faster Than Wire Transfers" /></Reveal>
            <Reveal delay={0.16}><StatCard value={100} suffix="%" label="Transparent Splits" /></Reveal>
            <Reveal delay={0.24}><StatCard value={0} suffix=" Emails" label="To Get Paid" /></Reveal>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section id="problem" className="relative overflow-hidden border-b border-slate-200 bg-white px-6 py-28 sm:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Reveal direction="zoom" className="mb-20 text-center">
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-4 py-1.5 rounded-full">
                The Problem
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950 max-w-[840px] mx-auto mt-4">
                The Creative Economy Runs on Broken Payment Rails
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-[680px] mx-auto font-normal leading-relaxed">
                Brands pay agencies manually. Agencies split payments in spreadsheets.
                Talent waits weeks — sometimes months — to get paid. Everyone loses.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PAIN_POINTS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.06}>
                    <article className="group relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-slate-950">{item.title}</h3>
                      <p className="text-base sm:text-lg leading-relaxed text-slate-600">{item.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── THE SOLUTION ── */}
        <section id="solution" className="relative overflow-hidden border-b border-slate-200 bg-slate-50/60 px-6 py-28 sm:py-32">
          <div className="relative z-10 mx-auto max-w-[1240px]">
            <Reveal direction="zoom" className="mb-20 text-center">
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-slate-800 bg-slate-200 border border-slate-300 px-4 py-1.5 rounded-full">
                The Solution
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950 max-w-[840px] mx-auto mt-4">
                One Platform, Three Experiences
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-[680px] mx-auto font-normal leading-relaxed">
                AgncyPay gives every player in the creative economy exactly what they need.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {SOLUTIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} direction="up" delay={i * 0.1}>
                    <article className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 min-h-[360px] transition-all duration-300 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/80 hover:-translate-y-1">
                      <span className="self-start mb-6 inline-flex items-center rounded-full bg-slate-950 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white" style={{ color: "#FFFFFF" }}>
                        {item.tag}
                      </span>

                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-950 group-hover:text-white">
                        <Icon className="h-7 w-7 transition-colors" />
                      </div>

                      <h3 className="mb-4 text-2xl font-black text-slate-950">{item.title}</h3>
                      <p className="text-base leading-relaxed text-slate-600 flex-1">{item.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-b border-slate-200 bg-white px-6 py-28 sm:py-32">
          <div className="mx-auto max-w-[1240px]">
            <Reveal direction="up" className="mb-20 text-center">
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full">
                How It Works
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950 mt-4">
                From Invoice to Payout in Minutes
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {WORKFLOW.map((item, i) => (
                <Reveal key={item.step} direction="up" delay={i * 0.08}>
                  <article className="relative group p-6 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                    <div className="mb-6 text-6xl font-black tracking-tight text-slate-300">
                      {item.step}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-950">{item.title}</h3>
                    <p className="text-base leading-relaxed text-slate-600">{item.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORM CAPABILITIES ── */}
        <section id="features" className="relative overflow-hidden border-b border-slate-200 bg-slate-50/50 px-6 py-28 sm:py-32">
          <div className="relative z-10 mx-auto max-w-[1240px]">
            <Reveal direction="zoom" className="mb-20 text-center">
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-200 border border-slate-300 px-4 py-1.5 rounded-full">
                Platform Capabilities
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950 mt-4">
                Built for Financial Operations at Scale
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-[680px] mx-auto font-normal leading-relaxed">
                Every feature engineered for operational excellence, precision splits, and institutional financial control.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CAPABILITIES.map((card, i) => {
                const Icon = card.icon;
                const dirs: RevealDirection[] = ["left", "up", "right", "left", "up", "right"];
                return (
                  <Reveal key={card.title} direction={dirs[i]} delay={(i % 3) * 0.08}>
                    <article className="group relative min-h-[250px] rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 transition-all duration-300 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1">
                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-900 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                        <Icon className="h-6 w-6 transition-colors" />
                      </div>
                      <h3 className="mb-3 text-xl font-bold text-slate-950">{card.title}</h3>
                      <p className="text-base leading-relaxed text-slate-600">{card.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section id="security" className="border-b border-slate-200 bg-white px-6 py-28 sm:py-32">
          <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div>
                <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full">
                  Security & Compliance
                </span>
                <h2 className="max-w-[540px] text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950 mt-4">
                  Enterprise-Grade Protection
                </h2>
                <p className="mt-6 max-w-[500px] text-lg font-normal leading-relaxed text-slate-600">
                  Built on bank-level infrastructure with comprehensive security
                  controls, compliance certifications, and institutional audit capabilities.
                </p>

                <div className="mt-8 space-y-4">
                  {TRUST_BADGES.map((item) => (
                    <div key={item} className="flex items-center gap-3.5 text-base font-semibold text-slate-700">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <div className="relative flex aspect-square max-w-[480px] mx-auto items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-12 overflow-hidden shadow-lg shadow-slate-200/50">
                {/* Clean concentric circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[85%] h-[85%] rounded-full border border-slate-200 animate-[spin_40s_linear_infinite]" />
                  <div className="absolute w-[60%] h-[60%] rounded-full border border-slate-300 animate-[spin_25s_linear_infinite_reverse]" />
                  <div className="absolute w-[38%] h-[38%] rounded-full border border-slate-300 animate-[spin_18s_linear_infinite]" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-md">
                    <Lock className="h-12 w-12 text-slate-900" strokeWidth={1.8} />
                  </div>
                  <span className="text-base font-bold text-slate-900 tracking-wide uppercase">Institutional Security</span>
                  <span className="text-xs font-semibold text-slate-500">256-Bit Encrypted Vault</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 px-6 py-28 sm:py-36 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

          <Reveal direction="zoom" className="relative z-10 mx-auto max-w-[840px]">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-950">
              Ready to Fix How the Creative Economy Gets Paid?
            </h2>
            <p className="mt-6 text-xl text-slate-600 font-normal max-w-[620px] mx-auto leading-relaxed">
              Join forward-thinking brands and agencies that are leaving spreadsheets, wire transfers, and payment chaos behind.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
              <Link
                href="/auth/register"
                className="group inline-flex h-14 w-full sm:w-[240px] items-center justify-center gap-3 rounded-2xl bg-slate-950 text-base font-bold text-white transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-950/15 cursor-pointer"
                style={{ color: "#FFFFFF" }}
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: "#FFFFFF" }} />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-14 w-full sm:w-[240px] items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-base font-bold text-slate-900 transition-all hover:bg-slate-100 hover:border-slate-400 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                Schedule a Demo
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white px-6 pb-12 pt-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-1 gap-12 border-b border-slate-200 pb-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand-dark.png"
                  alt="AgncyPay"
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </Link>
              <p className="mt-6 max-w-[280px] text-sm font-normal leading-relaxed text-slate-600">
                The payment layer for the creative economy — connecting brands, agencies, and talent on a single rail.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: "Pay Widget", href: "#solution" },
                { label: "Agency Dashboard", href: "#solution" },
                { label: "Talent Balances", href: "#solution" },
                { label: "Integrations", href: "#features" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Legal", href: "#" },
              ]}
            />
            <FooterColumn
              title="Resources"
              links={[
                { label: "Documentation", href: "#" },
                { label: "API Reference", href: "#" },
                { label: "Support", href: "#" },
                { label: "Status", href: "#" },
              ]}
            />
          </div>

          <div className="flex flex-col justify-between gap-5 pt-8 text-sm font-semibold text-slate-500 md:flex-row items-center">
            <p>© 2026 AgncyPay. All rights reserved.</p>
            <div className="flex gap-10">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Footer Column ─── */

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-slate-900">
        {title}
      </h3>
      <ul className="space-y-3.5 text-sm font-medium text-slate-600">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-slate-950">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
