"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  bulkDeleteSubscriptions,
  bulkUpdateSubscriptions,
  createSubscription,
  deleteSubscription,
  updateSubscription,
  updateSubscriptionPriorities,
  updateSubscriptionQuick,
} from "@/lib/subscriptions";
import { requireAuth } from "@/lib/auth";
import {
  bulkSubscriptionSchema,
  formDataToObject,
  quickSubscriptionSchema,
  subscriptionSchema,
} from "@/lib/validation";
import type { BulkSubscriptionUpdate, QuickSubscriptionInput, SubscriptionInput } from "@/lib/types";

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

export async function quickUpdateSubscriptionAction(
  id: string,
  formData: FormData,
) {
  await requireAuth();

  const parsed = quickSubscriptionSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message:
        Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
        "Please fix the highlighted fields.",
    };
  }

  await updateSubscriptionQuick(id, parsed.data satisfies QuickSubscriptionInput);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${id}`);

  return { ok: true, message: "Saved." };
}

export async function bulkDeleteSubscriptionsAction(ids: string[]) {
  await requireAuth();

  await bulkDeleteSubscriptions(ids);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { ok: true };
}

export async function bulkUpdateSubscriptionsAction(
  ids: string[],
  updates: BulkSubscriptionUpdate,
) {
  await requireAuth();

  const parsed = bulkSubscriptionSchema.safeParse({
    ids,
    ...updates,
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose subscriptions and a valid bulk edit." };
  }

  await bulkUpdateSubscriptions(parsed.data.ids, {
    status: parsed.data.status,
    category: parsed.data.category || undefined,
    isUnused: parsed.data.isUnused,
  });

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { ok: true };
}

export async function updateSubscriptionPrioritiesAction(
  priorities: Array<{ id: string; priority: number }>,
) {
  await requireAuth();

  await updateSubscriptionPriorities(priorities);

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");

  return { ok: true };
}

function formValues(formData: FormData) {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    values[key] = String(value);
  }

  return values;
}
