"use client";

import Link from "next/link";
import { useState } from "react";
import { formatListeningTime } from "@/lib/format";
import { ListeningStats } from "@/lib/stats/ListeningStats";
import { PlaySource } from "@/lib/stats/Play";
import { StatsRange, StatsRangeId } from "@/lib/stats/StatsRange";
import { useListeningStats } from "@/lib/stats/useListeningStats";
import PeriodChart from "./PeriodChart";
import RankedBars from "./RankedBars";
import StatTile from "./StatTile";

const sourceNames: Record<PlaySource, string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  file: "Your files",
  manual: "Added by hand",
};

function percent(part: number, total: number): string {
  return `${Math.round((part / total) * 100)}%`;
}

function StatsContent({ stats }: { stats: ListeningStats }) {
  const [topGenre] = stats.topGenres(1);
  const [topArtist] = stats.topArtists(1);
  const sources = stats.bySource();

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Songs played" value={String(stats.totalPlays)} />
        <StatTile
          label="Listening time"
          value={formatListeningTime(stats.totalSeconds)}
        />
        <StatTile
          label="Top genre"
          value={topGenre?.label ?? "-"}
          detail={`${stats.distinctGenres} genres in total`}
        />
        <StatTile
          label="Top artist"
          value={topArtist?.label ?? "-"}
          detail={`${stats.distinctArtists} artists in total`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RankedBars
          title="Top genres"
          subtitle="The styles you play the most"
          entries={stats.topGenres()}
          emptyMessage="No genres yet."
        />
        <RankedBars
          title="Top artists"
          subtitle="Who you keep coming back to"
          entries={stats.topArtists()}
          emptyMessage="No artists yet."
        />
        <RankedBars
          title="Top songs"
          subtitle="Your most played tracks"
          entries={stats.topSongs()}
          emptyMessage="No songs yet."
        />
        <div className="flex min-w-0 flex-col gap-6">
          <PeriodChart shares={stats.byPeriod()} />
          <section className="card p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Where you listen</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sources.map((share) => (
                <li
                  key={share.source}
                  className="rounded-full bg-foreground/5 px-3 py-1.5 text-sm"
                >
                  <span className="font-medium">{sourceNames[share.source]}</span>{" "}
                  <span className="tabular-nums text-muted">
                    {percent(share.plays, stats.totalPlays)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

export default function ListeningStatsView() {
  const [rangeId, setRangeId] = useState<StatsRangeId>("month");
  const { loading, stats, error } = useListeningStats(rangeId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your <span className="text-brand">listening stats</span>
          </h1>
          <p className="mt-1 text-muted">
            A song counts as a play after 30 seconds, or half of it if it is shorter.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Time range"
          className="flex gap-1 rounded-full bg-foreground/5 p-1"
        >
          {StatsRange.OPTIONS.map((range) => (
            <button
              key={range.id}
              role="radio"
              aria-checked={range.id === rangeId}
              onClick={() => setRangeId(range.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                range.id === rangeId
                  ? "bg-accent font-semibold text-on-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="card py-16 text-center text-muted">
          Crunching your listening history...
        </p>
      ) : error ? (
        <p role="alert" className="card py-16 text-center text-sm text-rose-600">
          {error}
        </p>
      ) : !stats || stats.isEmpty ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-muted">
            No plays in this range yet. Listen to some music and come back.
          </p>
          <Link href="/" className="btn-primary">
            Go to the player
          </Link>
        </div>
      ) : (
        <StatsContent stats={stats} />
      )}
    </div>
  );
}
