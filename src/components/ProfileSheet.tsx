import { Sheet } from "./Sheet";

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} kicker="Profile" title="Lunacat" titleId="info-title">
      <div className="grid gap-4">
        <div className="grid justify-items-center gap-2 rounded-2xl border border-line bg-canvas p-5 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-[#243447] font-black text-white">
            LC
          </div>
          <strong className="text-ink">Lunacat Calendar</strong>
          <span className="text-[0.84rem] text-muted">Demo account for stakeholder walkthrough</span>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Default calendar</span>
            <strong className="text-ink">Work</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Timezone</span>
            <strong className="text-ink">Asia/Bangkok</strong>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-canvas px-4 py-3">
            <span className="text-[0.84rem] text-muted">Reminders</span>
            <strong className="text-ink">15 min before</strong>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
