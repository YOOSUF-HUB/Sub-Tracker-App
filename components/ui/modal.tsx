import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({
  children,
  onClose,
  open,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <section className="card w-full max-w-lg shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="section-title">{title}</h2>
          <Button aria-label="Close modal" onClick={onClose} type="button" variant="icon">
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
