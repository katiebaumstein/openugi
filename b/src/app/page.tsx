import { cookies } from "next/headers";
import Image from "next/image";

import { loadSnapshot, getStats } from "@/lib/data";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { Hero } from "@/components/hero";
import { StatsCards } from "@/components/stats-cards";
import { ScoreInfo } from "@/components/score-info";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

/** Re-render every 60s (ISR). Data is already cached per-process by mtime. */
export const revalidate = 60;

export default async function HomePage() {
  const snapshot = await loadSnapshot();
  const stats = await getStats();

  const cookieStore = cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <div className="relative min-h-screen">
      {/* Floating controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSwitcher current={locale} />
        <ThemeToggle />
      </div>

      {/* Ghibli corner decorations */}
      <Image
        src="/images/corner-vine-left.webp"
        alt=""
        width={180}
        height={180}
        className="pointer-events-none fixed top-0 left-0 opacity-70 hidden md:block select-none"
        aria-hidden
      />
      <Image
        src="/images/corner-vine-right.webp"
        alt=""
        width={180}
        height={180}
        className="pointer-events-none fixed top-0 right-0 opacity-70 hidden md:block select-none"
        aria-hidden
      />

      <main className="relative mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8">
        <Hero />
        <StatsCards
          totalModels={stats.totalModels}
          topUGI={stats.topUGI}
          lastUpdated={stats.lastUpdated}
        />
        <ScoreInfo />
        <LeaderboardTable data={snapshot.data} />
        <Footer />
      </main>
    </div>
  );
}
