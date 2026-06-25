import { z } from "zod";
import { billingCycles, incomeSourceTypes, subscriptionStatuses } from "@/lib/types";

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

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .refine((value) => !value || isValidDateInput(value), "Enter a valid date.");

const checkboxValue = z.preprocess(
  (value) => value === "on" || value === "true" || value === "1" || value === true,
  z.boolean(),
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
    lastBilledDate: optionalDate,
    paymentMethod: optionalText,
    status: z.enum(subscriptionStatuses),
    priority: z.coerce
      .number()
      .int("Priority must be a whole number.")
      .min(0, "Priority cannot be negative.")
      .default(0),
    isUnused: checkboxValue.default(false),
    trialStartDate: optionalDate,
    trialEndDate: optionalDate,
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

    if (
      value.trialStartDate &&
      value.trialEndDate &&
      value.trialEndDate < value.trialStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trialEndDate"],
        message: "Trial end date must be after the start date.",
      });
    }
  })
  .transform((value) => ({
    ...value,
    customIntervalDays:
      value.billingCycle === "custom" ? value.customIntervalDays ?? null : null,
  }));

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

export const quickSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  category: z.string().trim().min(1, "Category is required."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  status: z.enum(subscriptionStatuses),
  nextBillingDate: z
    .string()
    .trim()
    .min(1, "Next billing date is required.")
    .refine(isValidDateInput, "Enter a valid next billing date."),
  isUnused: checkboxValue.default(false),
  priority: z.coerce
    .number()
    .int("Priority must be a whole number.")
    .min(0, "Priority cannot be negative.")
    .default(0),
});

export const bulkSubscriptionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one subscription."),
  status: z.enum(subscriptionStatuses).optional(),
  category: z.string().trim().optional(),
  isUnused: checkboxValue.optional(),
});

export const incomeSourceSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  type: z.enum(incomeSourceTypes),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  currency: z
    .string()
    .trim()
    .min(1, "Currency is required.")
    .max(8, "Use a short currency code.")
    .transform((value) => value.toUpperCase())
    .refine(isValidCurrency, "Enter a valid currency code."),
  notes: optionalText,
});

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
