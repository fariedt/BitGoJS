import { Stacks } from '../../../src/';

/*
 * keys and addresses are from:
 *
 * import * as st from '@stacks/transactions';
 *
 * const secretKey1 = st.privateKeyToString(st.makeRandomPrivKey());
 * const publicKey1 = st.publicKeyToString(st.pubKeyfromPrivKey(secretKey1.data);
 * const address1 = st.getAddressFromPrivateKey(secretKey1);
 * etc.
 */

export const secretKey1 = '66c88648116b721bb2f394e0007f9d348ea08017b6e604de51a3a7d957d58524';
export const pubKey1 =
  '04a68c2d6fdb3706b39f32d6f4225275ce062561908fd7ca540a44c92eb8594ea6db9fcfe0b390c0ead3f45c36afd682eab62eb124a63b460945fe1f7c7f8a09e2';
export const address1 = 'SP10FDHQQ4F2F0KHMN6Z24RMAMGX5933SQJCWKAAR';

export const secretKey2 = '35794adf0dd2a313c18bc118b422740bb94f85114134be34703ff706658087e4';
export const pubKey2 =
  '0421d6f42c99f7d23ec2c0dc21208a9c5edfce4e5bc7b63972e68e86e3cea6f41a94a9a7c24a1ccd83792173f475fdb590cc82f94ff615df39142766e759ce6387';
export const pubKey2Compressed = '0321d6f42c99f7d23ec2c0dc21208a9c5edfce4e5bc7b63972e68e86e3cea6f41a';
export const address2 = 'SPS4HSXAD1WSD3943WZ52MPSY9WPK56SDG54HTAR';

export const defaultKeyPairFromPrv = new Stacks.KeyPair({
  prv: secretKey1,
});

export const defaultKeyPairFromPub = new Stacks.KeyPair({
  pub: pubKey2,
});

// seed is Buffer.alloc(64) -- all zero bytes
export const defaultSeedAddress = 'SP21X8PMH8T4MVX8Z75JZPYEVA6Q8FDR7PJ13MV4Q';
export const defaultSeedSecretKey = 'eafd15702fca3f80beb565e66f19e20bbad0a34b46bb12075cbf1c5d94bb27d2';
export const defaultSeedPubKey = '03669261fe20452fe6a03e625944c6a0523e6350b3ea8cbd37c9ca1ff97e3ac8bf';
