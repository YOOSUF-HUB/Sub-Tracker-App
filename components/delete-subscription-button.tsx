"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteSubscriptionAction } from "@/app/actions/subscriptions";
import { cn } from "@/lib/utils";

type DeleteSubscriptionButtonProps = {
  id: string;
  label?: string;
  compact?: boolean;
};

export function DeleteSubscriptionButton({
  id,
  label = "Delete",
  compact = false,
}: DeleteSubscriptionButtonProps) {
  return (
    <form
      action={deleteSubscriptionAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this subscription? This cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <DeleteSubmit compact={compact} label={label} />
    </form>
  );
}

function DeleteSubmit({ label, compact }: { label: string; compact: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(compact ? "btn-danger-icon" : "btn-danger")}
      disabled={pending}
      title="Delete subscription"
      type="submit"
    >
      <Trash2 aria-hidden="true" className="h-4 w-4" />
      {compact ? <span className="sr-only">{label}</span> : pending ? "Deleting..." : label}
    </button>
  );
}
