import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserSupabase } from "../supabase/client";
import { Play, PlaySource } from "./Play";

type PlayRow = {
  title: string;
  artist: string;
  genre: string;
  source: PlaySource;
  seconds: number;
  played_at: string;
};

export class PlayHistoryError extends Error {}

export class PlayHistoryRepository {
  private static readonly TABLE = "plays";
  private static readonly MISSING_TABLE_CODES = ["42P01", "PGRST205"];

  constructor(
    private readonly client: SupabaseClient = createBrowserSupabase(),
  ) {}

  async record(play: Play): Promise<void> {
    const { error } = await this.client
      .from(PlayHistoryRepository.TABLE)
      .insert(this.toRow(play));
    if (error) throw this.toError(error, "save this play");
  }

  async loadSince(since: Date | null): Promise<Play[]> {
    let query = this.client
      .from(PlayHistoryRepository.TABLE)
      .select("title, artist, genre, source, seconds, played_at")
      .order("played_at", { ascending: false });
    if (since) query = query.gte("played_at", since.toISOString());

    const { data, error } = await query;
    if (error) throw this.toError(error, "load your listening history");
    return (data as PlayRow[]).map((row) => this.fromRow(row));
  }

  private toRow(play: Play): PlayRow {
    return {
      title: play.title,
      artist: play.artist,
      genre: play.genre,
      source: play.source,
      seconds: Math.round(play.seconds),
      played_at: play.playedAt.toISOString(),
    };
  }

  private fromRow(row: PlayRow): Play {
    return new Play(
      row.title,
      row.artist,
      row.genre,
      row.source,
      row.seconds,
      new Date(row.played_at),
    );
  }

  private toError(error: PostgrestError, action: string): PlayHistoryError {
    if (PlayHistoryRepository.MISSING_TABLE_CODES.includes(error.code)) {
      return new PlayHistoryError(
        "The plays table does not exist yet. Run supabase/plays.sql in the Supabase SQL Editor.",
      );
    }
    return new PlayHistoryError(
      `Could not ${action} (${error.message}).`,
    );
  }
}
