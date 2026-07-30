import { Sheet } from "./Sheet";

interface TasksSheetProps {
  open: boolean;
  onClose: () => void;
}

const tasks = [
  { label: "Confirm design review notes", done: true },
  { label: "Prepare reminder prototype", done: false },
  { label: "Send lunch location", done: false },
];

export function TasksSheet({ open, onClose }: TasksSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} kicker="Tasks" title="Today Checklist" titleId="info-title">
      <div className="grid gap-3">
        {tasks.map((task) => (
          <div
            key={task.label}
            className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border border-line bg-canvas p-4"
          >
            <span
              className={[
                "h-4.5 w-4.5 rounded-full border-2 border-accent",
                task.done ? "bg-accent shadow-[inset_0_0_0_4px_var(--color-canvas)]" : "",
              ].join(" ")}
            />
            <strong className="text-ink">{task.label}</strong>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
