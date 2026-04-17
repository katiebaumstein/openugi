"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Clock } from "lucide-react";

type Props = {
  totalModels: number;
  topUGI: number;
  lastUpdated: string;
};

export function StatsCards({ totalModels, topUGI, lastUpdated }: Props) {
  const t = useTranslations("stats");
  const formatted = new Date(lastUpdated).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = [
    { icon: TrendingUp, label: t("totalModels"), value: totalModels.toLocaleString(), tint: "text-ghibli-forest" },
    { icon: Trophy, label: t("topUGI"), value: topUGI.toFixed(2), tint: "text-ghibli-sunset" },
    { icon: Clock, label: t("lastUpdated"), value: formatted, tint: "text-ghibli-sky", small: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, label, value, tint, small }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08, ease: "easeOut" }}
        >
          <Card className="relative overflow-hidden bg-card/80">
            <div className="absolute inset-0 bg-ghibli-gradient opacity-40 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${tint}`} />
            </CardHeader>
            <CardContent className="relative">
              <div className={small ? "text-lg font-semibold" : "text-3xl font-bold font-display"}>
                {value}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
