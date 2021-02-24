import { randomBytes } from 'crypto';
import { HDNode } from '@bitgo/utxo-lib';
import { publicKeyToAddress } from '@stacks/encryption';
import { DefaultKeys, isPrivateKey, isPublicKey, isSeed, KeyPairOptions } from '../baseCoin/iface';
import { Secp256k1ExtendedKeyPair } from '../baseCoin/secp256k1ExtendedKeyPair';
import { hexPrefixString } from './utils';
const DEFAULT_SEED_SIZE_BYTES = 64;

export class KeyPair extends Secp256k1ExtendedKeyPair {
  constructor(source?: KeyPairOptions) {
    super(source);
    if (!source) {
      const seed = randomBytes(DEFAULT_SEED_SIZE_BYTES);
      this.hdNode = HDNode.fromSeedBuffer(seed);
    } else if (isSeed(source)) {
      this.hdNode = HDNode.fromSeedBuffer(source.seed);
    } else if (isPrivateKey(source)) {
      super.recordKeysFromPrivateKey(source.prv);
    } else if (isPublicKey(source)) {
      super.recordKeysFromPublicKey(source.pub);
    } else {
      throw new Error('Invalid key pair options');
    }

    if (this.hdNode) {
      this.keyPair = this.hdNode.keyPair;
    }
  }

  getKeys(): DefaultKeys {
    return {
      pub: this.keyPair.Q.getEncoded(true)
        .toString('hex')
        .toUpperCase(),
      prv: this.keyPair.d
        ? this.keyPair.d
            .toBuffer(32)
            .toString('hex')
            .toUpperCase()
        : undefined,
    };
  }

  getAddress(): string {
    return hexPrefixString(publicKeyToAddress(this.getKeys().pub));
  }
}
