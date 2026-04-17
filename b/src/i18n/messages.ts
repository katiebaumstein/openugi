import en from "../../messages/en.json";
import zh from "../../messages/zh.json";
import ar from "../../messages/ar.json";
import type { Locale } from "./config";

const bundles = { en, zh, ar } as const;

export function loadMessages(locale: Locale) {
  return bundles[locale];
}

export type Messages = typeof en;
