import Player from './player';

/**
 * Representing a leaderboard player.
 * @extends Player
 */
export default class LeaderboardPlayer extends Player {
  /**
   * Get info about if the player has played the game.
   * @returns Always true
   */
  hasPlayed(): true {
    return true;
  }
}
