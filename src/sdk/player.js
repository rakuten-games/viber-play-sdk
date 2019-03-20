// @flow

export type PlayerPayload = {
  id: string,
  name: string,
  photo: string
};

/**
 * Representing a player.
 */
export default class Player {
  /**
   * @hideconstructor
   */
  constructor(payload: PlayerPayload) {
    this.$player = {};
    this.$player.id = payload.id;
    this.$player.name = payload.name;
    this.$player.photo = payload.photo;
  }

  /**
   * Get the player's ID.
   * @returns Player ID
   * @example
   * player.getID(); // '5458282176661711'
   */
  getID(): string {
    return this.$player.id;
  }

  /**
   * Get the player's name.
   * @returns Player name
   * @example
   * player.getName(); // 'Alpha Omega'
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
   * player.getPhoto(); // A CORS supported URL to user's photo
   */
  getPhoto(): string {
    return this.$player.photo;
  }
}
