import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAuthenticated } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 transition-colors duration-200 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <section className="card w-full max-w-md p-8">
        <div className="space-y-2">
          <p className="eyebrow uppercase tracking-wide">
            Personal access
          </p>
          <h1 className="text-2xl font-semibold text-strong">Sign in</h1>
          <p className="text-sm muted">
            Use your private app password to open the dashboard.
          </p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
