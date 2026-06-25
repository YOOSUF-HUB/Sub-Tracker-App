"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label className="form-label" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          autoFocus
          className="form-input"
          id="password"
          name="password"
          placeholder="Enter app password"
          type="password"
        />
        {state.error ? <p className="form-error">{state.error}</p> : null}
      </div>
      <button className="btn-primary w-full justify-center" disabled={isPending} type="submit">
        <LockKeyhole aria-hidden="true" className="h-4 w-4" />
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
