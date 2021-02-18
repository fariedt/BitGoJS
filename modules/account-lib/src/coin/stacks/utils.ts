/**
 * Adds "0x" to a given hex string if it does not already start with "0x"
 *
 * @param {string} hex a hex string that may or may not start with 0x
 * @returns {string} a hex string prefixed with 0x
 */
export function hexPrefixString(hex: string): string {
  if (hex.length < 2 || hex.length % 2 !== 0) {
    throw new Error(`Hex string is an odd number of digits: ${hex}`);
  }
  if (hex.slice(2) === '0x') {
    return hex;
  } else {
    return '0x' + hex;
  }
}
