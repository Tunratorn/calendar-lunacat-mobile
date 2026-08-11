import type { View } from "../types";
import { CalendarNavIcon, ProductIcon } from "./icons";

interface BottomNavProps {
  activeView: View;
  onSelectView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: typeof CalendarNavIcon }[] = [
  { view: "calendar", label: "Calendar", icon: CalendarNavIcon },
  { view: "product", label: "Product", icon: ProductIcon },
];

export function BottomNav({ activeView, onSelectView }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-5 bottom-5 z-40 flex items-center justify-around gap-2 rounded-3xl border border-ink/8 bg-white/94 p-2 shadow-[0_18px_44px_rgba(22,32,51,0.18)] backdrop-blur-md"
    >
      {navItems.map(({ view, label, icon: Icon }) => {
        const isActive = activeView === view;
        return (
          <button
            key={view}
            type="button"
            aria-label={label}
            onClick={() => onSelectView(view)}
            className={[
              "flex min-h-13.5 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.7rem] font-extrabold transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]",
              isActive ? "animate-soft-pop bg-[#e5efed] text-accent" : "bg-transparent text-muted",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
