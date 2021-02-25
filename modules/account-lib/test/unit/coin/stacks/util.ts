import should from 'should';
import * as Utils from '../../../../src/coin/stacks/utils';
// import { defaultKeyPairFromPrv, defaultKeyPairFromPub } from '../../../resources/stacks/stacks';
// import { HashType } from '../../../../src/coin/stacks/iface';

describe('Stacks util library', function() {
  describe('address', function() {
    it('should validate addresses', function() {
      const validAddresses = [
        'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
        'ST11NJTTKGVT6D1HY4NJRVQWMQM7TVAR091EJ8P2Y',
        'SP2T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY',
        'SP2T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY',
      ];

      for (const address of validAddresses) {
        Utils.isValidAddress(address).should.be.true();
      }
    });

    it('should fail to validate invalid addresses', function() {
      const invalidAddresses = [
        'SP244HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6',
        'ST1T758K6T2YRKG9Q0TJ16B6FP5QQREWZSESRS0PY',
        '',
        'abc',
      ];

      for (const address of invalidAddresses) {
        should.doesNotThrow(() => Utils.isValidAddress(address));
        Utils.isValidAddress(address).should.be.false();
      }
    });
  });
});
