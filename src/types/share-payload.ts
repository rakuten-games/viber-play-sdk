import { LocalizableContent } from './localizable-content'
import { ContextFilter } from './context'

export interface SharePayload {
  /** 
   * Message format to be used.
   * There's no visible difference among the available options.
   */
  intent: 'INVITE' | 'REQUEST' | 'CHALLENGE' | 'SHARE',
  /** A string containing data URL of a base64 encoded image. */
  image: string,
  /** Text of the message body. */
  text: string | LocalizableContent,
  /**
   * Object passed to any session launched from this update message.
   * It can be accessed from `ViberPlay.getEntryPointData()`.
   * Its size must be <=1000 chars when stringified.
   */
  data?: object,
  /**
   * An array of filters to be applied to the friend list.
   * (Please note that filter combinations are not supported. Only the first filter is respected, the later ones are simply just ignored.)
   */
  filters?: ContextFilter[],
  /**
   * Specify how long a friend should be filtered out after the curent player sends him/her a message.
   * This parameter only applies when `NEW_INVITATIONS_ONLY` filter is used.
   * When not specified, it will filter out any friend who has been sent a message.
   */
  hoursSinceInvitation?: number,
  /**
   * Defining the minimum number of players to be selected to start sharing.
   */
  minShare?: number,
  /** 
   * Optional customizable text field in the share UI.
   * This can be used to describe the incentive a user can get from sharing.
   */
  description?: string | LocalizableContent,
  /**
   * Optional property to switch share UI mode.
   * Default: Serial contact card with share and skip button.
   * MULTIPLE: Selectable contact list.
  */
  ui?: 'DEFAULT' | 'MULTIPLE',
};
