// @flow
/* eslint-disable class-methods-use-this */
import { getMessenger } from './messenger';
import GCNManager from './gcn-manager';

export type AdInstancePayload = {
  placementId: string
};

const AD_TYPE_INTERSTITIAL = 'AD_TYPE_INTERSTITIAL';
const AD_TYPE_REWARDED_VIDEO = 'AD_TYPE_REWARDED_VIDEO';
const conn = getMessenger();

/**
 * (Experimental) Representing an ad.
 */
export default class AdInstance {
  /**
   * @hideconstructor
   */
  constructor(payload: AdInstancePayload) {
    this.$ad = {};
    this.$ad.placementId = payload.placementId;
  }

  /**
   * (Experimental) Get the ad's placement ID.
   * @returns Placement ID
   * @example
   * adInstance.getPlacementID(); // '5458282176661711'
   */
  getPlacementID(): string {
    return this.$ad.placementId;
  }

  /**
   * (Experimental) Start loading ad.
   * Notes: On Android, the interstitial ad will start autoplaying right
   * after it's loaded. To give the best result, please start loading the
   * interstitial ad right before you want to show it.
   * @example
   * // after adInstance is created
   * adInstance.loadAsync();
   */
  loadAsync(): string {
    return Promise.resolve();
  }

  /**
   * (Experimental) Show the loaded ad to player. The returned promise will be only resolved
   * when user closed the ad's overlay.
   * @example
   * // after adInstance is loaded
   * adInstance.showAsync();
   */
  showAsync(): Promise<void> {
    return Promise.resolve();
  }
}

export class InterstitialAdInstance extends AdInstance {
  constructor(payload: AdInstancePayload) {
    super(payload);
    this.$ad.type = AD_TYPE_INTERSTITIAL;
  }

  loadAsync(): string {
    return Promise.resolve().then(() =>
      conn.request('sgLoadInterstitialAd', {
        placementId: this.$ad.placementId,
      }));
  }

  showAsync(): Promise<void> {
    return Promise.resolve().then(() =>
      conn.request('sgShowInterstitialAd', {
        placementId: this.$ad.placementId,
      }));
  }
}

export class RewardedGCNAdInstance extends AdInstance {
  constructor(payload: AdInstancePayload) {
    super(payload);
    this.$ad.type = AD_TYPE_REWARDED_VIDEO;
  }

  loadAsync(): string {
    return GCNManager.preload(this.$ad.placementId).then(() => undefined)
      .catch(() => {
        if (!GCNManager.hasPreloadedAds()) {
          const adsNoFillErr = {
            code: 'ADS_NO_FILL',
            message: 'Ads failed to be filled',
          };

          throw adsNoFillErr;
        }
      });
  }

  showAsync(): Promise<void> {
    return GCNManager.show(this.$ad.placementId).then(() => undefined)
      .catch(() => {
        const adsNotLoadedErr = {
          code: 'ADS_NOT_LOADED',
          message: 'Ads failed to be filled or loaded',
        };

        throw adsNotLoadedErr;
      });
  }
}

export const RewardedVideoAdInstance = RewardedGCNAdInstance;
export const GCNAdInstance = RewardedGCNAdInstance;
