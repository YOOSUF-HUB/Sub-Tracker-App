"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  Edit3,
  Eye,
  GripVertical,
  PauseCircle,
  PlayCircle,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import {
  bulkDeleteSubscriptionsAction,
  bulkUpdateSubscriptionsAction,
  quickUpdateSubscriptionAction,
  updateSubscriptionPrioritiesAction,
} from "@/app/actions/subscriptions";
import { Badge, StatusBadge } from "@/components/badge";
import {
  formatCurrency,
  formatDate,
  humanizeBillingCycle,
} from "@/lib/format";
import type { Subscription, SubscriptionStatus } from "@/lib/types";

type SortMode = "priority" | "nextBillingAsc" | "nextBillingDesc";

export function SubscriptionManager({
  categories,
  subscriptions,
}: {
  categories: string[];
  subscriptions: Subscription[];
}) {
  const [rows, setRows] = useState(subscriptions);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<SubscriptionStatus | "all">("all");
  const [sort, setSort] = useState<SortMode>("priority");
  const [bulkStatus, setBulkStatus] = useState<SubscriptionStatus | "">("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkUnused, setBulkUnused] = useState<"unchanged" | "true" | "false">("unchanged");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredRows = useMemo(() => {
    const filtered = rows.filter((subscription) => {
      const matchesSearch =
        !search ||
        fuzzyMatch(subscription.name, search) ||
        fuzzyMatch(subscription.category, search);
      const matchesCategory = category === "all" || subscription.category === category;
      const matchesStatus = status === "all" || subscription.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "nextBillingAsc") {
        return a.nextBillingDate.localeCompare(b.nextBillingDate);
      }

      if (sort === "nextBillingDesc") {
        return b.nextBillingDate.localeCompare(a.nextBillingDate);
      }

      return (a.priority || Number.MAX_SAFE_INTEGER) - (b.priority || Number.MAX_SAFE_INTEGER);
    });
  }, [category, rows, search, sort, status]);

  const selectedCount = selectedIds.length;

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function selectVisible(checked: boolean) {
    setSelectedIds(checked ? filteredRows.map((subscription) => subscription.id) : []);
  }

  function saveQuickEdit(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await quickUpdateSubscriptionAction(id, formData);

      if (!result.ok) {
        setNotice(result.message);
        return;
      }

      setRows((current) =>
        current.map((subscription) =>
          subscription.id === id
            ? {
                ...subscription,
                name: String(formData.get("name")),
                category: String(formData.get("category")),
                price: Number(formData.get("price")),
                status: String(formData.get("status")) as SubscriptionStatus,
                nextBillingDate: String(formData.get("nextBillingDate")),
                isUnused: formData.get("isUnused") === "on",
                priority: Number(formData.get("priority") || 0),
              }
            : subscription,
        ),
      );
      setNotice("Saved.");
    });
  }

  function updateStatus(subscription: Subscription, nextStatus: SubscriptionStatus) {
    const formData = new FormData();
    formData.set("name", subscription.name);
    formData.set("category", subscription.category);
    formData.set("price", String(subscription.price));
    formData.set("status", nextStatus);
    formData.set("nextBillingDate", subscription.nextBillingDate);
    formData.set("priority", String(subscription.priority));

    if (subscription.isUnused) {
      formData.set("isUnused", "on");
    }

    saveQuickEdit(subscription.id, formData);
  }

  function applyBulkUpdate() {
    startTransition(async () => {
      const updates = {
        status: bulkStatus || undefined,
        category: bulkCategory.trim() || undefined,
        isUnused:
          bulkUnused === "unchanged" ? undefined : bulkUnused === "true",
      };

      const result = await bulkUpdateSubscriptionsAction(selectedIds, updates);

      if (!result.ok) {
        setNotice(result.message ?? "Bulk update failed.");
        return;
      }

      setRows((current) =>
        current.map((subscription) =>
          selectedIds.includes(subscription.id)
            ? {
                ...subscription,
                status: updates.status ?? subscription.status,
                category: updates.category ?? subscription.category,
                isUnused: updates.isUnused ?? subscription.isUnused,
              }
            : subscription,
        ),
      );
      setSelectedIds([]);
      setNotice("Bulk update applied.");
    });
  }

  function deleteSelected() {
    if (!window.confirm(`Delete ${selectedCount} selected subscription(s)?`)) {
      return;
    }

    startTransition(async () => {
      await bulkDeleteSubscriptionsAction(selectedIds);
      setRows((current) =>
        current.filter((subscription) => !selectedIds.includes(subscription.id)),
      );
      setSelectedIds([]);
      setNotice("Selected subscriptions deleted.");
    });
  }

  function dropOn(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const current = [...rows];
    const fromIndex = current.findIndex((subscription) => subscription.id === draggedId);
    const toIndex = current.findIndex((subscription) => subscription.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const reprioritized = current.map((subscription, index) => ({
      ...subscription,
      priority: index + 1,
    }));

    setRows(reprioritized);
    setDraggedId(null);
    startTransition(async () => {
      await updateSubscriptionPrioritiesAction(
        reprioritized.map((subscription) => ({
          id: subscription.id,
          priority: subscription.priority,
        })),
      );
      setNotice("Priority order saved.");
    });
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Manage</p>
          <h1 className="page-title">Subscriptions</h1>
        </div>
        <Link className="btn-primary justify-center" href="/subscriptions/new">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add subscription
        </Link>
      </div>

      <section className="card">
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="form-input pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Fuzzy search by name or category"
              value={search}
            />
          </div>
          <select className="form-input" onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="form-input" onChange={(event) => setStatus(event.target.value as SubscriptionStatus | "all")} value={status}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-input" onChange={(event) => setSort(event.target.value as SortMode)} value={sort}>
            <option value="priority">Priority order</option>
            <option value="nextBillingAsc">Billing date up</option>
            <option value="nextBillingDesc">Billing date down</option>
          </select>
        </div>
      </section>

      <section className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {selectedCount} selected
          </p>
          <select className="form-input lg:max-w-44" onChange={(event) => setBulkStatus(event.target.value as SubscriptionStatus | "")} value={bulkStatus}>
            <option value="">Keep status</option>
            <option value="active">Set active</option>
            <option value="paused">Set paused</option>
            <option value="cancelled">Set cancelled</option>
          </select>
          <input
            className="form-input lg:max-w-56"
            onChange={(event) => setBulkCategory(event.target.value)}
            placeholder="Set category"
            value={bulkCategory}
          />
          <select className="form-input lg:max-w-48" onChange={(event) => setBulkUnused(event.target.value as "unchanged" | "true" | "false")} value={bulkUnused}>
            <option value="unchanged">Keep unused flag</option>
            <option value="true">Flag unused</option>
            <option value="false">Clear unused</option>
          </select>
          <button className="btn-secondary justify-center" disabled={!selectedCount || isPending} onClick={applyBulkUpdate} type="button">
            <Save aria-hidden="true" className="h-4 w-4" />
            Apply bulk edit
          </button>
          <button className="btn-danger justify-center" disabled={!selectedCount || isPending} onClick={deleteSelected} type="button">
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Bulk delete
          </button>
        </div>
        {notice ? <p className="mt-3 text-sm text-slate-500">{notice}</p> : null}
      </section>

      <section className="table-shell">
        {filteredRows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-3 py-3">
                    <input
                      checked={
                        filteredRows.length > 0 &&
                        filteredRows.every((subscription) =>
                          selectedIds.includes(subscription.id),
                        )
                      }
                      onChange={(event) => selectVisible(event.target.checked)}
                      type="checkbox"
                    />
                  </th>
                  <th className="px-3 py-3 font-medium">Priority</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Next billing</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Flags</th>
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRows.map((subscription) => (
                  <QuickEditRow
                    draggedId={draggedId}
                    isPending={isPending}
                    isSelected={selectedIds.includes(subscription.id)}
                    key={`${subscription.id}-${subscription.status}-${subscription.price}-${subscription.nextBillingDate}-${subscription.priority}-${subscription.isUnused}`}
                    onDragStart={setDraggedId}
                    onDrop={dropOn}
                    onSave={saveQuickEdit}
                    onStatusChange={updateStatus}
                    onToggleSelected={toggleSelected}
                    subscription={subscription}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-strong">No subscriptions found</p>
            <p className="mt-1 text-sm muted">
              Add a subscription or adjust your filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function QuickEditRow({
  draggedId,
  isPending,
  isSelected,
  onDragStart,
  onDrop,
  onSave,
  onStatusChange,
  onToggleSelected,
  subscription,
}: {
  draggedId: string | null;
  isPending: boolean;
  isSelected: boolean;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
  onSave: (id: string, formData: FormData) => void;
  onStatusChange: (subscription: Subscription, status: SubscriptionStatus) => void;
  onToggleSelected: (id: string) => void;
  subscription: Subscription;
}) {
  return (
    <tr
      className="table-row"
      draggable
      onDragOver={(event) => event.preventDefault()}
      onDragStart={() => onDragStart(subscription.id)}
      onDrop={() => onDrop(subscription.id)}
      style={{ opacity: draggedId === subscription.id ? 0.5 : 1 }}
    >
      <td className="px-3 py-3">
        <input
          checked={isSelected}
          onChange={() => onToggleSelected(subscription.id)}
          type="checkbox"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <GripVertical aria-hidden="true" className="h-4 w-4 cursor-grab text-slate-400 dark:text-slate-500" />
          <input
            className="form-input h-9 w-20"
            defaultValue={subscription.priority}
            form={`quick-${subscription.id}`}
            min="0"
            name="priority"
            step="1"
            type="number"
          />
        </div>
      </td>
      <td className="px-3 py-3">
        <input
          className="form-input h-9 min-w-44"
          defaultValue={subscription.name}
          form={`quick-${subscription.id}`}
          name="name"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {humanizeBillingCycle(subscription.billingCycle, subscription.customIntervalDays)}
        </p>
      </td>
      <td className="px-3 py-3">
        <input
          className="form-input h-9 min-w-36"
          defaultValue={subscription.category}
          form={`quick-${subscription.id}`}
          name="category"
        />
      </td>
      <td className="px-3 py-3">
        <input
          className="form-input h-9 w-28"
          defaultValue={subscription.price}
          form={`quick-${subscription.id}`}
          min="0"
          name="price"
          step="0.01"
          type="number"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {formatCurrency(subscription.price, subscription.currency)}
        </p>
      </td>
      <td className="px-3 py-3">
        <input
          className="form-input h-9 min-w-36"
          defaultValue={subscription.nextBillingDate}
          form={`quick-${subscription.id}`}
          name="nextBillingDate"
          type="date"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {formatDate(subscription.nextBillingDate)}
        </p>
      </td>
      <td className="px-3 py-3">
        <select
          className="form-input h-9 min-w-28"
          defaultValue={subscription.status}
          form={`quick-${subscription.id}`}
          name="status"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="mt-2">
          <StatusBadge status={subscription.status} />
        </div>
      </td>
      <td className="px-3 py-3">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input
            defaultChecked={subscription.isUnused}
            form={`quick-${subscription.id}`}
            name="isUnused"
            type="checkbox"
          />
          Unused
        </label>
        {subscription.trialEndDate ? (
          <div className="mt-2">
            <Badge tone="blue">Trial</Badge>
          </div>
        ) : null}
      </td>
      <td className="px-3 py-3">
        <form
          id={`quick-${subscription.id}`}
          onSubmit={(event) => {
            event.preventDefault();
            onSave(subscription.id, new FormData(event.currentTarget));
          }}
        />
        <div className="flex justify-end gap-2">
          <button className="btn-icon" disabled={isPending} title="Save quick edit" type="submit" form={`quick-${subscription.id}`}>
            <Save aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </button>
          <button
            className="btn-icon"
            disabled={isPending}
            onClick={() =>
              onStatusChange(
                subscription,
                subscription.status === "paused" ? "active" : "paused",
              )
            }
            title={subscription.status === "paused" ? "Resume" : "Pause"}
            type="button"
          >
            {subscription.status === "paused" ? (
              <PlayCircle aria-hidden="true" className="h-4 w-4" />
            ) : (
              <PauseCircle aria-hidden="true" className="h-4 w-4" />
            )}
            <span className="sr-only">
              {subscription.status === "paused" ? "Resume" : "Pause"}
            </span>
          </button>
          <Link className="btn-icon" href={`/subscriptions/${subscription.id}`} title="View">
            <Eye aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
          <Link className="btn-icon" href={`/subscriptions/${subscription.id}/edit`} title="Full edit">
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Full edit</span>
          </Link>
        </div>
      </td>
    </tr>
  );
}

function fuzzyMatch(value: string, query: string) {
  const normalizedValue = value.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return true;
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return true;
  }

  let queryIndex = 0;

  for (const char of normalizedValue) {
    if (char === normalizedQuery[queryIndex]) {
      queryIndex += 1;
    }

    if (queryIndex === normalizedQuery.length) {
      return true;
    }
  }

  return false;
}
