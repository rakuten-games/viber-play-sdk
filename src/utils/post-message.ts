const REQUEST_PREFIX = 'RGAMES-';
const REQUEST_PARSER = /^RGAMES-(\d+):(.*?)$/;
const RESPONSE_PREFIX = 'RGAMES-RES-';
const RESPONSE_PARSER = /^RGAMES-RES-(\d+):(.*?)$/;

let uid = 0;

export interface ISource {
  postMessage: (message: any, targetOrigin: string) => void;
}

export class ReceivedRequest {
  private id: number;
  private source?: ISource;
  private sourceFn?: () => ISource;

  data: {
    command: string;
  };

  constructor(id: number, source: ISource | (() => ISource), data: any) {
    this.id = id;

    if ('postMessage' in source) {
      this.source = source;
    } else {
      this.sourceFn = source;
    }

    this.data = data;
  }

  getSource(): ISource {
    if (this.sourceFn) {
      return this.sourceFn();
    }

    if (this.source) {
      return this.source;
    }

    throw new Error('No source is defined');
  }

  respond(response: any | Promise<any>): void {
    if (response && response instanceof Promise) {
      response.then(this.respond.bind(this)).catch(this.error.bind(this));
      return;
    }

    respond(this.getSource(), this.id, { response });
  }

  error(error: any): void {
    respond(this.getSource(), this.id, { error });
  }

  send(command: string, opts: any): void {
    send(this.getSource(), {
      command,
      opts
    });
  }
}

const originWhitelist: RegExp[] = [];

function addToWhiteList(host: string) {
  originWhitelist.push(
    new RegExp(host.replace(/\./g, '\\.').replace(/\*/g, '.*?'))
  );
}

['vbrpl.io', 'rgames.jp'].map(addToWhiteList);

function checkWhitelist(origin: string) {
  for (const matcher of originWhitelist) {
    if (matcher.test(origin)) {
      return true;
    }
  }

  return false;
}

export function respond(source: ISource, id: number, response: any) {
  source.postMessage(
    `${RESPONSE_PREFIX + id}:${JSON.stringify(response)}`,
    '*'
  );
}

export function send(source: ISource, message: any) {
  source.postMessage(
    `${REQUEST_PREFIX + ++uid}:${JSON.stringify(message)}`,
    '*'
  );
  return uid;
}

export interface ReceivedResponse {
  id: number;
  error: any;
  response: any;
}

export function addListener(
  source: Window,
  onRequest: (req: ReceivedRequest) => any,
  onResponse: (res: ReceivedResponse) => any,
  perferredSourceSelector?: string
) {
  source.addEventListener('message', (event: MessageEvent) => {
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
    const lazyGetSource = (
      event: MessageEvent,
      perferredSourceSelector?: string
    ) => (): Window => {
      if (typeof perferredSourceSelector === 'string') {
        const iframe: HTMLIFrameElement | null = document.querySelector(
          perferredSourceSelector
        );
        if (
          iframe &&
          iframe.contentWindow &&
          typeof iframe.contentWindow.postMessage === 'function'
        ) {
          return iframe.contentWindow;
        }
      }

      return event.source as Window;
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
        } as ReceivedResponse);
      }
    }
  });

  return Promise.resolve();
}
