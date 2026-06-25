"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubscription, deleteSubscription, updateSubscription } from "@/lib/subscriptions";
import { requireAuth } from "@/lib/auth";
import { formDataToObject, subscriptionSchema } from "@/lib/validation";
import type { SubscriptionInput } from "@/lib/types";

export type SubscriptionFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

export async function createSubscriptionAction(
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  await requireAuth();

  const parsed = subscriptionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: formValues(formData),
    };
  }

  const id = await createSubscription(parsed.data satisfies SubscriptionInput);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  redirect(`/subscriptions/${id}`);
}

export async function updateSubscriptionAction(
  id: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  await requireAuth();

  const parsed = subscriptionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: formValues(formData),
    };
  }

  await updateSubscription(id, parsed.data satisfies SubscriptionInput);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${id}`);
  redirect(`/subscriptions/${id}`);
}

export async function deleteSubscriptionAction(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") || "");

  if (!id) {
    redirect("/subscriptions");
  }

  await deleteSubscription(id);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

function formValues(formData: FormData) {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    values[key] = String(value);
  }

  return values;
}
