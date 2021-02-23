import conn from '../utils/conn';
import state from '../utils/state';

import ConnectedPlayer from '../models/connected-player';
import SignedPlayerInfo from '../models/signed-player-info';
import { PlayerData, PlayerRawData } from '../types/player';
import {
  PlayerGetConnectedPlayersResponse,
  PlayerGetDataResponse,
  PlayerSetDataResponse,
  PlayerFlushDataResponse,
  PlayerGetSignedInfoV4Response,
  CanSubscribeBotResponse,
  SubscribeBotResponse,
} from '../types/bridge';

/**
 * Get game data from platform storage.
 * @param keys - An array of unique keys to retrieve data for.
 * @returns Latest snapshot of game data
 * @example
 * ```
 * ViberPlay.player
 *   .getDataAsync(['hp', 'items'])
 *   .then(function(data) {
 *     console.log(data['hp']) // 100
 *     console.log(data['items']) // {potion: 3, gold: 20}
 *   })
 * ```
 */
export function getDataAsync (keys: string[]): Promise<PlayerData> {
  return conn
    .request<PlayerGetDataResponse>('sgPlayerGetData')
    .then(res => {
      state.playerData = res.data;
      return state.playerData;
    })
    .then(data =>
      keys.reduce(
        (acc, key) => {
          acc[key] = data[key];
          return acc;
        },
        {} as PlayerData
      )
    )
}

/**
 * Update game data to platform storage. The update will be merged into existing game data.
 * Please be careful not to store a game data bigger than 1000 characters when stringified,
 * which will cause the modification be rejected.
 * @param data - An object containing a set of key-value pairs.
 * The object must contain only serializable values.
 * Nullable value will be treated as removal of the key-value pair.
 * @example
 * ```
 * ViberPlay.player
 *  .setDataAsync({
 *    items: {
 *      potion: 4,
 *      gold: 20,
 *    },
 *    hp: 99,
 *  })
 *  .then(function() {
 *    console.log('data is set')
 *  })
 * ```
 */
export function setDataAsync (data: Record<string, unknown>): Promise<void> {
  return conn
    .request<PlayerSetDataResponse>('sgPlayerSetData', { data })
    .then(res => {
      state.playerData = res.data;
    })
}

/**
 * Will flush any unsaved data to platform storage
 */
export function flushDataAsync (): Promise<void> {
  return conn.request<PlayerFlushDataResponse>('sgPlayerFlushData');
}

/**
 * Get the player's ID.
 * @returns Player's ID
 * @example
 * ```
 * ViberPlay.player.getID() // 'SOMEPLAYER123456'
 * ```
 */
export function getID (): string | null {
  return state.player.id;
}

/**
 * Get the player's name.
 * @returns Player's name
 * @example
 * ```
 * ViberPlay.player.getName() // 'John Smith'
 * ```
 */
export function getName (): string | null {
  return state.player.name;
}

/**
 * Get the player's photo.
 * @returns URL of player photo
 * @example
 * ```
 * const playerImage = new Image()
 * playerImage.crossOrigin = 'anonymous'
 * playerImage.src = ViberPlay.player.getPhoto()
 * ```
 */
export function getPhoto (): string | null {
  return state.player.photo;
}

/**
 * Get info about if the player has played the game.
 * @returns Always true
 * @example
 * ```
 * ViberPlay.player.hasPlayed() // true
 * ```
 */
export function hasPlayed (): boolean {
  return true;
}

/**
 * Get a [[SignedPlayerInfo]] object with custom payload and a signature.
 * This can be useful for game server to validate if the user's identity and its payload is really sent from the game or tampered.
 * Please read more on [[SignedPlayerInfo]] for more information.
 * @param payload - An arbitary string to be signed
 * @returns An object containing signed player info and custom payload
 * @example
 * ```
 * ViberPlay.player.getSignedPlayerInfoAsync('{"type":"GAIN_COINS","amount":100}')
 *  .then(result => {
 *    // Send to server for validation and further processing
 *    sendToGameServer(
 *      result.getPlayerID(),
 *      result.getSignature(),
 *      '{"type":"GAIN_COINS","amount":100}',
 *    )
 *  })
 * ```
 */
export function getSignedPlayerInfoAsync (payload?: string): Promise<SignedPlayerInfo> {
  const playerId = getID();

  if (playerId) {
    return conn
      .request<PlayerGetSignedInfoV4Response>('sgPlayerGetSignedInfoV4', {
        payload
      })
      .then(res => new SignedPlayerInfo(playerId, res.signature));
  }

  return Promise.reject({
    code: 'INVALID_PARAM',
    message: 'Player info is not initialized yet. Please try again later.'
  });
}

/**
 * This returns an array containing the friends of the user who has played the current game before.
 * @returns Array of connected players
 * @example
 * ```
 * ViberPlay.player.getConnectedPlayersAsync()
 *   .then(players => {
 *     console.log(players.map(player => {
 *       return {
 *         id: player.getID(),
 *         name: player.getName(),
 *       }
 *     }))
 *     // [{id: 'SOMEPLAYER123456', name: 'John'}, {id: 'SOMEPLAYER654321', name: 'Jack'}]
 *   })
 * ```
 */
export function getConnectedPlayersAsync (payload = {}): Promise<Array<ConnectedPlayer>> {
  return conn
  .request<PlayerGetConnectedPlayersResponse>('sgPlayerGetConnectedPlayers', { ...payload })
  .then((res: { data: PlayerRawData[] }) => {
    const players = res.data.map((profile: PlayerRawData) => new ConnectedPlayer(profile));

    state.player.connectedPlayers = players;
    return state.player.connectedPlayers;
  })
}

/**
 * Checks if the current user can subscribe the game's bot.
 * Not supported.
 * @category Experimental
 * @returns Whether the user can subscribe bot
 * @example
 * ```
 * ViberPlay.player.canSubscribeBotAsync()
 *   .then((result) => console.log(result)) // true
 * ```
 */
export function canSubscribeBotAsync (): Promise<boolean> {
  return conn.request<CanSubscribeBotResponse>('sgCanSubscribeBot');
}

/**
 * Start the process to subscribe the game's bot. 
 * Developer must check with ViberPlay.player.canSubscribeBotAsync() before this API is called.
 * Not supported.
 * @category Experimental
 * @example
 * ```
 * ViberPlay.player.canSubscribeBotAsync()
 *   .then((result) => {
 *     if (!result) {
 *       throw new Error('CAN_NOT_SUBSCRIBE')
 *     }
 *     return ViberPlay.player.subscribeBotAsync()
 *   }))
 *   .then(() => console.log('ok'))
 *   .catch(e => console.error(e))
 * ```
 */
export function subscribeBotAsync (): Promise<void> {
  return conn.request<SubscribeBotResponse>('sgSubscribeBot');
}
