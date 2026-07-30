import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MenuIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CalendarNavIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14v15H5z" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function ProductIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0M9 11h.01M15 11h.01" />
    </svg>
  );
}

export function BarsIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...props}>
      <path d="M5 19V9M12 19V5M19 19v-7" />
    </svg>
  );
}
