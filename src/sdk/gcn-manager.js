// @flow
type GCNClientInstance = {};

const GCN_SESSION_API =
  'https://ifogka307d.execute-api.us-east-2.amazonaws.com/volatile/session';
const GCN_APP_ID_ALIASES = {
  arrQ8wIzzfBHsR0Cerroqns8ledhtug5: {
    gameId: 'joker-demo',
    env: 'prod'
  },
  eGIynhlQHK1s0kI2tlxvdPTuTPp6KSdd: {
    gameId: 'joker-demo-test',
    env: 'dev'
  },
  '0gqpUsXkRickE1RRdxa6EryccAqrsDfd': {
    gameId: 'everknife-viber-dev',
    env: 'dev'
  },
  qUwJoPZYBq4RTpYxAqtDHw5kiTJkx2B3: {
    gameId: 'everknife-viber',
    env: 'prod'
  },
  DdXu6aVCaV4nfTYSntDvkd09PDcxt1Nr: {
    gameId: 'floppy-kick-test',
    env: 'dev'
  },
  muzP9rsUVYi4cTj3L7qyrygAAf24ngkE: {
    gameId: 'floppy-kick',
    env: 'prod'
  },
  jaHlCbu3ap4ZeyYB5Gxrh8R2oIkA1xcV: {
    gameId: 'retro-ninja-wars-test',
    env: 'dev'
  },
  G8gEvG9MkS8V27OOt3iZxawYdpSqKZp9: {
    gameId: 'retro-ninja-wars',
    env: 'prod'
  },
  GxuZkoY9XUbylEvu0k6cVvXy6pqFrauC: {
    gameId: 'hungry-frogs-test',
    env: 'dev'
  },
  gjG1c5IN7ex0oB1FejDjMof72Hic69gS: {
    gameId: 'hungry-frogs',
    env: 'prod'
  },
  WH8AYGLWfOatNy5rx0sxNDdt1FezoMKI: {
    gameId: 'odenden-test',
    env: 'dev'
  },
  WEaVE8OtWc9JoyaqvwrEXonGNK8TW2Ja: {
    gameId: 'odenden',
    env: 'prod'
  },
  PlQoL1L1z7llqnqVgMXm04xEdRCynR8e: {
    gameId: 'sticker-stack-test',
    env: 'dev'
  },
  '03ehsFdQ25htBmk23ECZXVBVGmjgLv7E': {
    gameId: 'sticker-stack',
    env: 'prod'
  },
  stBazrHhbzaOiVJZoCrudL0gQntmhKbK: {
    gameId: 'panda-park-test',
    env: 'dev'
  },
  M8QTP8jE5KCmGZ9pED3w1Ql1rdaUdF5C: {
    gameId: 'panda-park',
    env: 'prod'
  }
};

const notLoadedError = new Error('client not loaded');

const GCNManager = new class {
  constructor() {
    this.client = null;
  }

  init(
    gameId: string,
    playerId: string,
    getSignedPlayerInfo,
    switchGameAsync
  ): Promise<GCNClientInstance> {
    const game = GCN_APP_ID_ALIASES[gameId];
    if (!game) {
      return Promise.resolve();
    }

    if (GCNManager.initPromise) {
      return GCNManager.initPromise;
    }

    const gcnGameId = game.gameId;
    const amplitudeKey =
      game && game.env === 'prod'
        ? process.env.GCN_PROD_AMPLITUDE_KEY
        : process.env.GCN_DEV_AMPLITUDE_KEY;

    GCNManager.initPromise = Promise.all([
      import('@blackstormlabs/gcn-client/dist/GCNClient').then(
        pkg => pkg && pkg.default
      ),
      import('../utils/amplitude-tracker').then(pkg => pkg && pkg.default)
    ])
      .then(([GCNClient, AmplitudeTracker]) => {
        const promotionPayload = {
          channel: 'SWITCH',
          gameID: gameId,
          gameVersion: '',
          gamePlayerID: playerId
        };

        // mocks
        const regionCode = 'US';
        const platform = {
          name: 'viber',
          storage: {
            // using localStorage as workaround
            get(key) {
              return Promise.resolve(localStorage.getItem(key));
            },
            set(key, val) {
              return Promise.resolve(localStorage.setItem(key, val));
            }
          },
          switchGame: switchGameAsync,
          getRewardedVideo: i => i,
          getInterstitialAd: i => i
        };

        this.client = new GCNClient(
          gcnGameId,
          gcnGameId,
          promotionPayload,
          regionCode,
          new AmplitudeTracker('gcn', amplitudeKey, playerId),
          platform
        );
      })
      .then(() => getSignedPlayerInfo())
      .then(result => result.getSignature())
      .then(signature =>
        fetch(GCN_SESSION_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            app_id: gcnGameId,
            platform_id: 'viber',
            signed_payload: signature
          })
        })
      )
      .then(res => {
        if (!res.ok) throw new Error('GCN_SESSION_ERROR');
        return res.json();
      })
      .then(data => data.token)
      .then(token => {
        if (this.client.initialized) return this.client;

        this.client.setAuthToken(token);
      })
      .catch(err => {
        if (err.message === 'GCN_SESSION_ERROR') {
          console.warn('GCN_SESSION_ERROR');
        } else {
          throw err;
        }
      });

    return GCNManager.initPromise;
  }

  hasPreloadedAds() {
    return this.client
      ? this.client.adInstances.length > 0
      : false;
  }

  preload(placementId) {
    return !this.client
      ? Promise.reject(notLoadedError);
      : this.client.preloadAd({
        ingamePlacementID: placementId
      });
  }

  show(placementId) {
    return this.client
      ? this.client.showPreloadedAd(placementId)
      : Promise.reject(notLoadedError);
  }
}();

export default GCNManager;
