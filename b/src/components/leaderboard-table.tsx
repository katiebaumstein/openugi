"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Crown, Medal, ExternalLink, Info, Lock, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, isHuggingFaceLink, ideologyTone } from "@/lib/utils";
import type { Model } from "@/lib/data";

type Props = { data: Model[] };

type SortKey = "ugi-desc" | "ugi-asc" | "w10-desc" | "w10-asc";

export function LeaderboardTable({ data }: Props) {
  const t = useTranslations("leaderboard");
  const tf = useTranslations("filters");
  const tIdeo = useTranslations("ideologies");

  const [search, setSearch] = React.useState("");
  const [ideology, setIdeology] = React.useState<string>("__all__");
  const [sortMode, setSortMode] = React.useState<SortKey>("ugi-desc");

  const [sorting, setSorting] = React.useState<SortingState>([{ id: "ugi", desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    switch (sortMode) {
      case "ugi-desc": setSorting([{ id: "ugi", desc: true }]); break;
      case "ugi-asc":  setSorting([{ id: "ugi", desc: false }]); break;
      case "w10-desc": setSorting([{ id: "w10", desc: true }]); break;
      case "w10-asc":  setSorting([{ id: "w10", desc: false }]); break;
    }
  }, [sortMode]);

  React.useEffect(() => {
    setColumnFilters(() => {
      const fs: ColumnFiltersState = [];
      if (search) fs.push({ id: "model", value: search });
      if (ideology !== "__all__") fs.push({ id: "ideology", value: ideology });
      return fs;
    });
  }, [search, ideology]);

  const ideologies = React.useMemo(() => {
    const s = new Set<string>();
    for (const m of data) s.add(m.ideology || "Unknown");
    return Array.from(s).sort();
  }, [data]);

  const columns = React.useMemo<ColumnDef<Model>[]>(
    () => [
      {
        id: "rank",
        header: "#",
        cell: ({ row }) => {
          const i = row.index;
          return (
            <div className="flex items-center gap-2 font-mono tabular-nums text-muted-foreground">
              <span>{i + 1}</span>
              {i === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
              {i === 1 && <Medal className="h-4 w-4 text-slate-400" />}
              {i === 2 && <Medal className="h-4 w-4 text-amber-600" />}
            </div>
          );
        },
        enableSorting: false,
        size: 80,
      },
      {
        accessorKey: "model",
        header: t("model"),
        filterFn: (row, id, value) =>
          String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
        cell: ({ row }) => {
          const name = row.getValue<string>("model");
          const link = row.original.modelLink;
          // Upstream gave us a URL → link to it. HF links get a download icon (open weights).
          // No URL → closed/API-only model; render plain with a lock hint, no broken link.
          if (link) {
            const isHF = isHuggingFaceLink(link);
            return (
              <a
                href={link}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 hover:text-primary underline-offset-4 hover:underline font-medium"
                title={isHF ? "Open weights on Hugging Face" : "Open model page"}
              >
                {name}
                {isHF
                  ? <Download className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                  : <ExternalLink className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />}
              </a>
            );
          }
          return (
            <span
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground"
              title="Closed / API-only model — no downloadable weights"
            >
              {name}
              <Lock className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
            </span>
          );
        },
      },
      {
        accessorKey: "ugi",
        header: () => (
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold"
                  onClick={() => setSortMode((s) => (s === "ugi-desc" ? "ugi-asc" : "ugi-desc"))}
                >
                  {t("ugiScore")}
                  <Info className="h-3.5 w-3.5 opacity-60" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t("ugiTooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => {
          const v = row.getValue<number>("ugi");
          return (
            <span className="font-mono tabular-nums font-semibold text-ghibli-forest">
              {v.toFixed(2)}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "w10",
        header: () => (
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold"
                  onClick={() => setSortMode((s) => (s === "w10-desc" ? "w10-asc" : "w10-desc"))}
                >
                  {t("w10Score")}
                  <Info className="h-3.5 w-3.5 opacity-60" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t("w10Tooltip")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: ({ row }) => {
          const v = row.getValue<number>("w10");
          return (
            <span className="font-mono tabular-nums font-semibold text-ghibli-sunset">
              {v.toFixed(1)}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: "ideology",
        header: t("ideology"),
        filterFn: "equals",
        cell: ({ row }) => {
          const name = row.getValue<string>("ideology") || "Unknown";
          let display: string;
          try {
            display = tIdeo(name as never);
          } catch {
            display = name;
          }
          return (
            <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium ring-1 ring-inset", ideologyTone(name))}>
              {display}
            </span>
          );
        },
        size: 180,
      },
    ],
    [t, tIdeo]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rowCount = table.getFilteredRowModel().rows.length;

  return (
    <section id="rankings" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder={tf("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-card/80 backdrop-blur"
        />

        <Select value={ideology} onValueChange={setIdeology}>
          <SelectTrigger className="w-[200px] bg-card/80 backdrop-blur">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{tf("allIdeologies")}</SelectItem>
            {ideologies.map((i) => {
              let label: string;
              try { label = tIdeo(i as never); } catch { label = i; }
              return (
                <SelectItem key={i} value={i}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortKey)}>
          <SelectTrigger className="w-[180px] bg-card/80 backdrop-blur">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ugi-desc">{tf("sortUgiDesc")}</SelectItem>
            <SelectItem value="ugi-asc">{tf("sortUgiAsc")}</SelectItem>
            <SelectItem value="w10-desc">{tf("sortW10Desc")}</SelectItem>
            <SelectItem value="w10-asc">{tf("sortW10Asc")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-base text-muted-foreground">
          {t("modelsCount", { count: rowCount })}
        </div>
      </div>

      <div className="rounded-xl border bg-card/80 backdrop-blur overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-5 py-4 text-left font-semibold text-sm text-muted-foreground"
                      style={{ width: h.getSize() }}
                    >
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "border-t border-border/50 transition-colors hover:bg-accent/40",
                      i < 3 && "bg-primary/5"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {rowCount === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    {t("noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
