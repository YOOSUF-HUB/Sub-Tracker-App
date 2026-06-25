import { z } from "zod";
import { billingCycles, subscriptionStatuses } from "@/lib/types";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .refine((value) => !value || isValidUrl(value), "Enter a valid URL.");

const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive("Enter a positive number.").optional(),
);

export const loginSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

export const subscriptionSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required."),
    description: optionalText,
    category: z.string().trim().min(1, "Category is required."),
    price: z.coerce.number().positive("Price must be greater than 0."),
    currency: z
      .string()
      .trim()
      .min(1, "Currency is required.")
      .max(8, "Use a short currency code.")
      .transform((value) => value.toUpperCase())
      .refine(isValidCurrency, "Enter a valid currency code."),
    billingCycle: z.enum(billingCycles),
    customIntervalDays: optionalPositiveInteger,
    nextBillingDate: z
      .string()
      .trim()
      .min(1, "Next billing date is required.")
      .refine(isValidDateInput, "Enter a valid next billing date."),
    paymentMethod: optionalText,
    status: z.enum(subscriptionStatuses),
    websiteUrl: optionalUrl,
    notes: optionalText,
  })
  .superRefine((value, ctx) => {
    if (value.billingCycle === "custom" && !value.customIntervalDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customIntervalDays"],
        message: "Custom billing needs an interval in days.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    customIntervalDays:
      value.billingCycle === "custom" ? value.customIntervalDays ?? null : null,
  }));

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCurrency(value: string) {
  try {
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: value,
    });
    return true;
  } catch {
    return false;
  }
}
