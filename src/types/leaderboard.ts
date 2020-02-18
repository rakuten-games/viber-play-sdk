import { PlayerRawData } from './player';

/** @hidden */
export interface LeaderboardEntryRawData {
  score: number;
  formattedScore: string;
  timestamp: number;
  rank: number;
  extraData: string | null;
  player: LeaderboardPlayerRawData;
}

/** @hidden */
export type LeaderboardPlayerRawData = PlayerRawData;
