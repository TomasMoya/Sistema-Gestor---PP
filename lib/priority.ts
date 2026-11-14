import type { Priority } from "./types";

export const PRIORITY_TAG: Record<Priority, { icon: string; label: string }> = {
  high: { icon: "keyboard_double_arrow_up", label: "Alta" },
  medium: { icon: "drag_handle", label: "Media" },
  low: { icon: "keyboard_arrow_down", label: "Baja" },
};

export const PRIORITY_FILTERS: { value: Priority; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];
