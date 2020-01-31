import { send, addListener, ISource, ReceivedResponse, ReceivedRequest } from './post-message';

/** @hidden */
const IS_IOS = /iPhone/.test(navigator.userAgent);

/** @hidden */
interface Request {
  reject: (error: Error) => any;
  resolve: (response: any) => any;
}

/** @hidden */
export class Messenger {
  requests: {
    [id: string]: Request;
  };

  target: Promise<ISource>;

  width?: number;

  constructor() {
    this.requests = {};

    this.target = Promise.resolve({
      postMessage: window.parent.postMessage.bind(window.parent),
    });

    addListener(
      window,
      (receivedRequest: ReceivedRequest) => {
        const { command } = receivedRequest.data;

        if (command === 'resize') {
          try {
            if (IS_IOS) {
              document.body.style.display = 'none';
              this.width = document.body.offsetWidth;
            }

            window.dispatchEvent(new Event('resize'));
          } finally {
            if (IS_IOS) {
              document.body.style.display = 'block';
            }
          }
        }
        // currently, the game-wrapper does not make any requests to the game
      },
      ({
        id,
        error,
        response
      }: ReceivedResponse) => {
        if (error) {
          this.requests[id].reject(error);
        } else {
          this.requests[id].resolve(response);
        }
        delete this.requests[id];
      }
    );
  }

  request<T>(command: string, opts?: object) {
    return new Promise((resolve, reject) => {
      this.target.then(source => {
        const id = send(source, {
          command,
          opts
        });

        this.requests[id] = { resolve, reject };
      });
    }) as Promise<T>;
  }
}

/** @hidden */
const instance = new Messenger();

export default instance;
