import { getMessenger } from './sdk/messenger';

/**
 * The Messenger instance that sends/receives messages between game wrapper.
 * @hidden
 */
const conn = getMessenger();

export default conn;
