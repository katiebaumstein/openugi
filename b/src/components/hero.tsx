"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("meta");
  const th = useTranslations("header");

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl border bg-card/60 p-8 backdrop-blur-md shadow-lg md:p-12"
    >
      {/* Soft Ghibli banner */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-banner.webp')" }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/logo.webp"
            alt="OpenUGI"
            width={120}
            height={120}
            priority
            className="drop-shadow-md"
          />
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tight text-shimmer sm:text-5xl md:text-6xl font-display text-balance">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg text-balance">
          {t("subtitle")}
        </p>

        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            {th("live")}
          </span>
          <a href="#rankings" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            {th("jumpToRankings")} ↓
          </a>
        </div>
      </div>
    </motion.header>
  );
}
