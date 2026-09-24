export default function MainboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded-md bg-slate-200/80 animate-pulse" />
            <div className="h-5 w-44 rounded-lg bg-slate-200/80 animate-pulse" />
          </div>
          <div className="h-9 w-36 rounded-xl bg-slate-200/80 animate-pulse" />
        </div>
      </div>

      <main className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="h-3 w-28 rounded-md bg-slate-200/80 animate-pulse" />
              <div className="h-8 w-24 rounded-xl bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-36 rounded-md bg-slate-100 animate-pulse" />
            </div>
          ))}
        </section>

        <section className="mt-7 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-md bg-slate-200/80 animate-pulse" />
              <div className="h-3 w-48 rounded-md bg-slate-100 animate-pulse" />
            </div>
            <div className="h-9 w-28 rounded-xl bg-slate-200/80 animate-pulse" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
