"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const dataSourced = t.raw("dataSourced") as string;
  const linkLabel = t("ugiLeaderboard");

  // Replace {link} placeholder with an <a>
  const [before, after] = dataSourced.split("{link}");

  return (
    <footer className="relative mt-12 overflow-hidden rounded-3xl border bg-card/70 backdrop-blur">
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: "url('/images/footer-scenery.webp')" }}
      />
      <div className="relative p-6 text-center text-sm space-y-2">
        <p>
          {before}
          <a
            href="https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard"
            target="_blank"
            rel="noopener"
            className="text-primary hover:underline underline-offset-4"
          >
            {linkLabel}
          </a>
          {after}
        </p>
        <p className="text-muted-foreground">{t("note")}</p>
        <p className="text-xs text-muted-foreground/60">{t("poweredBy")}</p>
      </div>
    </footer>
  );
}
