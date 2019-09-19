import LeaderboardPlayer from './leaderboard-player';
import { LeaderboardEntryPayload } from '../types/leaderboard';

interface LeaderboardEntryRawData {
  score: number;
  formattedScore: string;
  timestamp: number;
  rank: number;
  extraData: string | null;
  player: LeaderboardPlayer;
}

/**
 * Represent a leaderboard entry. An entry is created when a player submit score
 * to the leaderboard for the first time. After creation, the entry will be
 * only updated when a better score is submit by this player.
 */
export default class LeaderboardEntry {
  $leaderboardEntry: LeaderboardEntryRawData;

  /**
   * @hideconstructor
   */
  constructor(payload: LeaderboardEntryPayload) {
    const {
      score,
      formattedScore,
      timestamp,
      rank,
      extraData,
      player
    } = payload;

    this.$leaderboardEntry = {
      score,
      formattedScore,
      timestamp,
      rank,
      extraData,
      player: new LeaderboardPlayer(player)
    };
  }

  /**
   * Get the score of this entry.
   * @returns Score
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getScore(); // 100
   *   });
   */
  getScore(): number {
    return this.$leaderboardEntry.score;
  }

  /**
   * Get the formatted score of this entry. Format is based on the
   * leaderboard's setting.
   * @returns Formatted score
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getFormattedScore(); // '100pt'
   *   });
   */
  getFormattedScore(): string {
    return this.$leaderboardEntry.formattedScore;
  }

  /**
   * Get the timestamp of when the entry is updated or created for the last
   * time.
   * @returns Timestamp of last update or creation
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getTimestamp(); // 1527810893
   *   });
   */
  getTimestamp(): number {
    return this.$leaderboardEntry.timestamp;
  }

  /**
   * Get the rank of this player. It's calculated based on the entry's score
   * and the leaderboard's sort setting.
   * @returns Rank
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getRank(); // 2
   *   });
   */
  getRank(): number {
    return this.$leaderboardEntry.rank;
  }

  /**
   * Get the extra data submit with the last update. Returns `null` if no
   * extra data exists.
   * @returns Extra data appended with last update or creation
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getExtraData(); // 'Hello world'
   *   });
   */
  getExtraData(): string | null {
    return this.$leaderboardEntry.extraData;
  }

  /**
   * Get the player's info of this entry.
   * @returns Player's info
   * @example
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getPlayer().getID(); // '5458282176661711'
   *   });
   */
  getPlayer(): LeaderboardPlayer {
    return this.$leaderboardEntry.player;
  }
}
