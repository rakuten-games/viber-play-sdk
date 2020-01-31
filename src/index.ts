import isEmpty from 'lodash-es/isEmpty';
import isPlainObject from 'lodash-es/isPlainObject';
import conn from './utils/conn';
import state from './sdk/state';
import Leaderboard from './sdk/leaderboard';
import { InterstitialAdInstance, RewardedVideoAdInstance } from './sdk/ad-instance';
import getLocalizationString from './utils/get-localization-string';
import { lock } from './utils/scroll-lock';
import { CustomUpdatePayload } from './types/custom-update-payload';
import { SharePayload } from './types/share-payload';
import { InitializationOptions } from './types/initialization';
import { ShareResult } from './types/share-result';
import { EntryPointData } from './types/entry-point-data';
import { TrafficSource } from './types/traffic-source';

import {
  ReadyResponse,
  InitializeResponse,
  ShareResponse,
  StartGameResponse,
  GetLeaderboardResponse,
  SwitchGameResponse,
  QuitResponse,
  SetLoadingProgressResponse,
  UpdateResponse,
  SetSessionDataResponse,
  SubscribePlatformBotResponse,
  GetInterstitialAdResponse
} from './types/bridge';

/**
 * Top level namespace wrapping the SDK.
 */
namespace ViberPlay {
  /**
   * Flag to prevent double execution of initialization.
   * @hidden
   */
  let isInitialized = false;

  /**
   * Initialize the SDK for the game. In the background, SDK will try to
   * setup environment and retrieve data for later use in the game.
   * We recommend calling this API in the game ASAP to shorten the loading wait.
   * @param options Extra options to alter the runtime behavior of the SDK.
   */
  export function initializeAsync (options: InitializationOptions = {}): Promise<void> {
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
  }

  /**
   * Updates the load progress of the game. The value will be shown at the
   * loading screen.
   * @param percentage Represents percentage of loading progress. It should
   * be between 0 and 100.
   * @example
   * ViberPlay.setLoadingProgress(50); // The game is halfway loaded
   */
  export function setLoadingProgress (percentage: number = 0): void {
    conn.request<SetLoadingProgressResponse>('sgSetLoadingProgress', {
      loadingProgress: Math.min(100, Math.max(Math.round(percentage), 0))
    });
  }

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
  export function startGameAsync (): Promise<void> {
    return conn.request<StartGameResponse>('sgStartGame')
  }

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
  export function updateAsync (payload: CustomUpdatePayload): Promise<void> {
    if (!state.context.id) {
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
  }

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
  export function shareAsync (payload: SharePayload): Promise<ShareResult> {
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
  }

  /**
   * Close the game webview.
   * [TODO] Currently not working in Viber.`
   */
  export function quit (): void {
    conn.request<QuitResponse>('sgQuit');
  }

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
  export function getLocale (): string {
    return navigator.language;
  }

  /**
   * Get the entry point data bound to this message.
   */
  export function getEntryPointData (): EntryPointData {
    return state.entryPointData || {}
  }

  /**
   * [TODO]
   */
  export function onPause (): void {
    return
  }

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
  export function setSessionData (sessionData: object): void {
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
  }

  /**
   * Get a leaderboard by its name
   * @param name - The name of the leaderboard
   * @example
   * ViberPlay.getLeaderboardAsync('some_leaderboard')
   *   .then(leaderboard => {
   *     console.log(leaderboard.getName()); // 'some_leaderboard'
   *   });
   */
  export function getLeaderboardAsync (name: string): Promise<Leaderboard> {
    return Promise.resolve()
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
      )
  }

  /**
   * (Experimental) Subscribe the platform bot.
   * @example
   * ViberPlay.subscribePlatformBotAsync();
   */
  export function subscribePlatformBotAsync (): Promise<void> {
    return conn
      .request<SubscribePlatformBotResponse>('sgSubscribePlatformBot')
      .then(() => {})
  }

  /**
   * (Experimental) Get AdInstance of an interstitial ad placement
   * @example
   * ViberPlay.getInterstitialAdAsync('DUMMY_PLACEMENT_ID')
   *   .then((adInstance) => {
   *     // do something
   *   });
   */
  export function getInterstitialAdAsync (
    placementId: string
  ): Promise<InterstitialAdInstance> {
    return conn
      .request<GetInterstitialAdResponse>('sgGetInterstitialAd', {
        placementId
      })
      .then(res => new InterstitialAdInstance(res))
  }

  /**
   * (Experimental) Get AdInstance of a rewarded video ad placement
   * @example
   * ViberPlay.getRewardedVideoAdAsync('DUMMY_PLACEMENT_ID')
   *   .then((adInstance) => {
   *     // do something
   *   });
   */
  export function getRewardedVideoAdAsync (
    placementId: string
  ): Promise<RewardedVideoAdInstance> {
    return Promise.resolve(
      new RewardedVideoAdInstance({
        placementId
      })
    )
  }

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
  export function switchGameAsync (gameId: string, data?: object): Promise<void> {
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
  }

  /**
   * (Experimental) Get traffic source related url params set
   * on the game's wrapper.
   * @example
   * // Should be called after ViberPlay.initializeAsync() resolves
   * const trafficSource = ViberPlay.getTrafficSource();
   * console.log(trafficSource['utm_source']); // 'viber'
   */
  export function getTrafficSource (): TrafficSource {
    return state.trafficSource
  }

  /**
   * (Experimental) Get information about where the game is started.
   * @example
   * ViberPlay.getEntryPointAsync().then(console.log); // 'game_switch'
   */
  export function getEntryPointAsync (): Promise<string> {
    return Promise.resolve(ViberPlay.getTrafficSource()).then(
      trafficSource => trafficSource['r_entrypoint'] || ''
    )
  }
}


conn
  .request<ReadyResponse>('sgReady')
  .then(({ gameId }) => {
    state.gameId = gameId;
  })
  .catch(() => {});

export default ViberPlay;
