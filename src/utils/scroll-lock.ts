import { disableBodyScroll } from 'body-scroll-lock';

/** @hidden */
let defaultElement: Element;

/** @hidden */
function getElement(selector: string | Element): Element {
  if (typeof selector === 'string') {
    const el = document.querySelector(selector);
    if (el) return el;
  } else if (selector instanceof Element) {
    return selector;
  }

  return defaultElement || document.createElement('div');
}

/** @hidden */
export function lock(selector: string | Element): void {
  const target = getElement(selector);
  if (target === document.body) return;

  disableBodyScroll(target);
}
