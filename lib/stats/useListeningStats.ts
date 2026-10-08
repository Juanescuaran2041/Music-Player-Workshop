import { useEffect, useRef, useState } from "react";
import { ListeningStats } from "./ListeningStats";
import { PlayHistoryRepository } from "./PlayHistoryRepository";
import { StatsRange, StatsRangeId } from "./StatsRange";

type Result = {
  rangeId: StatsRangeId;
  stats: ListeningStats | null;
  error: string;
};

export function useListeningStats(rangeId: StatsRangeId) {
  const repositoryRef = useRef<PlayHistoryRepository | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    repositoryRef.current ??= new PlayHistoryRepository();
    repositoryRef.current
      .loadSince(StatsRange.byId(rangeId).since())
      .then((plays) => {
        if (!cancelled) {
          setResult({ rangeId, stats: new ListeningStats(plays), error: "" });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setResult({ rangeId, stats: null, error: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [rangeId]);

  return {
    loading: result?.rangeId !== rangeId,
    stats: result?.stats ?? null,
    error: result?.error ?? "",
  };
}
