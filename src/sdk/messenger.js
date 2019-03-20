import { send, addListener } from '../mirror/post-message';

const IS_IOS = /iPhone/.test(navigator.userAgent);

let instance;

export default class Messenger {
  constructor() {
    this.requests = {};

    this.target = Promise.resolve({
      postMessage: window.parent.postMessage.bind(window.parent)
    });

    addListener(
      window,
      request => {
        const { command } = request.data;

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
      ({ id, error, response }) => {
        if (error) {
          this.requests[id].reject(error);
        } else {
          this.requests[id].resolve(response);
        }
        delete this.requests[id];
      }
    );
  }

  request(command, opts) {
    return new Promise((resolve, reject) => {
      this.target.then(source => {
        const id = send(source, {
          command,
          opts
        });

        this.requests[id] = { resolve, reject };
      });
    });
  }
}

export const getMessenger = () => {
  if (!instance) {
    instance = new Messenger();
  }

  return instance;
};
