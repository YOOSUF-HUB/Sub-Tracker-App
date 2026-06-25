"use server";

import { revalidatePath } from "next/cache";
import { createIncomeSource, deleteIncomeSource, updateIncomeSource } from "@/lib/income";
import { requireAuth } from "@/lib/auth";
import { formDataToObject, incomeSourceSchema } from "@/lib/validation";
import type { IncomeSourceInput } from "@/lib/types";

export type IncomeFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createIncomeSourceAction(
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  await requireAuth();

  const parsed = incomeSourceSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      message: "Please fix the income fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await createIncomeSource(parsed.data satisfies IncomeSourceInput);
  revalidatePath("/dashboard");

  return { message: "Income source added." };
}

export async function updateIncomeSourceAction(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") || "");
  const parsed = incomeSourceSchema.safeParse(formDataToObject(formData));

  if (!id || !parsed.success) {
    return;
  }

  await updateIncomeSource(id, parsed.data satisfies IncomeSourceInput);
  revalidatePath("/dashboard");
}

export async function deleteIncomeSourceAction(formData: FormData) {
  await requireAuth();

  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  await deleteIncomeSource(id);
  revalidatePath("/dashboard");
}
