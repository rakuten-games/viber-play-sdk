import Player from './player';

/**
 * Representing a leaderboard player.
 * @extends Player
 */
export default class LeaderboardPlayer extends Player {
  /**
   * Get the player's played status.
   * @returns Always true
   */
  hasPlayed(): true {
    return true;
  }
}
