"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, hasAuthConfig, verifyPassword } from "@/lib/auth";
import { formDataToObject, loginSchema } from "@/lib/validation";

export type LoginState = {
  error?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.password?.[0] };
  }

  if (!hasAuthConfig()) {
    return {
      error: "Authentication is not configured. Set APP_PASSWORD and SESSION_SECRET.",
    };
  }

  if (!verifyPassword(parsed.data.password)) {
    return { error: "That password is not correct." };
  }

  await createSession();
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
