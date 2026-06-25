import Link from "next/link";
import { CreditCard, LayoutDashboard, LogOut, Plus, WalletCards } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
              <WalletCards aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-semibold">Subscription Tracker</p>
              <p className="text-xs text-slate-500">Personal finance dashboard</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link className="nav-link" href="/dashboard">
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
              Dashboard
            </Link>
            <Link className="nav-link" href="/subscriptions">
              <CreditCard aria-hidden="true" className="h-4 w-4" />
              Subscriptions
            </Link>
            <Link className="nav-link-primary" href="/subscriptions/new">
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add
            </Link>
            <form action={logoutAction}>
              <button className="nav-link" type="submit">
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
