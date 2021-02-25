import { Stacks } from '../../../src/';

// secret keys are from stacks-blockchain-api, in src/api/routes/debug.ts
// addresses are for the Stacks mainnet, not testnet

// in js:
// const st = require('@stacks/transactions');
// pubKey = st.publicKeyToString(st.pubKeyfromPrivKey(secretKey));
// address = st.getAddressFromPublicKey(st.pubKeyfromPrivKey(secretKey), st.TransactionVersion.Mainnet);

export const secretKey1 = 'cb3df38053d132895220b9ce471f6b676db5b9bf0b4adefb55f2118ece2478df01';
export const pubKey1 = '03797dd653040d344fd048c1ad05d4cbcb2178b30c6a0c4276994795f3e833da41';
export const address1 = 'SP2T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY';

export const secretKey2 = '21d43d2ae0da1d9d04cfcaac7d397a33733881081f0b2cd038062cf0ccbb752601';
export const pubKey2 = '02b087ca52f40fdfdf4b16a0bbf7e91e4db2e183ac5c6491a5f60a5450e25de7d0';
export const address2 = 'SP2T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY';

export const defaultKeyPairFromPrv = new Stacks.KeyPair({
  prv: secretKey1,
});

export const defaultKeyPairFromPub = new Stacks.KeyPair({
  pub: pubKey2,
});
