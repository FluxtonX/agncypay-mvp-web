"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";

type Article = {
  title: string;
  body: string;
};

const articles: Article[] = [
  {
    title: "How to approve and pay invoices",
    body: "Open Invoices, choose View Detail, review line items and totals, then select Approve & Pay. The invoice will move into the payment processing workflow.",
  },
  {
    title: "Setting up bank account connections",
    body: "Go to Wallet and add a payment method. Enter the bank label, last four digits, and opening balance. Verified accounts can be used for settlement workflows.",
  },
  {
    title: "Understanding payment fees and processing times",
    body: "AgencyPay fees are shown alongside each invoice. ACH payments usually settle within 1-3 business days while wire transfers are reflected faster.",
  },
  {
    title: "Managing team members and permissions",
    body: "Open Settings, invite a team member, and assign Admin, Approver, or Viewer roles. Role changes take effect immediately in this frontend workflow.",
  },
  {
    title: "Connecting your CRM system",
    body: "Use Settings > Integrations to connect Salesforce CRM, QuickBooks, or Slack. Connected systems can sync invoices, payment statuses, and activity events.",
  },
  {
    title: "Configuring payment approval workflows",
    body: "Use Settings to enable MFA, adjust session timeout, and manage approver roles. Approval rules help keep high-value settlements controlled.",
  },
];

function SupportCard({
  icon,
  title,
  description,
  buttonLabel,
  primary = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
          {icon}
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`mt-5 h-9 w-full rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
          primary
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {buttonLabel}
      </button>
    </section>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-xs">
      <section className="w-full max-w-[520px] rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl text-slate-900">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [modal, setModal] = useState<"docs" | "chat" | null>(null);
  const [chatMessages, setChatMessages] = useState([
    "Hi, this is AgencyPay Support. How can we help today?",
  ]);
  const [chatDraft, setChatDraft] = useState("");

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return articles;

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.body.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const sendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatDraft.trim()) return;

    setChatMessages((messages) => [
      ...messages,
      chatDraft.trim(),
      "Thanks. A support specialist will review this and follow up shortly.",
    ]);
    setChatDraft("");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Help &amp; Support
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search answers, browse documentation guides, or contact specialist support.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search help articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles, guides, or keywords..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SupportCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Documentation"
          description="Comprehensive guides, split formulas, and API references."
          buttonLabel="Browse Docs"
          onClick={() => setModal("docs")}
        />
        <SupportCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="Live Chat"
          description="Chat with our settlement and integration team in real-time."
          buttonLabel="Start Chat"
          primary
          onClick={() => setModal("chat")}
        />
        <SupportCard
          icon={<Mail className="h-5 w-5" />}
          title="Email Support"
          description="Send us a detailed message and receive a response within 24h."
          buttonLabel="Send Email"
          onClick={() => {
            window.location.href =
              "mailto:support@agncypay.com?subject=AgencyPay support request";
          }}
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Popular Help Articles
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Quick guides to frequent operations in AgncyPay.</p>

        <div className="mt-4 space-y-2.5">
          {filteredArticles.map((article) => (
            <button
              key={article.title}
              type="button"
              onClick={() => setOpenArticle(article)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 text-left text-sm font-semibold text-slate-800 transition-all hover:bg-white hover:border-slate-300 hover:shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-slate-600 shadow-2xs">
                  <FileText className="h-4 w-4" />
                </div>
                <span>{article.title}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
          {filteredArticles.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center text-xs text-slate-400">
              No matching help articles found.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900">
              System Status: All Systems Operational
            </h2>
            <p className="mt-0.5 text-xs text-slate-600">
              All AgncyPay payment rails, Net-0 payouts, and ERP synchronizers are running normally.{" "}
              <button
                type="button"
                onClick={() => alert("Status check: API, payment rail, CRM sync, and webhooks are 100% operational.")}
                className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 cursor-pointer"
              >
                View status ledger
              </button>
            </p>
          </div>
        </div>
      </section>

      {openArticle && (
        <Modal title={openArticle.title} onClose={() => setOpenArticle(null)}>
          <p className="text-sm leading-relaxed text-slate-600">{openArticle.body}</p>
        </Modal>
      )}

      {modal === "docs" && (
        <Modal title="Documentation Guides" onClose={() => setModal(null)}>
          <div className="space-y-2">
            {["Invoice and Split Workflows", "Bank Rails & ACH Timing", "Agency-Talent Delegation", "Developer Webhooks & API"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOpenArticle(articles[0])}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-left text-xs font-semibold text-slate-800 hover:bg-white hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>{item}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "chat" && (
        <Modal title="Support Live Chat" onClose={() => setModal(null)}>
          <div className="max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
            {chatMessages.map((message, index) => (
              <div
                key={`${message}-${index}`}
                className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                  index % 2 === 0
                    ? "bg-slate-100 text-slate-800 self-start"
                    : "bg-slate-900 text-white ml-auto"
                }`}
              >
                {message}
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="mt-4 flex gap-2 pt-3 border-t border-slate-100">
            <input
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Type your question..."
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              Send
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
