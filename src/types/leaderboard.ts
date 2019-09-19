import { PlayerPayload } from './player';

export interface LeaderboardEntryPayload {
  score: number;
  formattedScore: string;
  timestamp: number;
  rank: number;
  extraData: string | null;
  player: LeaderboardPlayerPayload;
}

export type LeaderboardPlayerPayload = PlayerPayload;
