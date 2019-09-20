import isEmpty from 'lodash-es/isEmpty';
import isPlainObject from 'lodash-es/isPlainObject';
import { getMessenger } from './sdk/messenger';
import ConnectedPlayer from './sdk/connected-player';
import ContextPlayer from './sdk/context-player';
import Leaderboard from './sdk/leaderboard';
import { InterstitialAdInstance, RewardedVideoAdInstance } from './sdk/ad-instance';
import SignedPlayerInfo from './sdk/signed-player-info';
import getLocalizationString from './utils/get-localization-string';
import { lock } from './utils/scroll-lock';
import { CustomUpdatePayload } from './types/custom-update-payload';
import { SharePayload } from './types/share-payload';
import { ContextChoosePayload, ContextSizeResponse } from './types/context';
import { InitializationOptions } from './types/initialization';
import { Product, Purchase, PurchaseConfig } from './types/iap';
import { ShareResult } from './types/share-result';
import { EntryPointData } from './types/entry-point-data';
import { TrafficSource } from './types/traffic-source';
import { PlayerData, PlayerPayload } from './types/player';
import { State } from './types/state';

import {
  ReadyResponse,
  InitializeResponse,
  ShareResponse,
  StartGameResponse,
  GetLeaderboardResponse,
  SwitchGameResponse,
  ContextCreateContextResponse,
  ContextSwitchContextResponse,
  ContextChooseContextResponse,
  ContextGetContextPlayersResponse,
  PlayerGetConnectedPlayersResponse,
  QuitResponse,
  PlayerGetDataResponse,
  PlayerSetDataResponse,
  PlayerFlushDataResponse,
  PlayerGetSignedInfoV4Response,
  CanSubscribeBotResponse,
  SubscribeBotResponse,
  PaymentsGetCatalogResponse,
  SetLoadingProgressResponse,
  UpdateResponse,
  SetSessionDataResponse,
  SubscribePlatformBotResponse,
  GetInterstitialAdResponse,
  PaymentsPurchaseResponse,
  PaymentsGetPurchasesResponse,
  PaymentsConsumePurchaseResponse
} from './types/bridge';

/**
 * Local state, this may be out of date, but provides synchronous cache for
 * best guesses and storage for options.
 * @internal
 */
const state: State = {
  gameId: '',
  player: {
    name: null,
    id: null,
    photo: null,
    connectedPlayers: []
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
 * @internal
 */
const conn = getMessenger();

conn
  .request<ReadyResponse>('sgReady')
  .then(({ gameId }) => {
    state.gameId = gameId;
  })
  .catch(() => {});

/**
 * Flag to prevent double execution of initialization.
 * @internal
 */
let isInitialized = false;

/**
 * Top level namespace wrapping the SDK.
 */
const ViberPlay = {
  /**
   * Initialize the SDK for the game. In the background, SDK will try to
   * setup environment and retrieve data for later use in the game.
   * We recommend calling this API in the game ASAP to shorten the loading wait.
   * @param options Extra options to alter the runtime behavior of the SDK.
   */
  initializeAsync: (options: InitializationOptions = {}): Promise<void> => {
    if (isInitialized) return Promise.resolve();

    if (options.scrollTarget) {
      lock(options.scrollTarget);
    }

    return conn
      .request<InitializeResponse>('sgInitialize', {
        ...options,
        __sdk__: `${process.env.npm_package_name}@${
          process.env.NODE_ENV === 'production'
            ? process.env.npm_package_version
            : 'next'
        }`
      })
      .then(({ player, context, entryPointData, trafficSource }) => {
        state.player = player;
        state.context = context;
        state.entryPointData = entryPointData;
        state.trafficSource = trafficSource;
      })
      .then(() => undefined);
  },

  /**
   * Updates the load progress of the game. The value will be shown at the
   * loading screen.
   * @param percentage Represents percentage of loading progress. It should
   * be between 0 and 100.
   * @example
   * ViberPlay.setLoadingProgress(50); // The game is halfway loaded
   */
  setLoadingProgress: (percentage: number = 0): void => {
    conn.request<SetLoadingProgressResponse>('sgSetLoadingProgress', {
      loadingProgress: Math.min(100, Math.max(Math.round(percentage), 0))
    });
  },

  /**
   * Starts the game. Calling this method will turn off the loading screen as
   * soon as these requirements are met:
   * - ViberPlay.setLoadingProgress() is called with a number > 99
   * - ViberPlay.initializeAsync() is called and resolved
   * @example
   * ViberPlay.startGameAsync().then(function() {
   *   myAwesomeGame.start();
   * });
   */
  startGameAsync: (): Promise<void> =>
    conn.request<StartGameResponse>('sgStartGame'),

  /**
   * Post an update to the corresponding context. If the game is played in
   * a messenger chat thread, this will post a message into the thread with
   * the specified image and text message. And when people launch the game
   * from this message, those game sessions will be able to read the specified
   * data through `ViberPlay.getEntryPointData()`.
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
    if (!ViberPlay.context.getID()) {
      return Promise.resolve();
    }

    let text;

    if (typeof payload.text === 'string') {
      ({ text } = payload);
    } else if (typeof payload.text === 'object') {
      const locale = ViberPlay.getLocale();
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
      const locale = ViberPlay.getLocale();
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
      .request<UpdateResponse>('sgUpdate', {
        ...payload,
        text,
        cta
      })
      .then(() => {});
  },

  /**
   * Share message to selected users from player's contact.
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
      const locale = ViberPlay.getLocale();
      description = getLocalizationString(locale, payload.description);

      if (!description) {
        const err = {
          code: 'INVALID_PARAM',
          message: 'No matched localization on description'
        };

        throw err;
      }
    }

    return conn.request<ShareResponse>('sgShare', { 
      ...payload,
      description
    })
  },

  /**
   * Close the game webview.
   * [TODO] Currently not working in Viber.`
   */
  quit: (): void => {
    conn.request<QuitResponse>('sgQuit');
  },

  /**
   * Locale code will be based on `navigator.language` in the WebView, format
   * will be align with [BCP47](http://www.ietf.org/rfc/bcp/bcp47.txt).
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
   */
  getEntryPointData: (): EntryPointData => state.entryPointData || {},

  /**
   * [TODO]
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

    conn.request<SetSessionDataResponse>('sgSetSessionData', { sessionData });
  },

  /**
   * Get a leaderboard by its name
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

        return conn.request<GetLeaderboardResponse>('sgGetLeaderboard', {
          name
        });
      })
      .then(
        ({ id, name: returnedName, contextId }) =>
          new Leaderboard(id, returnedName, contextId)
      ),

  /**
   * (Experimental) Subscribe the platform bot.
   * @example
   * ViberPlay.subscribePlatformBotAsync();
   */
  subscribePlatformBotAsync: (): Promise<void> =>
    conn
      .request<SubscribePlatformBotResponse>('sgSubscribePlatformBot')
      .then(() => {}),

  /**
   * (Experimental) Get AdInstance of an interstitial ad placement
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
      .request<GetInterstitialAdResponse>('sgGetInterstitialAd', {
        placementId
      })
      .then(res => new InterstitialAdInstance(res)),

  /**
   * (Experimental) Get AdInstance of a rewarded video ad placement
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
   * @param gameId - the game ID of the target game
   * @param data - TODO the entry point data for the target game
   * @example
   * ViberPlay.switchGameAsync('arrQ8wIzzfBHsR0Cerroqns8ledhtug5', {
   *   from: 'prequel-game'
   * }).catch((e) => {
   *   // handling cases when failed to switch to the target game
   * });
   */
  switchGameAsync: (gameId: string, data?: object): Promise<void> => {
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

    return conn.request<SwitchGameResponse>('sgSwitchGame', {
      gameId,
      data: serializedData
    });
    /* eslint-enable prefer-promise-reject-errors */
  },

  /**
   * (Experimental) Get traffic source related url params set
   * on the game's wrapper.
   * @example
   * // Should be called after ViberPlay.initializeAsync() resolves
   * const trafficSource = ViberPlay.getTrafficSource();
   * console.log(trafficSource['utm_source']); // 'viber'
   */
  getTrafficSource: (): TrafficSource => state.trafficSource,

  /**
   * (Experimental) Get information about where the game is started.
   * @example
   * ViberPlay.getEntryPointAsync().then(console.log); // 'game_switch'
   */
  getEntryPointAsync: (): Promise<string> =>
    Promise.resolve(ViberPlay.getTrafficSource()).then(
      trafficSource => trafficSource['r_entrypoint'] || ''
    ),

  context: {
    /**
     * Get id of context
     * @method context.getID
     */
    getID: (): string | null => state.context.id,

    /**
     * Get type of context
     * @method context.getType
     */
    getType: (): 'SOLO' | 'THREAD' => state.context.type,

    /**
     * Check if the count of players in context is between given numbers
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

          if (playerId === ViberPlay.player.getID()) {
            const err = {
              code: 'INVALID_PARAM',
              message: 'can not use ID of the current player'
            };

            throw err;
          }

          return conn.request<ContextCreateContextResponse>(
            'sgContextCreateContext',
            { playerId }
          );
        })
        .then(({ id, type, size }) => {
          state.context.id = id;
          state.context.type = type;
          state.context.size = size;
        }),

    /**
     * Switch context by context id
     * @param contextId - Context ID of the context
     * @method context.switchAsync
     */
    switchAsync: (contextId: string): Promise<void> =>
      Promise.resolve().then(() => {
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
          .request<ContextSwitchContextResponse>('sgContextSwitchContext', {
            contextId
          })
          .then(({ id, type, size }) => {
            state.context.id = id;
            state.context.type = type;
            state.context.size = size;
            state.context.connectedPlayers = [];
          });
      }),
    /**
     * Popup a friend dialog to establish context
     * @param payload An object describes the choose context
     * @method context.chooseAsync
     */
    chooseAsync: (payload: ContextChoosePayload): Promise<void> =>
      Promise.resolve().then(() => {
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
          .request<ContextChooseContextResponse>('sgContextChooseContext', {
            ...payload
          })
          .then(({ id, type, size }) => {
            state.context.id = id;
            state.context.type = type;
            state.context.size = size;
            state.context.connectedPlayers = [];
          });
      }),

    /**
     * Get an array of ContextPlayer containing players in the same context
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

          return conn.request<ContextGetContextPlayersResponse>(
            'sgContextGetContextPlayers',
            {
              contextId: state.context.id
            }
          );
        })
        .then(res => {
          const players = res.data.map(
            playerPayload => new ContextPlayer(playerPayload)
          );

          state.context.connectedPlayers = players;
          return state.context.connectedPlayers;
        })
  },

  player: {
    /**
     * Will get an object representing game data saved on the hosted platform.
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
    getDataAsync: (keys: string[]): Promise<PlayerData> =>
      conn
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
        ),

    /**
     * Will send update of game data to the hosted platform's server. The update
     * will be merged into existing game data.
     *
     * Please be careful not to store a game data bigger than 1000 characters
     * when stringified, which will cause the modification be rejected.
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
        .request<PlayerSetDataResponse>('sgPlayerSetData', { data })
        .then(res => {
          state.playerData = res.data;
          ViberPlay.player.flushDataAsync();
        }),

    /**
     * Will flush unsaved data to cloud storage
     * @method player.flushDataAsync
     */
    flushDataAsync: (): Promise<void> =>
      conn.request<PlayerFlushDataResponse>('sgPlayerFlushData'),

    /**
     * Get the player's ID. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
     * @method player.getID
     * @returns Player's ID
     * @example
     * var playerID = ViberPlay.player.getID();
     */
    getID: (): string | null => state.player.id,

    /**
     * Get the player's name. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
     * @method player.getName
     * @returns Player's name
     * @example
     * var playerName = ViberPlay.player.getName();
     */
    getName: (): string | null => state.player.name,

    /**
     * Get the player's photo. This should only be called after
     * `ViberPlay.initializeAsync()` resolves, or it will return null.
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
    getSignedPlayerInfoAsync: (payload?: string): Promise<SignedPlayerInfo> => {
      const playerId = ViberPlay.player.getID();

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
    },

    /**
     * This returns an array containing the friends of the user who has
     * played the current game before.
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
      conn
        .request<PlayerGetConnectedPlayersResponse>('sgPlayerGetConnectedPlayers', { filter })
        .then((res: { data: PlayerPayload[] }) => {
          const players = res.data.map((profile: PlayerPayload) => new ConnectedPlayer(profile));

          state.player.connectedPlayers = players;
          return state.player.connectedPlayers;
        }),

    /**
     * (Experimental) Checks if the current user can subscribe
     * the game's bot.
     * Please note that this API is currently a stub that only resolves
     * with true.
     * @method player.canSubscribeBotAsync
     * @returns Resolves with true if user can subscribe bot
     * @example
     * ViberPlay.player.canSubscribeBotAsync()
     *   .then((result) => console.log(result));
     */
    canSubscribeBotAsync: (): Promise<boolean> =>
      conn.request<CanSubscribeBotResponse>('sgCanSubscribeBot'),

    /**
     * (Experimental) Start the process to subscribe the game's bot. Game
     * must check with ViberPlay.player.canSubscribeBotAsync() before this
     * API is called.
     * Please note that this API can terminate the game's window and navigate
     * user to the game's bot screen to start subscribing.
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
    subscribeBotAsync: (): Promise<void> =>
      conn.request<SubscribeBotResponse>('sgSubscribeBot')
  },

  payments: {
    /**
     * (Experimental)
     * @method payments.onReady
     * @returns
     * @example
     * ViberPlay.payments.onReady(function () {
     *   console.log('Ready to receive payments requests')
     * })
     */
    onReady: (callback: () => any): void => {
      conn.request('sgPaymentsOnReady').then(() => callback());
    },

    /**
     * (Experimental)
     * @method payments.getCatalogAsync
     * @returns Array of products with pricing information
     * @example
     * ViberPlay.payments.getCatalogAsync().then((catalog) => {
     *   console.log(catalog)
     * })
     */
    getCatalogAsync: (): Promise<Product[]> =>
      conn.request<PaymentsGetCatalogResponse>('sgPaymentsGetCatalog'),

    /**
     * (Experimental)
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

      return conn.request<PaymentsPurchaseResponse>('sgPaymentsPurchaseV2', {
        productId: config.productID,
        developerPayload: config.developerPayload
      });
    },

    /**
     * (Experimental)
     * @method payments.getPurchasesAsync
     * @returns purchases
     * @example
     * ViberPlay.payments.getPurchasesAsync().then((purchases) => {
     *   console.log(purchases);
     * })
     */
    getPurchasesAsync: (): Promise<Purchase[]> => {
      return conn.request<PaymentsGetPurchasesResponse>(
        'sgPaymentsGetPurchasesV2'
      );
    },

    /**
     * (Experimental)
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

      return conn.request<PaymentsConsumePurchaseResponse>(
        'sgPaymentsConsumePurchase',
        {
          purchaseToken
        }
      );
    }
  }
};

export default ViberPlay;
