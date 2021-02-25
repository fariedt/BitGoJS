import {
  TransactionVersion,
  addressFromVersionHash,
  addressHashModeToVersion,
  addressToString,
  AddressHashMode,
} from '@blockstack/stacks-transactions';
import { StacksTransaction } from '@stacks/transactions';


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

/** Encodes a buffer as a `0x` prefixed lower-case hex string. */
export function bufferToHexPrefixString(buff: Buffer): string {
  return '0x' + buff.toString('hex');
}

function getAddressFromPublicKeyHash(
  publicKeyHash: Buffer,
  hashMode: AddressHashMode,
  transactionVersion: TransactionVersion
): string {
  const addrVer = addressHashModeToVersion(hashMode, transactionVersion);
  if (publicKeyHash.length !== 20) {
    throw new Error('expected 20-byte pubkeyhash');
  }
  const addr = addressFromVersionHash(addrVer, publicKeyHash.toString('hex'));
  const addrString = addressToString(addr);
  return addrString;
}

export function getTxSenderAddress(tx: StacksTransaction): string {
  if (tx.auth.spendingCondition !== null && tx.auth.spendingCondition !== undefined) {
    const spendingCondition = tx.auth.spendingCondition;
    const txSender = getAddressFromPublicKeyHash(
      Buffer.from(spendingCondition.signer),
      spendingCondition.hashMode as number,
      tx.version,
    );
    return txSender;
  } else throw new Error('spendingCondition should not be null');
}
