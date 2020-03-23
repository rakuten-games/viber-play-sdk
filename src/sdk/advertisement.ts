import conn from '../utils/conn';

const adInstances:{ [index:string] : any } = {}

class AdInstance {
  private placementId: string;
  private isLoaded: boolean;
  private createdTime: number;

  constructor (placementId:string) {
    this.placementId = placementId
    this.createdTime = new Date().getTime()
    this.isLoaded = false

    adInstances[placementId] = this
  }

  getPlacementID(): string {
    return this.placementId
  }

  loadAsync(): Promise<any> {
    return conn.request('sgAdLoadAsync', {placementId: this.placementId});
  }

  showAsync(): Promise<any> {
    return conn.request('sgAdShowAsync', {placementId: this.placementId});
  }
}

export function getInterstitialAdAsync (placementId:string): Promise<any> {  
  return conn.request('sgGetInterstitialAd', {placementId})
    .then(rsp => {
      const newAdInstance = adInstances[placementId] || new AdInstance(placementId)
      return newAdInstance
    });
}
