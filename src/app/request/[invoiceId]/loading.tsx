export default function RequestLoading() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1120px] items-center justify-between gap-4 px-4">
          <div className="h-9 w-28 rounded-xl bg-slate-200/80 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-xl bg-slate-200/80 animate-pulse" />
            <div className="h-9 w-20 rounded-xl bg-slate-200/80 animate-pulse" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1120px] px-4 py-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-10 w-28 rounded-lg bg-slate-200/80 animate-pulse" />
              <div className="h-4 w-40 rounded-md bg-slate-100 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-32 rounded-lg bg-slate-200/80 animate-pulse" />
              <div className="h-4 w-48 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="h-48 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
          <div className="h-28 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
        </div>
      </main>
    </div>
  );
}
