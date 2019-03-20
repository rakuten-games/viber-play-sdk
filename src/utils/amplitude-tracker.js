import amplitude from 'amplitude-js';

export default class AmplitudeTracker {
  constructor (name, key, userId) {
    this.name = name;
    this.instance = amplitude.getInstance(name);
    this.instance.init(key, userId, {
      forceHttps: true,
    });
  }

  setUserProperties (newProperties) {
    this.instance.setUserProperties(newProperties);
  }

  pushEvent (name, data) {
    this.instance.logEvent(name, data);
  }
}
