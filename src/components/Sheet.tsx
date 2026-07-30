import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  kicker: string;
  title: string;
  titleId: string;
  variant?: "bottom" | "top";
  children: ReactNode;
}

export function Sheet({ open, onClose, kicker, title, titleId, variant = "bottom", children }: SheetProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isTopSheet = variant === "top";

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex justify-center bg-ink/36 px-5 animate-backdrop-in max-[460px]:px-0",
        isTopSheet ? "items-start pb-10 pt-0" : "items-end pb-0 pt-10",
      ].join(" ")}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "max-h-[min(88vh,740px)] w-full max-w-[420px] overflow-auto bg-surface p-5 shadow-[0_-18px_55px_rgba(22,32,51,0.18)]",
          isTopSheet
            ? "rounded-b-[28px] pt-5 animate-sheet-down"
            : "rounded-t-[28px] pt-3 animate-sheet-in",
        ].join(" ")}
      >
        <div className="mb-4 h-1.25 w-11 rounded-full bg-line" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="mb-0.5 text-xs font-bold uppercase tracking-normal text-muted">{kicker}</p>
            <h2 id={titleId} className="text-xl font-semibold leading-tight text-ink">
              {title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid h-9.5 w-9.5 flex-none place-items-center rounded-lg bg-surface text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
