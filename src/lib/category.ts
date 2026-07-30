import type { Category } from "../types";

export const categoryBorderClass: Record<Category, string> = {
  work: "border-l-accent",
  personal: "border-l-coral",
  focus: "border-l-amber",
};

export const categoryDotClass: Record<Category, string> = {
  work: "bg-accent",
  personal: "bg-coral",
  focus: "bg-amber",
};
