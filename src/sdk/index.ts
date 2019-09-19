/* eslint no-console: 0 class-methods-use-this: 0 */
import isEmpty from 'lodash-es/isEmpty';
import isPlainObject from 'lodash-es/isPlainObject';

import { getMessenger } from './messenger';
import ConnectedPlayer, { ConnectedPlayerPayload } from './connected-player';
import ContextPlayer, { ContextPlayerPayload } from './context-player';
import Leaderboard from './leaderboard';
import { InterstitialAdInstance, RewardedVideoAdInstance } from './ad-instance';
import getLocalizationString from '../utils/get-localization-string';
import { CustomUpdatePayload } from '../types/custom-update-payload';
import { SharePayload } from '../types/share-payload';
import { ContextSizeResponse } from '../types/context-size-response';
import { ContextChoosePayload } from '../types/context-choose-payload';
import { InitializationOptions } from '../types/initialization';
import { Product, Purchase, PurchaseConfig } from '../types/iap';
import { ShareResult } from '../types/share-result';
import { lock } from '../utils/scroll-lock';

type SignedPlayerInfo = string;

interface Player {
  name: string | null;
  id: string | null;
  photo: string | null;
  connectedPlayers: ConnectedPlayer[];
}

interface PlayerData {
  [key: string]: any;
}

interface Context {
  id: string | null;
  type: 'SOLO' | 'THREAD';
  size: number;
  connectedPlayers: ContextPlayer[];
}

interface EntryPointData {}

interface TrafficSource {
  ['utm_source']?: string;
  ['r_entrypoint']?: string;
}

interface State {
  gameId: string;
  player: Player;
  context: Context;
  entryPointData: EntryPointData;
  trafficSource: TrafficSource;
  playerData: PlayerData;
}

/**
 * Local state, this may be out of date, but provides synchronous cache for
 * best guesses and storage for options.
 * @private
 */
const state: State = {
  gameId: '',
  player: {
    name: null,
    id: null,
    photo: null,
    connectedPlayers: [],
  },
  context: {
    id: null,
    type: 'SOLO',
    size: 1,
    connectedPlayers: []
  },
  entryPointData: {},
  trafficSource: {},
  playerData: {}
};

/**
 * The Messenger instance that sends/receives messages between game wrapper.
 * @private
 */
const conn = getMessenger();

conn
  .request('sgReady')
  .then(({ gameId }: { gameId: string }) => {
    state.gameId = gameId;
  })
  .catch(() => {});

/**
 * @private
 */
let isInitialized = false;

/**
 * Top level namespace wrapping the SDK's interfaces.
 * @namespace ViberPlay
 */

const viberPlaySdk = {
  /**
   * Initialize the SDK for the game. In the background, SDK will try to
   * setup environment and retrieve data for later use in the game.
   * @memberof ViberPlay
   * @param options Options to alter the runtime behavior of the SDK. Can be omitted.
   */
  initializeAsync: (options: InitializationOptions = {}): Promise<void> => {
    // avoid being executed more than once
    if (isInitialized) return Promise.resolve();

    if (options.scrollTarget) {
      lock(options.scrollTarget);
    }

    return conn
      .request('sgInitialize', {
        ...options,
        __sdk__: `${process.env.npm_package_name}@${
          process.env.NODE_ENV === 'production'
            ? process.env.npm_package_version
            : 'next'
        }`
      })
      .then(
        ({
          player,
          context,
          entryPointData,
          trafficSource
        }: {
          player: Player;
          context: Context;
          entryPointData: EntryPointData;
          trafficSource: TrafficSource;
        }) => {
          state.player = player;
          state.context = context;
          state.entryPointData = entryPointData;
          state.trafficSource = trafficSource;
        }
      )
      .then(() => undefined);
  },

  /**
   * Updates the load progress of the game. The value will be shown at the
   * loading screen.
   * @memberof ViberPlay
   * @param percentage Represents percentage of loading progress. It should
   * be between 0 and 100.
   * @example
   * ViberPlay.setLoadingProgress(50); // The game is halfway loaded
   */
  setLoadingProgress: (percentage: number = 0): void => {
    conn.request('sgSetLoadingProgress', {
      loadingProgress: Math.min(100, Math.max(Math.round(percentage), 0))
    });
  },

  /**
   * Starts the game. Calling this method will turn off the loading screen as
   * soon as these requirements are met:
   * - ViberPlay.setLoadingProgress() is called with a number > 99
   * - ViberPlay.initializeAsync() is called and resolved
   * @memberof ViberPlay
   * @example
   * ViberPlay.startGameAsync().then(function() {
   *   myAwesomeGame.start();
   * });
   */
  startGameAsync: (): Promise<void> => conn.request('sgStartGame'),

  /**
   * Post an update to the corresponding context. If the game is played in
   * a messenger chat thread, this will post a message into the thread with
   * the specified image and text message. And when people launch the game
   * from this message, those game sessions will be able to read the specified
   * data through `ViberPlay.getEntryPointData()`.
   * @memberof ViberPlay
   * @param payload An object describes the update message.
   * @example
   * ViberPlay.updateAsync({
   *   action: 'CUSTOM',
   *   cta: 'Call to action text',
   *   image: base64Picture,
   *   text: {
   *     default: 'Some text',
   *     localizations: {
   *       ja_JP: 'テキスト',
   *       en_US: 'Some text',
   *     }
   *   }
   *   data: { someData: '...' },
   *   strategy: 'IMMEDIATE',
   *   notification: 'NO_PUSH',
   * }).then(function() {
   *   // After the update is posted, closes the game.
   *   ViberPlay.quit();
   * });
   */
  updateAsync: (payload: CustomUpdatePayload): Promise<void> => {
    if (!viberPlaySdk.context.getID()) {
      return Promise.resolve();
    }

    let text;

    if (typeof payload.text === 'string') {
      ({ text } = payload);
    } else if (typeof payload.text === 'object') {
      const locale = viberPlaySdk.getLocale();
      text = getLocalizationString(locale, payload.text);

      if (!text) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'No matched localization on text'
        };

        throw err;
      }
    }

    let cta;

    if (typeof payload.cta === 'string') {
      ({ cta } = payload);
    } else if (typeof payload.cta === 'object') {
      const locale = viberPlaySdk.getLocale();
      cta = getLocalizationString(locale, payload.cta);

      if (!cta) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'No matched localization on cta'
        };

        throw err;
      }
    }

    return conn
      .request('sgUpdate', {
        ...payload,
        text,
        cta
      })
      .then(() => undefined);
  },

  /**
   * Share message to selected users from player's contact.
   * @memberof ViberPlay
   * @param payload An object describes the message to be shared.
   * @example
   * ViberPlay.shareAsync({
   *   intent: 'REQUEST',
   *   image: base64Picture,
   *   text: 'Some text',
   *   filters: 'NEW_CONTEXT_ONLY',
   *   minShare: 3,
   *   data: { someData: '...' },
   *   description: 'Win 100 gems for every friend who joins from your invite.',
   * }).then(function(shareResult) {
   *   console.log(shareResult); // {sharedCount: 3}
   * });
   */
  shareAsync: (payload: SharePayload): Promise<ShareResult> => {
    let description = '';

    if (typeof payload.description === 'string') {
      ({ description } = payload);
    } else if (typeof payload.description === 'object') {
      const locale = viberPlaySdk.getLocale();
      description = getLocalizationString(locale, payload.description);

      if (!description) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'No matched localization on description'
        };

        throw err;
      }
    }

    return conn.request('sgShare', { 
      ...payload,
      description
    })
  },

  /**
   * Close the game webview.
   * [TODO] Currently not working in Viber.`
   * @memberof ViberPlay
   */
  quit: (): void => {
    conn.request('sgQuit');
  },

  /**
   * Locale code will be based on `navigator.language` in the WebView, format
   * will be align with [BCP47](http://www.ietf.org/rfc/bcp/bcp47.txt).
   * @memberof ViberPlay
   * @example
   * const ruLangs = /^(ru|ab|hy|av|az|ba|be|ce|cv|ka|kk|ky|tg|tk|tt|uk|uz)/i;
   *
   * if (ruLangs.test(ViberPlay.getLocale())) {
   *   loadRuL10n();
   * }
   */
  getLocale: (): string => {
    return navigator.language;
  },

  /**
   * Get the entry point data bound to this message.
   * @memberof ViberPlay
   */
  getEntryPointData: (): object => state.entryPointData || {},

  /**
   * [TODO]
   * @memberof ViberPlay
   */
  onPause: (): void => {},

  /**
   * (Experimental) Update data associated with the current game session.
   *
   * Session data is persistent only within the current game session and is
   * used to populate payload of game_play webhook events.
   *
   * If called multiple times during a session, data specified in subsequent calls will be merged
   * with existing data at the top level.
   *
   * @memberof ViberPlay
   * @param sessionData - an arbitrary data object
   * @example
   *
   * ViberPlay.setSessionData({
   *   "high-score": 1000,
   *   "current-stage": "stage1",
   * })
   */
  setSessionData: (sessionData: object): void => {
    let serializedString;

    try {
      if (!isPlainObject(sessionData)) {
        throw new TypeError();
      }

      // This catches circular reference in data object
      serializedString = JSON.stringify(sessionData);
    } catch (err) {
      const invalidParamError = {
        code: 'INVALID_PARAM',
        message: 'Session data must be an JSON object'
      };

      throw invalidParamError;
    }

    if (serializedString.length > 1000) {
      const err = {
        code: 'INVALID_PARAM',
        message: 'Session data exceedds limit of 1000 characters'
      };

      throw err;
    } else if (isEmpty(sessionData)) {
      return;
    }

    conn.request('sgSetSessionData', { sessionData });
  },

  /**
   * Get a leaderboard by its name
   * @memberof ViberPlay
   * @param name - The name of the leaderboard
   * @example
   * ViberPlay.getLeaderboardAsync('some_leaderboard')
   *   .then(leaderboard => {
   *     console.log(leaderboard.getName()); // 'some_leaderboard'
   *   });
   */
  getLeaderboardAsync: (name: string): Promise<Leaderboard> =>
    Promise.resolve()
      .then(() => {
        if (!name) {
          const err = {
            code: 'INVALID_PARAM',
            message: 'The name is not set'
          };

          throw err;
        }

        const contextId = name.split('.').pop();

        if (contextId === 'null') {
          const err = {
            code: 'INVALID_PARAM',
            message: 'Contextual leaderboard must have a valid context ID'
          };

          throw err;
        }

        return conn.request('sgGetLeaderboard', { name });
      })
      .then(
        ({ id, name: returnedName, contextId }) =>
          new Leaderboard(id, returnedName, contextId)
      ),

  /**
   * (Experimental) Subscribe the platform bot.
   * @memberof ViberPlay
   * @example
   * ViberPlay.subscribePlatformBotAsync();
   */
  subscribePlatformBotAsync: (): Promise<null> =>
    conn.request('sgSubscribePlatformBot').then(() => null),

  /**
   * (Experimental) Get AdInstance of an interstitial ad placement
   * @memberof ViberPlay
   * @example
   * ViberPlay.getInterstitialAdAsync('DUMMY_PLACEMENT_ID')
   *   .then((adInstance) => {
   *     // do something
   *   });
   */
  getInterstitialAdAsync: (
    placementId: string
  ): Promise<InterstitialAdInstance> =>
    conn
      .request('sgGetInterstitialAd', {
        placementId
      })
      .then((res: any) => new InterstitialAdInstance(res)),

  /**
   * (Experimental) Get AdInstance of a rewarded video ad placement
   * @memberof ViberPlay
   * @example
   * ViberPlay.getRewardedVideoAdAsync('DUMMY_PLACEMENT_ID')
   *   .then((adInstance) => {
   *     // do something
   *   });
   */
  getRewardedVideoAdAsync: (
    placementId: string
  ): Promise<RewardedVideoAdInstance> =>
    Promise.resolve(
      new RewardedVideoAdInstance({
        placementId
      })
    ),

  /**
   * (Experimental) Request to switch to another game
   * @memberof ViberPlay
   * @param gameId - the game ID of the target game
   * @param data - TODO the entry point data for the target game
   * @example
   * ViberPlay.switchGameAsync('arrQ8wIzzfBHsR0Cerroqns8ledhtug5', {
   *   from: 'prequel-game'
   * }).catch((e) => {
   *   // handling cases when failed to switch to the target game
   * });
   */
  switchGameAsync: (gameId: string, data?: object): Promise<null> => {
    /* eslint-disable prefer-promise-reject-errors */
    let serializedData;

    if (data) {
      try {
        serializedData = JSON.stringify(data);
      } catch (e) {
        return Promise.reject({
          code: 'INVALID_PARAM',
          message: 'data is not serializable'
        });
      }

      if (serializedData.length > 1000) {
        return Promise.reject({
          code: 'INVALID_PARAM',
          message: 'data has exceeded the 1000 byte size limit'
        });
      }
    }

    return conn.request('sgSwitchGame', {
      gameId,
      data: serializedData
    });
    /* eslint-enable prefer-promise-reject-errors */
  },

  /**
   * (Experimental) Get traffic source related url params set
   * on the game's wrapper.
   * @memberof ViberPlay
   * @example
   * // Should be called after ViberPlay.initializeAsync() resolves
   * const trafficSource = ViberPlay.getTrafficSource();
   * console.log(trafficSource['utm_source']); // 'viber'
   */
  getTrafficSource: () => state.trafficSource,

  /**
   * (Experimental) Get information about where the game is started.
   * @memberof ViberPlay
   * @example
   * ViberPlay.getEntryPointAsync().then(console.log); // 'game_switch'
   */
  getEntryPointAsync: () =>
    Promise.resolve(viberPlaySdk.getTrafficSource()).then(
      trafficSource => trafficSource['r_entrypoint'] || ''
    ),

  context: {
    /**
     * Get id of context
     * @memberof ViberPlay
     * @method context.getID
     */
    getID: (): string | null => state.context.id,

    /**
     * Get type of context
     * @memberof ViberPlay
     * @method context.getType
     */
    getType: (): 'SOLO' | 'THREAD' => state.context.type,

    /**
     * Check if the count of players in context is between given numbers
     * @memberof ViberPlay
     * @method context.isSizeBetween
     */
    isSizeBetween: (
      minSize?: number,
      maxSize?: number
    ): ContextSizeResponse | null => {
      const { size } = state.context;

      if (size === null) {
        return null;
      }

      if (minSize === null && maxSize === null) {
        return null;
      }

      if (
        (minSize && !Number.isInteger(minSize)) ||
        (maxSize && !Number.isInteger(maxSize))
      ) {
        return null;
      }

      const minVal = minSize || 0;
      const maxVal = maxSize || Infinity;

      return {
        answer: minVal <= size && size <= maxVal,
        minSize,
        maxSize
      };
    },

    /**
     * Create context with player
     * @memberof ViberPlay
     * @param playerId - Player ID of the player
     * @method context.createAsync
     */
    createAsync: (playerId: string): Promise<void> =>
      Promise.resolve()
        .then(() => {
          if (!playerId) {
            const err = {
              code: 'INVALID_PARAM',
              message: 'playerId is not set'
            };

            throw err;
          }

          if (playerId === viberPlaySdk.player.getID()) {
            const err = {
              code: 'INVALID_PARAM',
              message: 'can not use ID of the current player'
            };

            throw err;
          }

          return conn.request('sgContextCreateContext', { playerId });
        })
        .then(({ id, type, size }) => {
          state.context.id = id;
          state.context.type = type;
          state.context.size = size;
        })
        .then(() => undefined),

    /**
     * Switch context by context id
     * @memberof ViberPlay
     * @param contextId - Context ID of the context
     * @method context.switchAsync
     */
    switchAsync: (contextId: string): Promise<void> =>
      Promise.resolve()
        .then(() => {
          if (!contextId) {
            const err = {
              code: 'INVALID_PARAM',
              message: 'The contextId is not set'
            };
            throw err;
          }

          if (state.context.id === contextId) {
            const err = {
              code: 'SAME_CONTEXT',
              message: 'Must specify a context other than the current one'
            };
            throw err;
          }

          return conn
            .request('sgContextSwitchContext', { contextId })
            .then(({ id, type, size }: Context) => {
              state.context.id = id;
              state.context.type = type;
              state.context.size = size;
              state.context.connectedPlayers = [];
            });
        })
        .then(() => undefined),

    /**
     * Popup a friend dialog to establish context
     * @memberof ViberPlay
     * @param payload An object describes the choose context
     * @method context.chooseAsync
     */
    chooseAsync: (payload: ContextChoosePayload): Promise<void> =>
      Promise.resolve()
        .then(() => {
          if (payload) {
            if (payload.filters) {
              for (let i = 0; i < payload.filters.length; i += 1) {
                if (
                  ![
                    'NEW_CONTEXT_ONLY',
                    'INCLUDE_EXISTING_CHALLENGES',
                    'NEW_PLAYERS_ONLY',
                    'NEW_INVITATIONS_ONLY'
                  ].includes(payload.filters[i])
                ) {
                  const err = {
                    code: 'INVALID_PARAM',
                    message: 'Invalid filter'
                  };
                  throw err;
                }
              }
            }

            if (
              payload.hoursSinceInvitation &&
              !Number.isInteger(payload.hoursSinceInvitation)
            ) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The hoursSinceInvitation is not integer'
              };
              throw err;
            }

            if (payload.minSize && !Number.isInteger(payload.minSize)) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The minSize is not integer'
              };
              throw err;
            }

            if (payload.maxSize && !Number.isInteger(payload.maxSize)) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The maxSize or maxSize is invalid'
              };
              throw err;
            }

            if (payload.minSize && payload.minSize < 2) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The minSize must be at least 2'
              };
              throw err;
            }

            if (payload.maxSize && payload.maxSize < 2) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The maxSize must be at least 2'
              };
              throw err;
            }

            if (
              payload.maxSize &&
              payload.minSize &&
              payload.minSize > payload.maxSize
            ) {
              const err = {
                code: 'INVALID_PARAM',
                message: 'The minSize cannot be greater than maxSize'
              };
              throw err;
            }
          }

          return conn
            .request('sgContextChooseContext', { ...payload })
            .then(({ id, type, size }: Context) => {
              state.context.id = id;
              state.context.type = type;
              state.context.size = size;
              state.context.connectedPlayers = [];
            });
        })
        .then(() => undefined),

    /**
     * Get an array of ContextPlayer containing players in the same context
     * @memberof ViberPlay
     * @method context.getPlayersAsync
     */
    getPlayersAsync: (): Promise<ContextPlayer[]> =>
      Promise.resolve()
        .then(() => {
          if (!state.context.id) {
            const err = {
              code: 'INVALID_OPERATION',
              message: 'Can not get context players in a solo context'
            };
            throw err;
          }

          return conn.request('sgContextGetContextPlayers', {
            contextId: state.context.id
          });
        })
        .then((res: { data: ContextPlayerPayload[] }) => {
          const players = res.data.map(
            (playerPayload: ContextPlayerPayload) => new ContextPlayer(playerPayload)
          );

          state.context.connectedPlayers = players;
          return state.context.connectedPlayers;
        })
  },

  player: {
    /**
     * Will get an object representing game data saved on the hosted platform.
     * @memberof ViberPlay
     * @method player.getDataAsync
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
    getDataAsync: (keys: Array<string>): Promise<PlayerData> =>
      conn
        .request('sgPlayerGetData')
        .then(
          (res: { data: PlayerData }): PlayerData => {
            state.playerData = res.data;
            return state.playerData;
          }
        )
        .then(
          (data: PlayerData): PlayerData =>
            keys.reduce((acc: PlayerData, key) => {
              acc[key] = data[key];
              return acc;
            }, {})
        ),

    /**
     * Will send update of game data to the hosted platform's server. The update
     * will be merged into existing game data.
     *
     * Please be careful not to store a game data bigger than 1000 characters
     * when stringified, which will cause the modification be rejected.
     * @memberof ViberPlay
     * @method player.setDataAsync
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
    setDataAsync: (data: object): Promise<void> =>
      conn
        .request('sgPlayerSetData', { data })
        .then((res: { data: PlayerData }) => {
          state.playerData = res.data;
          viberPlaySdk.player.flushDataAsync();

          return undefined;
        }),

    /**
     * Will flush unsaved data to cloud storage
     * @memberof ViberPlay
     * @method player.flushDataAsync
     */
    flushDataAsync: (): Promise<void> =>
      conn.request('sgPlayerFlushData').then(() => undefined),

    /**
     * Get the player's ID. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
     * @memberof ViberPlay
     * @method player.getID
     * @returns Player's ID
     * @example
     * var playerID = ViberPlay.player.getID();
     */
    getID: (): string | null => state.player.id,

    /**
     * Get the player's name. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
     * @memberof ViberPlay
     * @method player.getName
     * @returns Player's name
     * @example
     * var playerName = ViberPlay.player.getName();
     */
    getName: (): string | null => state.player.name,

    /**
     * Get the player's photo. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
     * @memberof ViberPlay
     * @method player.getPhoto
     * @returns URL of player photo
     * @example
     * var playerImage = new Image();
     * playerImage.crossOrigin = 'anonymous';
     * playerImage.src = ViberPlay.player.getPhoto();
     */
    getPhoto: (): string | null => state.player.photo,

    /**
     * Get a `SignedPlayerInfo` object with encrypted player's info. This can
     * be useful for game server to detect if the user's identity is really
     * sent from the hosted platform or tampered.
     *
     * Please read `SignedPlayerInfo` for more information on how to use this.
     * @memberof ViberPlay
     * @method player.getSignedPlayerInfoAsync
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
    getSignedPlayerInfoAsync: (payload?: string): Promise<SignedPlayerInfo> =>
      conn
        .request('sgPlayerGetSignedInfoV4', { payload })
        .then((data: { signature: SignedPlayerInfo }) => ({
          getPlayerID: () => viberPlaySdk.player.getID(),
          getSignature: () => data.signature
        })),

    /**
     * This returns an array containing the friends of the user who has
     * played the current game before.
     * @memberof ViberPlay
     * @method player.getConnectedPlayersAsync
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
    getConnectedPlayersAsync: ({ filter = 'INCLUDE_PLAYERS' } = {}): Promise<Array<ConnectedPlayer>> =>
      conn.request('sgPlayerGetConnectedPlayers', { filter }).then((res: { data: Player[] }) => {
        const players = res.data.map((profile: Profile) => new ConnectedPlayer(profile));

        state.player.connectedPlayers = players;
        return state.player.connectedPlayers;
      }),

    /**
     * (Experimental) Checks if the current user can subscribe
     * the game's bot.
     * Please note that this API is currently a stub that only resolves
     * with true.
     * @memberof ViberPlay
     * @method player.canSubscribeBotAsync
     * @returns Resolves with true if user can subscribe bot
     * @example
     * ViberPlay.player.canSubscribeBotAsync()
     *   .then((result) => console.log(result));
     */
    canSubscribeBotAsync: (): Promise<boolean> =>
      conn.request('sgCanSubscribeBot').then((res: boolean) => {
        return res;
      }),

    /**
     * (Experimental) Start the process to subscribe the game's bot. Game
     * must check with ViberPlay.player.canSubscribeBotAsync() before this
     * API is called.
     * Please note that this API can terminate the game's window and navigate
     * user to the game's bot screen to start subscribing.
     * @memberof ViberPlay
     * @method player.subscribeBotAsync
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
    subscribeBotAsync: (): Promise<void> => conn.request('sgSubscribeBot')
  },

  payments: {
    /**
     * (Experimental)
     * @memberof ViberPlay
     * @method payments.onReady
     * @returns
     * @example
     * ViberPlay.payments.onReady(function () {
     *   console.log('Ready to receive payments requests')
     * })
     */
    onReady: (callback: () => any): void =>
      conn.request('sgPaymentsOnReady').then(() => callback()),

    /**
     * (Experimental)
     * @memberof ViberPlay
     * @method payments.getCatalogAsync
     * @returns Array of products with pricing information
     * @example
     * ViberPlay.payments.getCatalogAsync().then((catalog) => {
     *   console.log(catalog)
     * })
     */
    getCatalogAsync: (): Promise<Array<Product>> =>
      conn.request('sgPaymentsGetCatalog'),

    /**
     * (Experimental)
     * @memberof ViberPlay
     * @method payments.purchaseAsync
     * @param config - An object containing purchase configuration information
     * @returns Purchase information
     * @example
     * ViberPlay.payments.purchaseAsync({
     *   productID: 'someProduct',
     *   developerPayload: 'somePayload'
     * }).then((purchase) => {
     *   console.log(purchase)
     * })
     */
    purchaseAsync: (config: PurchaseConfig): Promise<Purchase> => {
      if (typeof config !== 'object') {
        const err = {
          code: 'INVALID_PARAM',
          message: 'PurchaseConfig is expected to be an object.'
        };

        throw err;
      }

      if (typeof config.productID !== 'string') {
        const err = {
          code: 'INVALID_PARAM',
          message: 'ProductID is expected to be a string.'
        };

        throw err;
      }

      return conn.request('sgPaymentsPurchaseV2', {
        productId: config.productID,
        developerPayload: config.developerPayload
      });
    },

    /**
     * (Experimental)
     * @memberof ViberPlay
     * @method payments.getPurchasesAsync
     * @returns
     * @example
     * ViberPlay.payments.getPurchasesAsync().then((purchases) => {
     *   console.log(purchases);
     * })
     */
    getPurchasesAsync: (): Promise<Array<Purchase>> => {
      return conn.request('sgPaymentsGetPurchasesV2');
    },

    /**
     * (Experimental)
     * @memberof ViberPlay
     * @method payments.consumePurchaseAsync
     * @param purchaseToken - A string of purchase token used for consumption
     * @returns
     * @example
     * ViberPlay.payments.consumePurchaseAsync('somePurchaseToken').then(() => {
     *   console.log('Purchase is consumed');
     * })
     */
    consumePurchaseAsync: (purchaseToken: string): Promise<void> => {
      if (typeof purchaseToken !== 'string') {
        const err = {
          code: 'INVALID_PARAM',
          message: 'Purchase token is expected to be a string.'
        };

        throw err;
      }

      return conn.request('sgPaymentsConsumePurchase', {
        purchaseToken
      });
    }
  }
};

export default viberPlaySdk;
