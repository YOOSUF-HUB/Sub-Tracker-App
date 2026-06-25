import Link from "next/link";
import { CreditCard, LayoutDashboard, LogOut, Plus, WalletCards } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-container flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white shadow-sm transition-colors duration-200 dark:bg-slate-50 dark:text-slate-950">
              <WalletCards aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-semibold text-strong">Subscription Tracker</p>
              <p className="text-xs muted">Personal finance dashboard</p>
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
            <ThemeToggle />
            <form action={logoutAction}>
              <Button className="min-h-9 px-3 py-2" type="submit" variant="ghost">
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="app-container py-8 sm:py-10">{children}</main>
    </div>
  );
}
