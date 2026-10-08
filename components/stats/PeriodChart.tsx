import { PeriodShare } from "@/lib/stats/ListeningStats";

type Props = {
  shares: PeriodShare[];
};

const hours: Record<PeriodShare["period"], string> = {
  Night: "0-6 h",
  Morning: "6-12 h",
  Afternoon: "12-18 h",
  Evening: "18-24 h",
};

export default function PeriodChart({ shares }: Props) {
  const max = Math.max(1, ...shares.map((share) => share.plays));

  return (
    <section className="card min-w-0 p-4 sm:p-6">
      <h2 className="text-lg font-semibold">When you listen</h2>
      <p className="mb-4 text-sm text-muted">Plays by time of day</p>

      <ul className="flex h-44 items-end gap-3">
        {shares.map((share) => (
          <li
            key={share.period}
            title={`${share.period} (${hours[share.period]}): ${share.plays} plays`}
            className="group flex h-full flex-1 flex-col items-center gap-1"
          >
            <span className="text-xs tabular-nums text-muted">{share.plays}</span>
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-14 rounded-t-md bg-accent transition-[height] duration-500 group-hover:bg-accent-hover"
                style={{ height: `${Math.max(2, (share.plays / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <ul className="mt-2 flex gap-3 text-center text-xs text-muted">
        {shares.map((share) => (
          <li key={share.period} className="flex-1">
            <span className="block font-medium text-foreground">{share.period}</span>
            {hours[share.period]}
          </li>
        ))}
      </ul>
    </section>
  );
}
