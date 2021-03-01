import should from 'should';
import { register } from '../../../../../src/index';
import { TransactionBuilderFactory } from '../../../../../src/coin/stacks';
import * as testData from '../../../../resources/stacks/stacks';

describe('HBAR Transfer Builder', () => {
  const factory = register('thbar', TransactionBuilderFactory);

  const initTxBuilder = () => {
    const txBuilder = factory.getTransferBuilder();
    txBuilder.fee({ fee: '180' });
    txBuilder.source({ address: testData.ACCOUNT_1.address });
    txBuilder.to(testData.ACCOUNT_2.address);
    txBuilder.amount('10');
    return txBuilder;
  };

  describe('should build ', () => {

    it('a transfer transaction with memo', async () => {
      const builder = initTxBuilder();
      builder.memo('This is an example');
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.to, testData.ACCOUNT_2.address);
      should.deepEqual(txJson.amount, '10');
      should.deepEqual(txJson.memo, 'This is an example');
      should.deepEqual(txJson.from, testData.ACCOUNT_1.address);
      should.deepEqual(txJson.fee.toString(), '180');
    });
  });

  describe('should fail', () => {
    it('a transfer transaction with an invalid key', () => {
      const builder = initTxBuilder();
      should.throws(
        () => builder.sign({ key: 'invalidKey' }),
        e => e.message === 'Invalid private key',
      );
    });

    it('a transfer transaction with an invalid destination address', () => {
      const txBuilder = factory.getTransferBuilder();
      should.throws(
        () => txBuilder.to('invalidaddress'),
        e => e.message === 'Invalid address',
      );
    });

    it('a transfer transaction with an invalid amount: text value', () => {
      const txBuilder = factory.getTransferBuilder();
      should.throws(
        () => txBuilder.amount('invalidamount'),
        e => e.message === 'Invalid amount',
      );
    });

    it('a transfer transaction with an invalid amount: negative value', () => {
      const txBuilder = factory.getTransferBuilder();
      should.throws(
        () => txBuilder.amount('-5'),
        e => e.message === 'Invalid amount',
      );
    });
  });
});
