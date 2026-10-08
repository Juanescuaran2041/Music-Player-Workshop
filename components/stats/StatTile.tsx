type Props = {
  label: string;
  value: string;
  detail?: string;
};

export default function StatTile({ label, value, detail }: Props) {
  return (
    <div className="card min-w-0 p-4 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {detail && <p className="mt-0.5 truncate text-xs text-muted">{detail}</p>}
    </div>
  );
}
