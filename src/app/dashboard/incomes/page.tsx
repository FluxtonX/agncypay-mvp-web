"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDynamicIncomes, modelIncomeItems, RemoteBrandImage } from "../../../components/dashboard/ModelAgencyDashboard";

export default function IncomesPage() {
  const router = useRouter();
  const [dynamicIncomes, setDynamicIncomes] = React.useState<any[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = React.useState(true);
  const [hasUpload, setHasUpload] = React.useState(false);

  React.useEffect(() => {
    const fetchRealData = async () => {
      // 1. Synchronously check and load from localStorage first (Stale-While-Revalidate)
      let uploadId = "";
      let cachedVendors = "";
      try {
        uploadId = localStorage.getItem("uploadedUploadId") || "";
        cachedVendors = localStorage.getItem("uploadedVendors") || "";
      } catch {}
      const userHasUpload = !!(uploadId || cachedVendors);
      setHasUpload(userHasUpload);

      // Load cached data immediately so there is zero delay for the user
      let hasRenderedCache = false;
      if (cachedVendors) {
        try {
          const parsed = JSON.parse(cachedVendors);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((v: any, index: number) => {
              const vName = v.vendor || "Unknown Vendor";
              const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
              const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
              return {
                slug: "uploaded-preview",
                name: vName,
                detail: `${vRowCount.toLocaleString()} transactions parsed`,
                date: "Parsed from Excel",
                amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                rawAmount: vNetIncome,
                src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                fallback: vName.substring(0, 2).toUpperCase(),
                className: "bg-[#111]",
                imageClassName: "scale-[1]",
              };
            });
            mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
            setDynamicIncomes(mapped);
            setIsLoadingIncomes(false);
            hasRenderedCache = true;
          }
        } catch (e) {
          console.error("Error parsing cached vendors on incomes page load:", e);
        }
      }

      // If there was no cached data to show, show the skeleton loader while we fetch
      if (!hasRenderedCache) {
        setIsLoadingIncomes(true);
      }

      // 2. Fetch live data from API in background
      if (uploadId) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
          const response = await fetch(`${apiBaseUrl}/api/excel/uploads/${uploadId}/summary`);
          
          if (response.status === 404) {
            // Upload was not found on the backend (e.g. after container restart or expiration)
            try {
              localStorage.removeItem("uploadedUploadId");
              localStorage.removeItem("uploadedFileName");
              localStorage.removeItem("uploadedFileSize");
              localStorage.removeItem("uploadedTotals");
              localStorage.removeItem("uploadedOriginalName");
              localStorage.removeItem("uploadedRowCount");
              localStorage.removeItem("uploadedVendors");
              localStorage.removeItem("uploadedIncomes");
            } catch {}
            setHasUpload(false);
            setDynamicIncomes([]);
            setIsLoadingIncomes(false);
          } else {
            const data = await response.json();

            if (response.ok && data?.success && data?.data?.vendors) {
              const vendors = data.data.vendors || [];
              localStorage.setItem("uploadedVendors", JSON.stringify(vendors));
              
              // Map the new incomes
              const mapped = vendors.map((v: any, index: number) => {
                const vName = v.vendor || "Unknown Vendor";
                const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
                const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
                return {
                  slug: "uploaded-preview",
                  name: vName,
                  detail: `${vRowCount.toLocaleString()} transactions parsed`,
                  date: "Parsed from Excel",
                  amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  rawAmount: vNetIncome,
                  src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                  fallback: vName.substring(0, 2).toUpperCase(),
                  className: "bg-[#111]",
                  imageClassName: "scale-[1]",
                };
              });

              // Sort descending by rawAmount
              mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
              setDynamicIncomes(mapped);
              setIsLoadingIncomes(false);
              return;
            } else if (data?.success === false && data?.error?.code === "NOT_FOUND") {
              try {
                localStorage.removeItem("uploadedUploadId");
                localStorage.removeItem("uploadedFileName");
                localStorage.removeItem("uploadedFileSize");
                localStorage.removeItem("uploadedTotals");
                localStorage.removeItem("uploadedOriginalName");
                localStorage.removeItem("uploadedRowCount");
                localStorage.removeItem("uploadedVendors");
                localStorage.removeItem("uploadedIncomes");
              } catch {}
              setHasUpload(false);
              setDynamicIncomes([]);
              setIsLoadingIncomes(false);
            }
          }
        } catch (err) {
          console.error("Failed to fetch API summary for incomes history page, falling back to cached state:", err);
          setIsLoadingIncomes(false);
        }
      } else {
        setIsLoadingIncomes(false);
      }
    };

    fetchRealData();
  }, []);

  const allIncomes = (hasUpload || dynamicIncomes.length > 0) ? dynamicIncomes : modelIncomeItems;

  const totalAmount = allIncomes.reduce((acc, item) => {
    const num = Number(item.amount.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 sm:px-6 lg:px-8 font-sans">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black leading-none text-slate-900 tracking-tight">
          Recent Incomes
        </h1>
        <p className="mt-2 text-xs font-medium text-slate-500">
          Full history of your income and parsed vendor payouts.
        </p>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Income History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Parsed earnings from statement uploads</p>
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[900px] table-fixed text-left w-full text-xs">
            <colgroup>
              <col className="w-[280px]" />
              <col className="w-[220px]" />
              <col className="w-[180px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead>
              <tr className="h-11 border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="pl-3 pr-4">Source / Vendor</th>
                <th>Detail</th>
                <th>Date</th>
                <th className="text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allIncomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-28 text-center text-xs font-medium text-slate-500">
                    No income data found. Upload an Excel file to get started.
                  </td>
                </tr>
              ) : (
                allIncomes.map((item, i) => (
                  <tr
                    key={`${item.name}-${i}`}
                    onClick={() => {
                      if (item.slug === "uploaded-preview") {
                        window.location.href = "/dashboard/incomes/preview";
                      }
                    }}
                    className={cn(
                      "h-16 border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50/70",
                      item.slug === "uploaded-preview" && "cursor-pointer"
                    )}
                  >
                    <td className="pl-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <div className={cn("h-full w-full overflow-hidden rounded-lg", item.className)}>
                            <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-600 font-medium">{item.detail}</td>
                    <td className="text-slate-500">{item.date}</td>
                    <td className="text-right pr-4 font-black text-emerald-600">{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {allIncomes.length > 0 && (
          <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
            <div className="flex w-full max-w-[300px] items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Income</span>
              <span className="text-xl font-black tracking-tight text-emerald-600">
                {formattedTotal}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
