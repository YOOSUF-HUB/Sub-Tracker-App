"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import type { SubscriptionFormState } from "@/app/actions/subscriptions";
import type { BillingCycle, Subscription, SubscriptionStatus } from "@/lib/types";
import { billingCycles, subscriptionStatuses } from "@/lib/types";
import { humanizeBillingCycle, humanizeStatus } from "@/lib/format";

type SubscriptionFormProps = {
  action: (
    prevState: SubscriptionFormState,
    formData: FormData,
  ) => Promise<SubscriptionFormState>;
  subscription?: Subscription;
  categories?: string[];
  submitLabel: string;
};

const initialState: SubscriptionFormState = {};

export function SubscriptionForm({
  action,
  subscription,
  categories = [],
  submitLabel,
}: SubscriptionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription?.billingCycle ?? "monthly",
  );

  const value = (field: string, fallback: string | number | null | undefined = "") =>
    state.values?.[field] ?? String(fallback ?? "");

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Field error={state.fieldErrors?.name?.[0]} label="Name">
          <input
            className="form-input"
            defaultValue={value("name", subscription?.name)}
            id="name"
            name="name"
            placeholder="Netflix"
            required
          />
        </Field>

        <Field error={state.fieldErrors?.category?.[0]} label="Category">
          <input
            className="form-input"
            defaultValue={value("category", subscription?.category)}
            id="category"
            list="categories"
            name="category"
            placeholder="Entertainment"
            required
          />
          <datalist id="categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </Field>

        <Field error={state.fieldErrors?.price?.[0]} label="Price">
          <input
            className="form-input"
            defaultValue={value("price", subscription?.price)}
            id="price"
            min="0"
            name="price"
            placeholder="19.99"
            required
            step="0.01"
            type="number"
          />
        </Field>

        <Field error={state.fieldErrors?.currency?.[0]} label="Currency">
          <input
            className="form-input"
            defaultValue={value("currency", subscription?.currency ?? "USD")}
            id="currency"
            maxLength={8}
            name="currency"
            placeholder="USD"
            required
          />
        </Field>

        <Field error={state.fieldErrors?.billingCycle?.[0]} label="Billing cycle">
          <select
            className="form-input"
            defaultValue={value("billingCycle", subscription?.billingCycle ?? "monthly")}
            id="billingCycle"
            name="billingCycle"
            onChange={(event) => setBillingCycle(event.target.value as BillingCycle)}
          >
            {billingCycles.map((cycle) => (
              <option key={cycle} value={cycle}>
                {humanizeBillingCycle(cycle)}
              </option>
            ))}
          </select>
        </Field>

        {billingCycle === "custom" ? (
          <Field
            error={state.fieldErrors?.customIntervalDays?.[0]}
            label="Custom interval days"
          >
            <input
              className="form-input"
              defaultValue={value("customIntervalDays", subscription?.customIntervalDays)}
              id="customIntervalDays"
              min="1"
              name="customIntervalDays"
              placeholder="45"
              step="1"
              type="number"
            />
          </Field>
        ) : null}

        <Field error={state.fieldErrors?.nextBillingDate?.[0]} label="Next billing date">
          <input
            className="form-input"
            defaultValue={value("nextBillingDate", subscription?.nextBillingDate)}
            id="nextBillingDate"
            name="nextBillingDate"
            required
            type="date"
          />
        </Field>

        <Field error={state.fieldErrors?.status?.[0]} label="Status">
          <select
            className="form-input"
            defaultValue={value("status", subscription?.status ?? "active")}
            id="status"
            name="status"
          >
            {subscriptionStatuses.map((status) => (
              <option key={status} value={status}>
                {humanizeStatus(status as SubscriptionStatus)}
              </option>
            ))}
          </select>
        </Field>

        <Field error={state.fieldErrors?.paymentMethod?.[0]} label="Payment method">
          <input
            className="form-input"
            defaultValue={value("paymentMethod", subscription?.paymentMethod)}
            id="paymentMethod"
            name="paymentMethod"
            placeholder="Visa ending 4242"
          />
        </Field>

        <Field error={state.fieldErrors?.websiteUrl?.[0]} label="Website URL">
          <input
            className="form-input"
            defaultValue={value("websiteUrl", subscription?.websiteUrl)}
            id="websiteUrl"
            name="websiteUrl"
            placeholder="https://example.com"
            type="url"
          />
        </Field>
      </div>

      <Field error={state.fieldErrors?.description?.[0]} label="Description">
        <textarea
          className="form-textarea"
          defaultValue={value("description", subscription?.description)}
          id="description"
          name="description"
          placeholder="Family streaming plan"
          rows={3}
        />
      </Field>

      <Field error={state.fieldErrors?.notes?.[0]} label="Notes">
        <textarea
          className="form-textarea"
          defaultValue={value("notes", subscription?.notes)}
          id="notes"
          name="notes"
          placeholder="Renewal reminders, cancellation steps, or account details"
          rows={4}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <a className="btn-secondary justify-center" href="/subscriptions">
          Cancel
        </a>
        <button className="btn-primary justify-center" disabled={isPending} type="submit">
          <Save aria-hidden="true" className="h-4 w-4" />
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
