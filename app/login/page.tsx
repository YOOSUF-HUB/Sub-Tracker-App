import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Personal access
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
          <p className="text-sm text-slate-500">
            Use your private app password to open the dashboard.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
