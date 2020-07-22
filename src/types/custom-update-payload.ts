import { LocalizableContent } from './localizable-content';

export interface CustomUpdatePayload {
  /** Message format to be used. */
  action: 'CUSTOM',
  /** A placeholder for specifying message template. Not in use. */
  template: string,
  /** Text of the call to action button. If not specified, "Play" will be used by default. */
  cta?: string | LocalizableContent,
  /** A string containing data URL of a base64 encoded image. */
  image: string,
  /** Text of the message body. */
  text: string | LocalizableContent,
  /**
   * Object passed to any session launched from this update message.
   * It can be accessed from `ViberPlay.getEntryPointData()`.
   * Its size must be <=1000 chars when stringified.
   */
  data?: Record<string, unknown>,
  /**
   * Defines how the update message should be delivered.
   * 'IMMEDIATE': will be sent immediately.
   * 'LAST': when the game session ends, the latest payload will be sent.
   * 'IMMEDIATE_CLEAR': will be sent immediately, and also discard any pending `LAST` payloads in the same session.
   */
  strategy?: 'IMMEDIATE' | 'LAST' | 'IMMEDIATE_CLEAR',
  /** 
   * A placeholder for specifying if the message should trigger push notification.
   * Not in use. For now, all messages sent will trigger a push notification.
   */
  notification?: 'NO_PUSH' | 'PUSH',
}
