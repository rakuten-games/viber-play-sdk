import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks
} from 'body-scroll-lock';

let defaultElement : Element

function getElement(selector: string | Element): Element {
  if (typeof selector === 'string') {
    const el = document.querySelector(selector)
    if (el) return el
  } else if (selector instanceof Element) {
    return selector
  }
  
  return defaultElement || document.createElement('div')
}

export function lock(selector: string | Element): void {
  disableBodyScroll(getElement(selector));
}

export function unlock(selector: string | Element): void {
  enableBodyScroll(getElement(selector));
}

export function unlockAll(): void {
  clearAllBodyScrollLocks();
}
