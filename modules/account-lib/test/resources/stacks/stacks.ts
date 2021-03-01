import { Stacks } from '../../../src/';
import { KeyPair } from '../../../src/coin/stacks/keyPair';

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

export const ACCOUNT_1 = {
  priv: "cb3df38053d132895220b9ce471f6b676db5b9bf0b4adefb55f2118ece2478df01",
  pub: "03797dd653040d344fd048c1ad05d4cbcb2178b30c6a0c4276994795f3e833da41",
  address: "SP2T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY"
}

export const defaultKeyPairFromPrv = new Stacks.KeyPair({
  prv: secretKey1,
});

export const defaultKeyPairFromPub = new Stacks.KeyPair({
  pub: pubKey2,
});

export const INVALID_KEYPAIR_PRV = new KeyPair({
  prv: '8CAA00AE63638B0542A304823D66D96FF317A576F692663DB2F85E60FAB2590C',
});

export const TX_PAYLOAD = Buffer.from(
  '22a3010a140a0c0883aa91f9051080feab9b01120418d5d00412021804188094ebdc03220208785a7d0a722a700802126c0a2212205a9111b5e6881ff20b9243a42ac1a9a67fa16cd4f01e58bab30c1fe611ea8cf90a221220592a4fbb7263c59d450e651df96620dc9208ee7c7d9d6f2fdcb91c53f88312610a221220fa344793601cef71348f994f30a168c2dd55f357426a180a5a724d7e03585e9110004a0508d0c8e103',
  'hex',
);

export const SIGNED_TRANSACTION =
  '1a660a640a205a9111b5e6881ff20b9243a42ac1a9a67fa16cd4f01e58bab30c1fe611ea8cf91a40ff00c43d4da6d33abf90b2de7d36db8cea62248a6b8ef35be7741c43e762f1208fe5224ac79cd53e59df48913418e976320f789a091cf67a23278a12781b490d22a3010a140a0c0883aa91f9051080feab9b01120418d5d00412021804188094ebdc03220208785a7d0a722a700802126c0a2212205a9111b5e6881ff20b9243a42ac1a9a67fa16cd4f01e58bab30c1fe611ea8cf90a221220592a4fbb7263c59d450e651df96620dc9208ee7c7d9d6f2fdcb91c53f88312610a221220fa344793601cef71348f994f30a168c2dd55f357426a180a5a724d7e03585e9110004a0508d0c8e103';

