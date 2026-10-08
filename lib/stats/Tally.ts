export type TallyEntry = {
  label: string;
  plays: number;
  seconds: number;
};

export class Tally {
  private readonly entries = new Map<string, TallyEntry>();

  add(key: string, label: string, seconds: number): void {
    const entry = this.entries.get(key);
    if (entry) {
      entry.plays++;
      entry.seconds += seconds;
      return;
    }
    this.entries.set(key, { label, plays: 1, seconds });
  }

  get size(): number {
    return this.entries.size;
  }

  top(limit: number): TallyEntry[] {
    return [...this.entries.values()]
      .sort((a, b) => b.plays - a.plays || b.seconds - a.seconds)
      .slice(0, limit);
  }
}
