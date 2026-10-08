import { formatListeningTime } from "@/lib/format";
import { TallyEntry } from "@/lib/stats/Tally";

type Props = {
  title: string;
  subtitle: string;
  entries: TallyEntry[];
  emptyMessage: string;
};

function playsLabel(plays: number): string {
  return `${plays} ${plays === 1 ? "play" : "plays"}`;
}

export default function RankedBars({
  title,
  subtitle,
  entries,
  emptyMessage,
}: Props) {
  const max = Math.max(1, ...entries.map((entry) => entry.plays));

  return (
    <section className="card min-w-0 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-muted">{emptyMessage}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {entries.map((entry, index) => (
            <li
              key={entry.label}
              title={`${entry.label}: ${playsLabel(entry.plays)}, ${formatListeningTime(entry.seconds)}`}
              className="result-in group"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  <span className="mr-2 tabular-nums text-muted">{index + 1}</span>
                  {entry.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted">
                  {playsLabel(entry.plays)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-foreground/8">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500 group-hover:bg-accent-hover"
                  style={{ width: `${(entry.plays / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
