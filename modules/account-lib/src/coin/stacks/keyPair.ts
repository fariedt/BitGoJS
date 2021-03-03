import { randomBytes } from 'crypto';
import { ECPair, HDNode } from '@bitgo/utxo-lib';
import { getAddressFromPublicKey } from '@stacks/transactions';
import { DefaultKeys, isPrivateKey, isPublicKey, isSeed, KeyPairOptions } from '../baseCoin/iface';
import { Secp256k1ExtendedKeyPair } from '../baseCoin/secp256k1ExtendedKeyPair';

const DEFAULT_SEED_SIZE_BYTES = 64;

export class KeyPair extends Secp256k1ExtendedKeyPair {
  constructor(source?: KeyPairOptions) {
    super(source);
    if (!source) {
      const seed = randomBytes(DEFAULT_SEED_SIZE_BYTES);
      this.hdNode = HDNode.fromSeedBuffer(seed);
    } else if (isSeed(source)) {
      console.log('is seed');
      this.hdNode = HDNode.fromSeedBuffer(source.seed);
    } else if (isPrivateKey(source)) {
      this.recordKeysFromPrivateKey(source.prv);
    } else if (isPublicKey(source)) {
      this.recordKeysFromPublicKey(source.pub);
    } else {
      throw new Error('Invalid key pair options');
    }

    if (this.hdNode) {
      this.keyPair = this.hdNode.keyPair;
    }
  }

  // TODO: implement
  // prv can be 64 or 66 characters (32 or 33 bytes in hex)
  // if 32, add it and set compressed to false
  // if 33, it's a compressed key and the last byte must be 1
  recordKeysFromPrivateKey(prv: string): void {
    if (prv.length !== 64 && prv.length !== 66) {
      throw new Error('Unsupported private key');
    }
    if (prv.length === 66 && prv.slice(64) !== '01') {
      throw new Error('Unsupported private key');
    }
    const compressed = prv.length === 66;
    this.keyPair = ECPair.fromPrivateKeyBuffer(Buffer.from(prv.slice(0, 64), 'hex'));
    this.keyPair.compressed = compressed;
  }

  // this is either very 130 characters (65 bytes for uncompressed)
  // or 64 bytes for compressed (?)
  recordKeysFromPublicKey(pub: string): void {
    if (pub.length !== 66 && pub.length !== 130) {
      throw new Error('Unsupported public key');
    }
    if (pub.length === 130 && pub.slice(0, 2) !== '04') {
      throw new Error('Unsupported public key');
    }

    this.keyPair = ECPair.fromPublicKeyBuffer(Buffer.from(pub, 'hex'));
  }

  getKeys(compressed = true): DefaultKeys {
    return {
      pub: this.keyPair.Q.getEncoded(compressed).toString('hex'),
      prv: this.keyPair.d ? this.keyPair.d.toBuffer(32).toString('hex') : undefined,
    };
  }

  getAddress(): string {
    return getAddressFromPublicKey(this.getKeys(false).pub);
  }
}
