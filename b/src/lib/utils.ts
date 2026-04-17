import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Classify a model's provider for visual distinction. Deliberately tiny — upstream Model Link is authoritative for URLs. */
export function isHuggingFaceLink(url: string | undefined | null): boolean {
  return !!url && /^https?:\/\/(www\.)?huggingface\.co\//i.test(url);
}

/** Classify ideology for coloring. Returns a Tailwind class suffix. */
export function ideologyTone(ideology: string): string {
  const map: Record<string, string> = {
    "Liberalism": "bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-blue-500/20",
    "Classical Liberalism": "bg-sky-500/15 text-sky-700 dark:text-sky-300 ring-sky-500/20",
    "Centrism": "bg-slate-500/15 text-slate-700 dark:text-slate-300 ring-slate-500/20",
    "Conservatism": "bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/20",
    "Moderate Conservatism": "bg-orange-500/15 text-orange-700 dark:text-orange-300 ring-orange-500/20",
    "Social Democracy": "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-500/20",
    "Social Liberalism": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 ring-indigo-500/20",
    "Unknown": "bg-muted text-muted-foreground ring-border",
    "NA": "bg-muted text-muted-foreground ring-border",
  };
  return map[ideology] ?? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20";
}
