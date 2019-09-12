window.test1 = () => {
  console.log('test1');
};

const LOG_ID = `logger-${Date.now()}`;

const STYLESHEET = `
#${LOG_ID} {
  position: fixed;
  z-index: 100;
  top: 50%;
  bottom: 10px;
  left: 10px;
  right: 10px;
  box-shadow: 0px 0px 5px rgba(0,0,0,0.5);
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  white-space: pre-wrap;
  word-break: break-all;
  background: rgba(0,0,0,0.9);
  color: #eee;
}
#${LOG_ID} div {
  display: flex;
  padding: 4px;
  line-height: 1.2em;
}
#${LOG_ID} div:nth-child(even) {
  background: rgba(75,75,75,0.5);
}
#${LOG_ID} div:nth-child(odd) {
  background: rgba(0,0,0,0.5);
}
#${LOG_ID} span {
  flex: 0 0 auto;
}
`;


const logEl = document.createElement('pre');
logEl.id = LOG_ID;
document.querySelector('.wrapper').appendChild(logEl);

const logStyle = document.createElement('style');
logStyle.textContent = STYLESHEET;
document.getElementsByTagName('head')[0].appendChild(logStyle);


let line;
let span;
let buffer = [];

function nextLine() {
  line = logEl.appendChild(document.createElement('div'));
}

function nextSpan() {
  flush();
  span = line.appendChild(document.createElement('span'));
}

function flush() {
  if (span) {
    span.innerText = `${buffer.join(' ')} `;
    buffer = [];
    span = null;
  }
}

let logScrollTop = 0;
let logScrollTarget = 0;
const autoScroll = true;
const SCROLL_THRESHOLD = 1;

const scrollLog = () => {
  if (!autoScroll) {
    return;
  }
  if (Math.abs(logEl.scrollTop - logScrollTarget) > SCROLL_THRESHOLD) {
    const direction = logScrollTarget > logEl.scrollTop ? 1 : -1;
    const delta = Math.max(1, Math.min(Math.abs(logScrollTarget - logEl.scrollTop) / 15, 100));
    logScrollTop += delta * direction; // float
    logEl.scrollTop = logScrollTop; // int
    requestAnimationFrame(scrollLog);
  }
};

const scrollLogToBottom = () => {
  logScrollTop = logEl.scrollTop;
  logScrollTarget = logEl.scrollHeight - logEl.offsetHeight;
  requestAnimationFrame(scrollLog);
};

const addLogEntry = (...args) => {
  nextLine();
  nextSpan();

  Array.from(args).forEach((piece) => {
    if (typeof piece === 'string') {
      buffer.push(piece);
    } else {
      flush();
      nextSpan();
      for (const key in piece) {
        span.style[key] = piece[key];
      }
    }
  });

  flush();
  scrollLogToBottom();
};


const callerStyle = {
  flex: '0 0 auto',
  maxWidth: '50%',
  color: '#999',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textAlign: 'right',
};

// TODO: consider promoting this to joker dev feature
// start hijack console calls
const stringifyJsValue = (i) => {
  if (i === void 0) {
    return 'undefined';
  } else if (typeof i === 'number') {
    if (!isFinite(i)) {
      if (isNaN(i)) {
        return 'NaN';
      }
      return `${i > 0 ? '' : '-'}Infinity`;
    }

    return JSON.stringify(i);
  } else if (typeof i === 'string') {
    return i;
  } else if (i instanceof Error) {
    return `${i.constructor.name}: ${i.message}\n${i.stack}`;
  } else if (PromiseRejectionEvent && i instanceof PromiseRejectionEvent) {
    return `PromiseRejectionEvent: ${JSON.stringify(i.reason)}`;
  }

  try {
    return JSON.stringify(i);
  } catch (e) {
    return '[object can\'t be stringified]';
  }
};

const textOutputStyles = {
  log: {
    flex: '1 0 100px',
    color: '#ffffff',
  },
  info: {
    flex: '1 0 100px',
    color: '#a5d5fe',
  },
  warn: {
    flex: '1 0 100px',
    color: '#fffdc3',
  },
  error: {
    flex: '1 0 100px',
    color: '#ff8373',
  },
};

const textOutputPrefix = {
  log: '📝',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
};

const hijack = (methodName) => {
  const orig = console[methodName];
  const style = textOutputStyles[methodName];
  const prefix = textOutputPrefix[methodName];

  if (typeof orig !== 'function' || !style) {
    return false;
  }

  console[methodName] = (...args) => {
    const parsedArgs = Array.from(args)
      .map(stringifyJsValue);

    // get stack
    const stackTrace = (new Error()).stack;
    // sanitize
    let caller = stackTrace.replace(/^\w*Error\s+/, '')
      .split('\n')[1] || ':';

    caller = caller.replace(/^.+\(/, '').replace(/^.+\//, '').replace(/^\s*at <anonymous>/, '<anonymous>');
    caller = caller.replace(/\)$/, '').replace(/:\d+$/, '');

    let [file, line] = caller.split(':');
    file = (file || '').replace(/#.+$/g, '');
    line = line || '';

    addLogEntry.apply(window, [prefix, style].concat(parsedArgs.join(), callerStyle, ` ${file}:${line}`));

    return orig.apply(console, parsedArgs);
  };

  return console[methodName];
};

hijack('log');
hijack('info');
hijack('warn');
hijack('error');
// end hijack console calls

function pad(val) {
  return (`        ${val}`).slice(-8);
}
