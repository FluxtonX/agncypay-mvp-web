export default function PayRequestLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-28 rounded-xl bg-slate-200/80 animate-pulse" />
          <div className="h-5 w-40 rounded-lg bg-slate-200/80 animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-slate-200/80 animate-pulse" />
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.65fr)]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm space-y-6">
            <div className="h-4 w-36 rounded-md bg-slate-200/80 animate-pulse" />
            <div className="h-10 w-64 rounded-xl bg-slate-200/80 animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-11 w-20 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-11 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
              <div className="h-4 w-32 rounded-md bg-slate-200/80 animate-pulse" />
              <div className="h-8 w-44 rounded-xl bg-slate-200/80 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="h-4 w-28 rounded-md bg-slate-200/80 animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
