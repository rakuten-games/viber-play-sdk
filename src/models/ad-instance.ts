/* eslint-disable class-methods-use-this */
import conn from "../utils/conn";
import { AdInstanceRawData, AdType } from "../types/ad-instance";

/** @hidden */
interface AdRawData {
  placementId: string;
  type?: AdType;
}

/** @hidden */
interface IAdInstance {
  getPlacementID(): string;
  loadAsync(): Promise<void>;
  showAsync(): Promise<void>;
}

/** @hidden */
export default class AdInstance implements IAdInstance {
  protected $ad: AdRawData;
  /**
   * @hidden
   */
  constructor(payload: AdInstanceRawData) {
    this.$ad = {
      placementId: payload.placementId,
    };
  }

  /**
   * (Experimental) Get the ad's placement ID.
   * @returns Placement ID
   * @example
   * ```
   * adInstance.getPlacementID() // '5458282176661711'
   * ```
   */
  getPlacementID() {
    return this.$ad.placementId;
  }

  /**
   * (Experimental) Start loading ad.
   * @example
   * ```
   * // after adInstance is created
   * adInstance.loadAsync();
   * ```
   */
  loadAsync() {
    return Promise.resolve();
  }

  /**
   * (Experimental) Show the loaded ad to player. The returned promise will be only resolved
   * when user finished watching the ad. It will reject when ad is skipped during the playback
   * or failed to load.
   * @example
   * ```
   * // after adInstance is loaded
   * adInstance.showAsync();
   * ```
   */
  showAsync() {
    return Promise.resolve();
  }
}

export class InterstitialAdInstance extends AdInstance {
  /**
   * @hidden
   */
  constructor(payload: AdInstanceRawData) {
    super(payload);
    this.$ad.type = AdType.AD_TYPE_INTERSTITIAL;
  }

  loadAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request("sgLoadInterstitialAd", {
          placementId: this.$ad.placementId,
        })
      )
      .then(() => undefined);
  }

  showAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request("sgShowInterstitialAd", {
          placementId: this.$ad.placementId,
        })
      )
      .then(() => undefined);
  }
}

export class RewardedVideoInstance extends AdInstance {
  /**
   * @hidden
   */
  constructor(payload: AdInstanceRawData) {
    super(payload);
    this.$ad.type = AdType.AD_TYPE_REWARDED_VIDEO;
  }

  loadAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request("sgLoadRewardedVideo", {
          placementId: this.$ad.placementId,
        })
      )
      .then(() => undefined);
  }

  showAsync() {
    return Promise.resolve()
      .then(() =>
        conn.request("sgShowRewardedVideo", {
          placementId: this.$ad.placementId,
        })
      )
      .then(() => undefined);
  }
}
