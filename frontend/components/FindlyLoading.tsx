import { Package, Search } from "lucide-react";

export default function FindlyLoading({ message = "Conectando pessoas aos seus pertences…", fullScreen = false }: { message?: string; fullScreen?: boolean }) {
  return <div role="status" aria-live="polite" className={`findly-loading flex flex-col items-center justify-center rounded-2xl bg-gray-50 px-6 py-12 text-center ${fullScreen ? "min-h-dvh" : "min-h-72"}`}>
    <div aria-hidden="true" className="relative mb-7 flex h-28 w-28 items-center justify-center">
      <div className="findly-loading-ring absolute inset-0 rounded-full border border-cyan-200" />
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-black text-white shadow-lg shadow-cyan-100"><Package size={36} strokeWidth={1.5} /></div>
      <div className="findly-loading-search absolute -right-1 bottom-0 rounded-full border-4 border-gray-50 bg-cyan-400 p-2 text-black"><Search size={26} strokeWidth={2} /></div>
    </div>
    <span aria-hidden="true" className="text-xl font-bold tracking-[0.24em] text-gray-950">FINDLY</span>
    <p className="mt-3 max-w-xs text-sm leading-6 text-gray-600">{message}</p>
    <div aria-hidden="true" className="mt-5 flex gap-2">{[0, 1, 2].map((dot) => <span key={dot} className="findly-loading-dot h-1.5 w-1.5 rounded-full bg-cyan-500" style={{ animationDelay: `${dot * 160}ms` }} />)}</div>
  </div>;
}
