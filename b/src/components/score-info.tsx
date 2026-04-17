"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

export function ScoreInfo() {
  const t = useTranslations("info");
  const [open, setOpen] = React.useState(true);

  const ugiFactors = t.raw("ugiFactors") as string[];
  const w10Factors = t.raw("w10Factors") as string[];

  return (
    <motion.details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="group"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border bg-card/80 p-4 backdrop-blur shadow-sm hover:bg-card">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">📊</span> {t("understandingScores")}
        </h2>
        <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/images/ugi-icon.webp" alt="" width={48} height={48} className="rounded-full" />
              <div>
                <h3 className="font-semibold text-lg">{t("ugiScoreTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("ugiRange")}</p>
              </div>
            </div>
            <p className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: t.raw("ugiDescription") as string }} />
            <h4 className="text-sm font-semibold mb-2">{t("keyFactors")}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
              {ugiFactors.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/images/w10-icon.webp" alt="" width={48} height={48} className="rounded-full" />
              <div>
                <h3 className="font-semibold text-lg">{t("w10ScoreTitle")}</h3>
                <p className="text-xs text-muted-foreground">{t("w10Range")}</p>
              </div>
            </div>
            <p className="text-sm mb-3" dangerouslySetInnerHTML={{ __html: t.raw("w10Description") as string }} />
            <h4 className="text-sm font-semibold mb-2">{t("keyFactors")}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
              {w10Factors.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm" dangerouslySetInnerHTML={{ __html: t.raw("methodologyNote") as string }} />
    </motion.details>
  );
}
