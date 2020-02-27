import isEmpty from 'lodash-es/isEmpty';
import isPlainObject from 'lodash-es/isPlainObject';

import conn from '../utils/conn';
import state from '../utils/state';
import Leaderboard from '../models/leaderboard';
import { InterstitialAdInstance, RewardedVideoAdInstance } from '../models/ad-instance';
import getLocalizationString from '../utils/get-localization-string';
import { lock } from '../utils/scroll-lock';
import { CustomUpdatePayload } from '../types/custom-update-payload';
import { SharePayload } from '../types/share-payload';
import { InitializationOptions } from '../types/initialization';
import { ShareResult } from '../types/share-result';
import { EntryPointData } from '../types/entry-point-data';
import { TrafficSource } from '../types/traffic-source';
import {
  InitializeResponse,
  ShareResponse,
  StartGameResponse,
  GetLeaderboardResponse,
  SwitchGameResponse,
  QuitResponse,
  SetLoadingProgressResponse,
  UpdateResponse,
  SetSessionDataResponse,
  GetInterstitialAdResponse
} from '../types/bridge';

import * as _context from './context'
import * as _player from './player'
import * as _payments from './payments'

/**
 * `ViberPlay.context` namespace contains context related APIs
 */
export const context = _context

/**
 * `ViberPlay.player` namespace contains player related APIs
 */   
export const player = _player

/**
 * `ViberPlay.payments` namespace contains payment related APIs
 */
export const payments = _payments

/**
 * To prevent dupe initialization.
 * @hidden
 */
let isInitialized = false;

/**
 * Initialize the SDK for the game.
 * In the background, SDK will try to setup environment and retrieve data for later use in the game.
 * We recommend calling this API in the game ASAP to shorten the total loading wait time for players.
 * @example
 * ```
 * ViberPlay.initializeAsync().then(() => {
 *   // Initialize player session with game backend
 * })
 * ```
 * @param options - Extra options to alter the runtime behavior of the SDK.
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
 * Updates the load progress of the game.
 * The value will be shown at the loading screen.

 * @param percentage Represents percentage of loading progress. It should be between 0 and 100.
 * @example
 * ```
 * ViberPlay.setLoadingProgress(50) // The game is halfway loaded
 * ```
 */
export function setLoadingProgress (percentage: number = 0): void {
  conn.request<SetLoadingProgressResponse>('sgSetLoadingProgress', {
    loadingProgress: Math.min(100, Math.max(Math.round(percentage), 0))
  });
}

/**
 * Starts the game. Calling this method will turn off the loading screen as soon as these requirements are met:
 * - ViberPlay.setLoadingProgress() is called with a number > 99
 * - ViberPlay.initializeAsync() is called and resolved
 * @example
 * ```
 * ViberPlay.startGameAsync().then(() => {
 *   myAwesomeGame.start()
 * })
 * ```
 */
export function startGameAsync (): Promise<void> {
  return conn.request<StartGameResponse>('sgStartGame')
}

/**
 * Post an update to the corresponding context. 
 * If the game is played in a messenger chat thread, this will post a message into the thread with the specified image and text message and custom data payload.
 * @param payload An object describes the update message
 * @example
 * ```
 * ViberPlay.updateAsync({
 *   action: 'CUSTOM',
 *   cta: 'Play',
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
 * }).then(() => {
 *   // After the update is posted, closes the game.
 *   ViberPlay.quit()
 * })
 * ```
 */
export function updateAsync (payload: CustomUpdatePayload): Promise<void> {
  if (!state.context.id) {
    return Promise.resolve();
  }

  let text;

  if (typeof payload.text === 'string') {
    ({ text } = payload);
  } else if (typeof payload.text === 'object') {
    const locale = getLocale();
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
    const locale = getLocale();
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
 * Share messages to the player's friends.
 * This will display an interactive UI for the user to choose who to share.
 * And additional parameters can be used to fine-tune the experience.
 * @param payload An object describes the message to be shared.
 * @example
 * ```
 * ViberPlay.shareAsync({
 *   intent: 'REQUEST',
 *   image: base64Picture,
 *   text: 'Some text',
 *   filters: ['NEW_CONTEXT_ONLY'],
 *   minShare: 3,
 *   data: { someData: '...' },
 *   description: 'Win 100 gems for every friend who joins from your invite.',
 * }).then(shareResult => {
 *   console.log(shareResult) // {sharedCount: 3}
 * })
 * ```
 */
export function shareAsync (payload: SharePayload): Promise<ShareResult> {
  let description = '';

  if (typeof payload.description === 'string') {
    ({ description } = payload);
  } else if (typeof payload.description === 'object') {
    const locale = getLocale();
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
 */
export function quit (): void {
  conn.request<QuitResponse>('sgQuit');
}

/**
 * Get the current player's locale information. 
 * Locale code will be based on `navigator.language` in the WebView, format will be align with [BCP47](http://www.ietf.org/rfc/bcp/bcp47.txt).
 * @example
 * ```
 * ViberPlay.getLocale() // 'ru-RU'
 * ```
 */
export function getLocale (): string {
  return navigator.language;
}

/**
 * Get the entry point data bound to the entry point.
 * @example
 * ```
 * // Should be called after ViberPlay.initializeAsync() resolves
 * ViberPlay.getEntryPointData() // { from: 'prequel-game' }
 * ```
 */
export function getEntryPointData (): EntryPointData {
  return state.entryPointData || {}
}

/**
 * Set a callback which will be invoked when game is paused due to native changes.
 * Not supported.
 */
export function onPause (): void {
  return
}

/**
 * Update data associated with the current game session.
 * Session data is persistent only within the current game session, and is used to populate payload of game_play webhook events.
 * If called multiple times during a session, data specified in subsequent calls will be merged with existing data at the top level.
 * @category Experimental
 * @param sessionData - an arbitrary data object
 * @example
 *```
 * ViberPlay.setSessionData({
 *   "high-score": 1000,
 *   "current-stage": "stage1",
 * })
 * 
 * ViberPlay.setSessionData({
 *   "current-stage": "stage2",
 * })
 * 
 * ViberPlay.quit()
 * // {"high-score":1000,"current-stage":"stage2"} will be sent with the game_play webhook event
 * ```
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
 * ```
 * ViberPlay.getLeaderboardAsync('some_leaderboard')
 *   .then(leaderboard => {
 *     console.log(leaderboard.getName()) // 'some_leaderboard'
 *   })
 * ```
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
 * Get AdInstance of an interstitial ad placement. Not supported.
 * @category Experimental
 * @example
 * ```
 * ViberPlay.getInterstitialAdAsync('DUMMY_PLACEMENT_ID')
 *   .then(adInstance => {
 *     // do something
 *   })
 * ```
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
 * Get AdInstance of a rewarded video ad placement. Not supported
 * @category Experimental
 * @example
 * ```
 * ViberPlay.getRewardedVideoAdAsync('DUMMY_PLACEMENT_ID')
 *   .then(adInstance => {
 *     // do something
 *   })
 * ```
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
 * Request to switch to another game
 * @category Experimental
 * @param gameId - the game ID of the target game
 * @param data - the entry point data for the target game, not supported
 * @example
 * ```
 * ViberPlay.switchGameAsync('SOMEGAMEID', {
 *   from: 'prequel-game'
 * }).catch(e => {
 *   // handling cases when failed to switch to the target game
 * })
 * ```
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
 * Get traffic source info.
 * This unveals the the URL parameters attached to the game's URL.
 * @category Experimental
 * @example
 * ```
 * // Should be called after ViberPlay.initializeAsync() resolves
 * const trafficSource = ViberPlay.getTrafficSource()
 * console.log(trafficSource['r_entrypoint']) // 'share'
 * ```
 */
export function getTrafficSource (): TrafficSource {
  return state.trafficSource
}

/**
 * Get information about where the game is started.
 * Details can be found at: <https://docs.viberplay.io/guide-analytics/index.html#how-to-get-information-about-entry-point>
 * @category Experimental
 * @example
 * ```
 * // Should be called after ViberPlay.initializeAsync() resolves
 * ViberPlay.getEntryPointAsync().then(entryPoint => {
 *   console.log(entryPoint) // 'game_switch'
 * })
 * ```
 */
export function getEntryPointAsync (): Promise<string> {
  return Promise.resolve(getTrafficSource()).then(
    trafficSource => trafficSource['r_entrypoint'] || ''
  )
}
