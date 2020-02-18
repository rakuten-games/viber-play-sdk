import { PlayerRawData } from '../types/player';

/**
 * Representing a player.
 */
export default class Player {
  protected $player: PlayerRawData;

  /**
   * @hidden
   */
  constructor(payload: PlayerRawData) {
    this.$player = {
      id: payload.id,
      name: payload.name,
      photo: payload.photo,
      hasPlayed: payload.hasPlayed,
    }
  }

  /**
   * Get the player's ID.
   * @returns Player ID
   * @example
   * ```
   * player.getID(); // '5458282176661711'
   * ```
   */
  getID(): string {
    return this.$player.id;
  }

  /**
   * Get the player's name.
   * @returns Player name
   * @example
   * ```
   * player.getName(); // 'Alpha Omega'
   * ```
   */
  getName(): string {
    // in case of null name
    // ref: https://rakuten-games.slack.com/archives/D7VUJ9DTL/p1544506295001500
    return this.$player.name || '';
  }

  /**
   * Get the player's photo.
   * @returns URL of player photo
   * @example
   * ```
   * player.getPhoto(); // A CORS supported URL to user's photo
   * ```
   */
  getPhoto(): string {
    return this.$player.photo;
  }

  /**
   * Get info about if the player has played the game.
   * @returns True if the player has played the game
   * @example
   * ```
   * player.hasPlayed();
   * ```
   */
  hasPlayed(): boolean {
    if (this.$player.hasPlayed === undefined) {
      throw new TypeError()
    }

    return this.$player.hasPlayed;
  }
}
