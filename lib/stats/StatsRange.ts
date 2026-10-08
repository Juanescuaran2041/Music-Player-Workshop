export type StatsRangeId = "week" | "month" | "all";

export class StatsRange {
  private static readonly DAY_MS = 24 * 60 * 60 * 1000;

  static readonly OPTIONS: readonly StatsRange[] = [
    new StatsRange("week", "Last 7 days", 7),
    new StatsRange("month", "Last 30 days", 30),
    new StatsRange("all", "All time", null),
  ];

  private constructor(
    public readonly id: StatsRangeId,
    public readonly label: string,
    private readonly days: number | null,
  ) {}

  static byId(id: StatsRangeId): StatsRange {
    return StatsRange.OPTIONS.find((range) => range.id === id)!;
  }

  since(now: Date = new Date()): Date | null {
    return this.days === null
      ? null
      : new Date(now.getTime() - this.days * StatsRange.DAY_MS);
  }
}
