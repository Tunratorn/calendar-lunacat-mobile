import { monthNames, weekdayNames } from "../lib/date";
import { PlusIcon } from "./icons";

interface DateHeroProps {
  date: Date;
  eventCount: number;
  holidayTitle?: string;
  onOpenCreateSheet: () => void;
}

export function DateHero({ date, eventCount, holidayTitle, onOpenCreateSheet }: DateHeroProps) {
  const eventLabel = eventCount === 1 ? "event" : "events";

  return (
    <section className="relative mx-5 mb-5 mt-2 flex items-center justify-between gap-4 rounded-3xl bg-[#dcefeb] p-5">
      <div className="min-w-0">
        <p className="mb-0.5 text-xs font-bold uppercase text-muted">{weekdayNames[date.getDay()]}</p>
        <h2 className="text-[2.25rem] leading-none font-semibold text-ink">
          {monthNames[date.getMonth()]} {date.getDate()}
        </h2>
        <p className="mt-2 mb-0 text-muted">
          {eventCount} {eventLabel} scheduled
        </p>
      </div>
      {holidayTitle && (
        <p className="absolute right-5 top-4 mb-0 max-w-28 text-right text-[0.72rem] font-black leading-tight text-[#b7342d] [overflow-wrap:anywhere]">
          {holidayTitle}
        </p>
      )}
      <div className="grid flex-none gap-2">
        <button
          type="button"
          aria-label="Create event"
          onClick={onOpenCreateSheet}
          className="grid h-14 w-14 place-items-center rounded-[18px] bg-accent text-accent-ink shadow-[0_16px_28px_rgba(20,108,100,0.28)] transition hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-px active:scale-[0.98] [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:rotate-90"
        >
          <PlusIcon />
        </button>
      </div>
    </section>
  );
}
