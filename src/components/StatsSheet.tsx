import { Sheet } from "./Sheet";

interface StatsSheetProps {
  open: boolean;
  onClose: () => void;
}

const stats = [
  { label: "Events", value: "12" },
  { label: "Focus", value: "7h" },
  { label: "Free blocks", value: "4" },
];

export function StatsSheet({ open, onClose }: StatsSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} kicker="Stats" title="Week Snapshot" titleId="info-title">
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="grid gap-1 rounded-2xl border border-line bg-canvas px-2 py-4 text-center">
              <strong className="text-[1.32rem] text-ink">{stat.value}</strong>
              <span className="text-[0.84rem] text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Busiest day</span>
            <strong className="text-ink">Wednesday</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Top calendar</span>
            <strong className="text-ink">Work</strong>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
