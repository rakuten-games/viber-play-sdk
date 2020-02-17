import conn from '../utils/conn';
import LeaderboardEntry from './leaderboard-entry';
import {
  LeaderboardGetPlayerEntryResponse,
  LeaderboardGetEntryCountResponse,
  LeaderboardSetScoreResponse,
  LeaderboardGetEntriesResponse,
  LeaderboardGetConnectPlayerEntriesResponse
} from '../types/bridge';

/**
 * @hidden
 */
interface LeaderboardRawData {
  name: string;
  contextId: string | null;
  id: number;
}

/**
 * Representing a leaderboard. Can be retrieved by calling
 * `ViberPlay.getLeaderboardAsync()`.
 */
export default class Leaderboard {
  private $leaderboard: LeaderboardRawData;
  /**
   * @hideconstructor
   */
  constructor(id: number, name: string, contextId: string | null) {
    this.$leaderboard = {
      name,
      contextId,
      id
    };
  }

  /**
   * Get the leaderboard's name.
   * @returns Leaderboard name
   * @example
   * ```
   * ViberPlay.getLeaderboardAsync('global_leaderboard')
   *   .then((leaderboard) => {
   *     leaderboard.getName() // 'global_leaderboard'
   *   })
   * 
   * ViberPlay.getLeaderboardAsync('context_leaderboard.8183471902')
   *   .then((leaderboard) => {
   *     leaderboard.getName() // 'context_leaderboard.8183471902'
   *   })
   * ```
   */
  getName(): string {
    return this.$leaderboard.name;
  }

  /**
   * Get ID of the context which the leaderboard belongs to. Returns `null` if
   * the leaderboard is not related to any context.
   * @returns Related context ID
   * @example
   * ```
   * ViberPlay.getLeaderboardAsync('context_leaderboard.8183471902')
   *   .then((leaderboard) => {
   *     leaderboard.getContextId() // '8183471902'
   *   })
   * ```
   */
  getContextID(): string | null {
    return this.$leaderboard.contextId;
  }

  /**
   * Get total number of entries inside the leaderboard.
   * @returns Total number of entries
   * @example
   * ```
   * ViberPlay.getLeaderboardAsync('context_leaderboard.8183471902')
   *   .then((leaderboard) => {
   *     leaderboard.getEntryCountAsync().then((count) => {
   *       console.log('count: ', count) // count: 2
   *     })
   *   })
   * ```
   */
  getEntryCountAsync(): Promise<number> {
    return conn.request<LeaderboardGetEntryCountResponse>(
      'sgLeaderboardGetEntryCount',
      {
        id: this.$leaderboard.id
      }
    );
  }

  /**
   * Submit score to the leaderboard and get the latest entry. A player can only
   * have one entry. If there's already an old entry, it will be only updated to
   * the a better score.
   * @param score - The new score
   * @param extraData - A string payload can be attached to the entry as extra info
   * @returns Entry info
   * @example
   * ```
   * leaderboard.setScoreAsync(100, 'Hello world')
   *   .then((entry) => {
   *     entry.getScore() // 100
   *   })
   * ```
   */
  setScoreAsync(score: number, extraData?: string): Promise<LeaderboardEntry> {
    return conn
      .request<LeaderboardSetScoreResponse>('sgLeaderboardSetScore', {
        id: this.$leaderboard.id,
        score,
        extraData
      })
      .then(payload => new LeaderboardEntry(payload));
  }

  /**
   * Get current player's entry. Returns `null` if there isn't one.
   * @returns Entry info
   * @example
   * ```
   * leaderboard.getPlayerEntryAsync()
   *   .then((entry) => {
   *     if (!entry) {
   *       console.log('No player entry found')
   *       return
   *     }
   *
   *     entry.getScore() // 100
   *   })
   * ```
   */
  getPlayerEntryAsync(): Promise<LeaderboardEntry | null> {
    return conn
      .request<LeaderboardGetPlayerEntryResponse>(
        'sgLeaderboardGetPlayerEntry',
        {
          id: this.$leaderboard.id
        }
      )
      .then(payload => payload && new LeaderboardEntry(payload));
  }

  /**
   * Get a list of entries inside the leaderboard based on the count and rank
   * offset specified
   * @param count - The number of maximum entries to be retruned
   * @param offset - The offset in the leaderborad (from the top) the entries to be returned
   * @returns Array of entry info
   * @example
   * ```
   * // Get top 10 entries
   * leaderboard.getEntriesAsync(10, 0)
   *   .then((entries) => {
   *     console.log(entries.length) // 10 if there're >= 10 entries
   *   })
   * ```
   */
  getEntriesAsync(count: number, offset: number): Promise<LeaderboardEntry[]> {
    return conn
      .request<LeaderboardGetEntriesResponse>('sgLeaderboardGetEntries', {
        id: this.$leaderboard.id,
        count,
        offset
      })
      .then(payloads => payloads.map(payload => new LeaderboardEntry(payload)));
  }

  /**
   * Get a list of connected player entries inside the leaderboard based on the count and rank
   * offset specified
   * @param count - The number of maximum entries to be retruned
   * @param offset - The offset in the leaderborad (from the top) the entries to be returned
   * @returns Array of entry info
   * @example
   * ```
   * // Get top 10 friend entries
   * leaderboard.getConnectedPlayerEntriesAsync(10, 0)
   *   .then((entries) => {
   *     console.log(entries.length) // 10 if there're >= 10 friend entries
   *   })
   * ```
   */
  getConnectedPlayerEntriesAsync(
    count: number,
    offset: number
  ): Promise<LeaderboardEntry[]> {
    return conn
      .request<LeaderboardGetConnectPlayerEntriesResponse>(
        'sgLeaderboardGetConnectPlayerEntries',
        {
          id: this.$leaderboard.id,
          count,
          offset
        }
      )
      .then(payloads => payloads.map(payload => new LeaderboardEntry(payload)));
  }
}
