/**
 * Enable passing localizable content to API calls.
 * SDK will use the current player's locale for locale matching.
 */
export interface LocalizableContent {
  /** Text will be used if not finding matching locale */
  default: string,
  localizations: Record<string, string>
}
