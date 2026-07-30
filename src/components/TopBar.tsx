import { MenuIcon } from "./icons";

interface TopBarProps {
  onOpenMenu: () => void;
  onOpenProfile: () => void;
}

export function TopBar({ onOpenMenu, onOpenProfile }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-5 pb-3 pt-7">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-surface text-ink transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
      >
        <MenuIcon />
      </button>
      <div>
        <h1 className="text-[1.36rem] font-semibold leading-tight text-ink">My Calendar</h1>
      </div>
      <button
        type="button"
        aria-label="Open profile"
        onClick={onOpenProfile}
        className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-[#243447] font-extrabold text-white transition hover:-translate-y-px active:translate-y-px active:scale-[0.98]"
      >
        LC
      </button>
    </header>
  );
}
