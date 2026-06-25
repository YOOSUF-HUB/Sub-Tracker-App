"use client";

import { useActionState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  createIncomeSourceAction,
  deleteIncomeSourceAction,
  updateIncomeSourceAction,
  type IncomeFormState,
} from "@/app/actions/income";
import { formatCurrency, humanizeIncomeType } from "@/lib/format";
import { incomeSourceTypes, type IncomeSource } from "@/lib/types";

const initialState: IncomeFormState = {};

export function IncomeManager({
  currency,
  incomeSources,
}: {
  currency: string;
  incomeSources: IncomeSource[];
}) {
  const [state, formAction, isPending] = useActionState(
    createIncomeSourceAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-slate-950">Monthly income</h2>
        <p className="text-sm text-slate-500">
          Total computed from salary, freelance, and passive income sources.
        </p>
      </div>

      <form action={formAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto]">
        <input className="form-input" name="name" placeholder="Source name" />
        <select className="form-input" defaultValue="salary" name="type">
          {incomeSourceTypes.map((type) => (
            <option key={type} value={type}>
              {humanizeIncomeType(type)}
            </option>
          ))}
        </select>
        <input className="form-input" min="0" name="amount" placeholder="Amount" step="0.01" type="number" />
        <input className="form-input" defaultValue={currency} maxLength={8} name="currency" placeholder="USD" />
        <button className="btn-primary justify-center" disabled={isPending} type="submit">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add
        </button>
        <input name="notes" type="hidden" value="" />
      </form>

      {state.message ? (
        <p className="mt-3 text-sm text-slate-500">{state.message}</p>
      ) : null}
      {state.fieldErrors ? (
        <p className="mt-3 text-sm text-red-600">
          {Object.values(state.fieldErrors).flat()[0]}
        </p>
      ) : null}

      <div className="mt-5 divide-y divide-slate-100">
        {incomeSources.length ? (
          incomeSources.map((source) => (
            <form
              action={updateIncomeSourceAction}
              className="grid gap-3 py-3 md:grid-cols-[1fr_0.8fr_0.7fr_0.6fr_auto_auto]"
              key={source.id}
            >
              <input name="id" type="hidden" value={source.id} />
              <input className="form-input" defaultValue={source.name} name="name" />
              <select className="form-input" defaultValue={source.type} name="type">
                {incomeSourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {humanizeIncomeType(type)}
                  </option>
                ))}
              </select>
              <input className="form-input" defaultValue={source.amount} min="0" name="amount" step="0.01" type="number" />
              <input className="form-input" defaultValue={source.currency} maxLength={8} name="currency" />
              <input name="notes" type="hidden" value={source.notes ?? ""} />
              <button className="btn-secondary justify-center" type="submit">
                <Save aria-hidden="true" className="h-4 w-4" />
                Save
              </button>
              <button
                className="btn-danger justify-center"
                formAction={deleteIncomeSourceAction}
                type="submit"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Delete
              </button>
            </form>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No income sources yet.
          </div>
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-slate-950">
        Visible total:{" "}
        {formatCurrency(
          incomeSources
            .filter((source) => source.currency === currency)
            .reduce((total, source) => total + source.amount, 0),
          currency,
        )}
      </p>
    </section>
  );
}
