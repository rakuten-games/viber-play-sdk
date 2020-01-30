import { PlayerPayload } from './player';

/** @hidden */
export interface LeaderboardEntryPayload {
  score: number;
  formattedScore: string;
  timestamp: number;
  rank: number;
  extraData: string | null;
  player: LeaderboardPlayerPayload;
}

/** @hidden */
export type LeaderboardPlayerPayload = PlayerPayload;
