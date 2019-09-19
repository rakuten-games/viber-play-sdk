/* eslint-disable class-methods-use-this */
import { getMessenger } from './messenger';

export interface AdInstancePayload {
  placementId: string;
}

const AD_TYPE_INTERSTITIAL = 'AD_TYPE_INTERSTITIAL';
const AD_TYPE_REWARDED_VIDEO = 'AD_TYPE_REWARDED_VIDEO';
const conn = getMessenger();

interface AdRowData {
  placementId: string;
  type?: 'AD_TYPE_INTERSTITIAL' | 'AD_TYPE_REWARDED_VIDEO';
}

interface IAdInstance {
  getPlacementID(): string;
  loadAsync(): Promise<void>;
  showAsync(): Promise<void>;
}

/**
 * (Experimental) Representing an ad.
 */
export default class AdInstance implements IAdInstance {
  private $ad: AdRowData;
  /**
   * @hideconstructor
   */
  constructor(payload: AdInstancePayload) {
    this.$ad = {
      placementId: payload.placementId
    };
  }

  /**
   * (Experimental) Get the ad's placement ID.
   * @returns Placement ID
   * @example
   * adInstance.getPlacementID(); // '5458282176661711'
   */
  getPlacementID() {
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
  loadAsync() {
    return Promise.resolve();
  }

  /**
   * (Experimental) Show the loaded ad to player. The returned promise will be only resolved
   * when user closed the ad's overlay.
   * @example
   * // after adInstance is loaded
   * adInstance.showAsync();
   */
  showAsync() {
    return Promise.resolve();
  }
}

export class InterstitialAdInstance extends AdInstance {
  constructor(payload: AdInstancePayload) {
    super(payload);
    this.$ad.type = AD_TYPE_INTERSTITIAL;
  }

  loadAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request('sgLoadInterstitialAd', {
          placementId: this.$ad.placementId
        })
      )
      .then(() => undefined);
  }

  showAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request('sgShowInterstitialAd', {
          placementId: this.$ad.placementId
        })
      )
      .then(() => undefined);
  }
}

export class RewardedVideoAdInstance extends AdInstance {
  constructor(payload: AdInstancePayload) {
    super(payload);
    this.$ad.type = AD_TYPE_REWARDED_VIDEO;
  }

  loadAsync() {
    const adsNoFillErr = {
      code: 'ADS_NO_FILL',
      message: 'Ads failed to be filled'
    };

    return Promise.reject(adsNoFillErr);
  }

  showAsync() {
    const adsNotLoadedErr = {
      code: 'ADS_NOT_LOADED',
      message: 'Ads failed to be filled or loaded'
    };

    return Promise.reject(adsNotLoadedErr);
  }
}
