"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const t = useTranslations("theme");

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={t("toggle")}
      className="rounded-full shadow-sm backdrop-blur"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -12, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 12, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
