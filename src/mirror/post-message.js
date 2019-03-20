/* eslint-disable */
// from rg-utils

export const REQUEST_PREFIX = 'RGAMES-';
export const REQUEST_PARSER = /^RGAMES-(\d+):(.*?)$/;
export const RESPONSE_PREFIX = 'RGAMES-RES-';
export const RESPONSE_PARSER = /^RGAMES-RES-(\d+):(.*?)$/;

let uid = 0;

export default class ReceivedRequest {
  constructor(id, source, data) {
    this.id = id;

    if (
      typeof source === 'object' &&
      typeof source.postMessage === 'function'
    ) {
      this._source = source;
    } else if (typeof source === 'function') {
      this._getSource = source;
    }

    this.data = data;
  }

  getSource() {
    if (this._getSource) {
      return this._getSource();
    }

    return this._source;
  }

  respond(response) {
    if (response && response.then) {
      return response
        .then(this.respond.bind(this))
        .catch(this.error.bind(this));
    }

    respond(this.getSource(), this.id, { response });
  }

  error(error) {
    respond(this.getSource(), this.id, { error });
  }

  send(command, opts) {
    send(this.getSource(), {
      command,
      opts
    });
  }
}

const originWhitelist = [];

export function addToWhiteList(host) {
  originWhitelist.push(
    new RegExp(host.replace(/\./g, '\\.').replace(/\*/g, '.*?'))
  );
}

['vbrpl.io'].map(addToWhiteList);

function checkWhitelist(origin) {
  for (const matcher of originWhitelist) {
    if (matcher.test(origin)) {
      return true;
    }
  }

  return false;
}

export function respond(source, id, response) {
  source.postMessage(
    `${RESPONSE_PREFIX + id}:${JSON.stringify(response)}`,
    '*'
  );
}

export function send(source, message) {
  source.postMessage(
    `${REQUEST_PREFIX + ++uid}:${JSON.stringify(message)}`,
    '*'
  );
  return uid;
}

export function addListener(
  source,
  onRequest,
  onResponse,
  perferredSourceSelector
) {
  source.addEventListener('message', event => {
    if (
      (process.env.NODE_ENV === 'production' &&
        !checkWhitelist(event.origin)) ||
      typeof event.data !== 'string'
    ) {
      return;
    }

    let match = event.data.match(REQUEST_PARSER);

    // lazyGetSource is enforced to work around a Safari issue to prevent
    // losing connection with game contentWindow when games trying to change
    // the window object (e.g. reload)
    const lazyGetSource = (event, perferredSourceSelector) => () => {
      if (typeof perferredSourceSelector === 'string') {
        const iframe = document.querySelector(perferredSourceSelector);
        if (
          iframe &&
          iframe.contentWindow &&
          typeof iframe.contentWindow.postMessage === 'function'
        ) {
          return iframe.contentWindow;
        }
      }

      return event.source;
    };

    if (match && onRequest) {
      onRequest(
        new ReceivedRequest(
          parseInt(match[1]),
          lazyGetSource(event, perferredSourceSelector),
          JSON.parse(match[2])
        )
      );
    } else if (onResponse) {
      match = event.data.match(RESPONSE_PARSER);
      if (match) {
        const id = parseInt(match[1]);
        const data = JSON.parse(match[2]);
        onResponse({
          id,
          error: !('response' in data) && (data.error || data),
          response: data.response
        });
      }
    }
  });

  return Promise.resolve();
}
