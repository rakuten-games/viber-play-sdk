export enum AdType {
  AD_TYPE_INTERSTITIAL = 'AD_TYPE_INTERSTITIAL',
  AD_TYPE_REWARDED_VIDEO = 'AD_TYPE_REWARDED_VIDEO',
};

export interface AdInstancePayload {
  placementId: string;
}
