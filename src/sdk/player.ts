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
 * Will get an object representing game data saved on the hosted platform.
 * @param keys - An array of unique keys to retrieve data for.
 * @returns Latest snapshot of game data
 * @example
 * ViberPlay.player
 *   .getDataAsync(['hp', 'items'])
 *   .then(function(data) {
 *     console.log('data is loaded');
 *     var hp = data['hp'];
 *     var items = data['items'];
 *   });
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
 * Will send update of game data to the hosted platform's server. The update
 * will be merged into existing game data.
 *
 * Please be careful not to store a game data bigger than 1000 characters
 * when stringified, which will cause the modification be rejected.
 * @param data - An object containing a set of key-value pairs to be
 * stored on the hosted platform. The object must contain only serializable
 * values - any non-serializable values will cause the entire modification
 * to be rejected. Nullable value will be treated as removal of the key-value
 * pair.
 * @returns Latest snapshot of game data
 * @example
 * ViberPlay.player
 *  .setDataAsync({
 *    items: ['item1', 'item2', 'item3'],
 *    hp: 123,
 *  })
 *  .then(function() {
 *    console.log('data is set');
 *  });
 */
export function setDataAsync (data: object): Promise<void> {
  return conn
    .request<PlayerSetDataResponse>('sgPlayerSetData', { data })
    .then(res => {
      state.playerData = res.data;
      flushDataAsync();
    })
}

/**
 * Will flush unsaved data to cloud storage
 */
export function flushDataAsync (): Promise<void> {
  return conn.request<PlayerFlushDataResponse>('sgPlayerFlushData');
}

/**
 * Get the player's ID. This should only be called after
 * `ViberPlay.initializeAsync()` resolves, or it will return null.
 * @returns Player's ID
 * @example
 * var playerID = ViberPlay.player.getID();
 */
export function getID (): string | null {
  return state.player.id;
}

/**
 * Get the player's name. This should only be called after
 * `ViberPlay.initializeAsync()` resolves, or it will return null.
 * @returns Player's name
 * @example
 * var playerName = ViberPlay.player.getName();
 */
export function getName (): string | null {
  return state.player.name;
}

/**
 * Get the player's photo. This should only be called after
 * `ViberPlay.initializeAsync()` resolves, or it will return null.
 * @returns URL of player photo
 * @example
 * var playerImage = new Image();
 * playerImage.crossOrigin = 'anonymous';
 * playerImage.src = ViberPlay.player.getPhoto();
 */
export function getPhoto (): string | null {
  return state.player.photo;
}

/**
 * Get a `SignedPlayerInfo` object with encrypted player's info. This can
 * be useful for game server to detect if the user's identity is really
 * sent from the hosted platform or tampered.
 *
 * Please read `SignedPlayerInfo` for more information on how to use this.
 * @param payload - An arbitary string to tag the signature
 * @returns An object with encrypted player info
 * @example
 * ViberPlay.player.getSignedPlayerInfoAsync('some_metadata')
 *  .then(function (result) {
 *    // The verification of the ID and signature should happen on
 *    // server side.
 *    sendToGameServer(
 *      result.getPlayerID(), // same value as ViberPlay.player.getID()
 *      result.getSignature(),
 *      'GAIN_COINS',
 *      100);
 *  });
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
 * This returns an array containing the friends of the user who has
 * played the current game before.
 * @returns Array of connected players
 * @example
 * var connectedPlayers = ViberPlay.player.getConnectedPlayersAsync()
 *   .then(function(players) {
 *     console.log(players.map(function(player) {
 *       return {
 *         id: player.getID(),
 *         name: player.getName(),
 *       }
 *     }));
 *   });
 * // [{id: '123456789', name: 'foo'}, {id: '234567890', name: 'bar'}]
 */
export function getConnectedPlayersAsync ({ filter = 'INCLUDE_PLAYERS' } = {}): Promise<Array<ConnectedPlayer>> {
  return conn
  .request<PlayerGetConnectedPlayersResponse>('sgPlayerGetConnectedPlayers', { filter })
  .then((res: { data: PlayerRawData[] }) => {
    const players = res.data.map((profile: PlayerRawData) => new ConnectedPlayer(profile));

    state.player.connectedPlayers = players;
    return state.player.connectedPlayers;
  })
}

/**
 * (Experimental) Checks if the current user can subscribe
 * the game's bot.
 * Please note that this API is currently a stub that only resolves
 * with true.
 * @returns Resolves with true if user can subscribe bot
 * @example
 * ViberPlay.player.canSubscribeBotAsync()
 *   .then((result) => console.log(result));
 */
export function canSubscribeBotAsync (): Promise<boolean> {
  return conn.request<CanSubscribeBotResponse>('sgCanSubscribeBot');
}

/**
 * (Experimental) Start the process to subscribe the game's bot. Game
 * must check with ViberPlay.player.canSubscribeBotAsync() before this
 * API is called.
 * Please note that this API can terminate the game's window and navigate
 * user to the game's bot screen to start subscribing.
 * @returns
 * @example
 * ViberPlay.player.canSubscribeBotAsync()
 *   .then((result) => {
 *     if (!result) {
 *       throw new Error('CAN_NOT_SUBSCRIBE');
 *     }
 *     return ViberPlay.player.subscribeBotAsync();
 *   }))
 *   .then(() => console.log('ok'))
 *   .catch((err) => console.error(err));
 */
export function subscribeBotAsync (): Promise<void> {
  return conn.request<SubscribeBotResponse>('sgSubscribeBot');
}
