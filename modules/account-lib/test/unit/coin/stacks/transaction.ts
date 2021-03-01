import should from 'should';
import { coins } from '@bitgo/statics';
import { Transaction } from '../../../../src/coin/stacks/transaction'
import * as testData from '../../../resources/stacks/stacks';
import { KeyPair } from '../../../../src/coin/stacks/keyPair';
import { deserializePayload } from '@stacks/transactions/dist/transactions/src/payload';
import { BufferReader, deserializeTransaction, StacksTransaction } from "@stacks/transactions";

describe('Stacks Transaction', () => {
  const coin = coins.get('thbar');

  /**
   *
   */
  function getTransaction(): Transaction {
    return new Transaction(coin);
  }

  it('should throw empty transaction', () => {
    const tx = getTransaction();
    should.throws(() => {
      tx.toJson();
    });
    should.throws(() => {
      tx.toBroadcastFormat();
    });
  });

  describe('should sign if transaction is', () => {
    it('invalid', function () {
      const tx = getTransaction();
      return tx.sign(testData.INVALID_KEYPAIR_PRV).should.be.rejected();
    });

    it('valid', async () => {
      const tx = getTransaction();
      tx.payload(deserializePayload(BufferReader.fromBuffer(testData.TX_PAYLOAD)))
      const keypair = new KeyPair({ prv: testData.secretKey1 });
      await tx.sign(keypair).should.be.fulfilled();
      should.equal(
        tx.stxTransaction.auth.spendingCondition.signer,
        testData.pubKey1.slice(24),
      );
    });
  });

  describe('should return encoded tx', function () {
    it('valid sign', async function () {
      const tx = getTransaction();
      tx.payload(deserializePayload(BufferReader.fromBuffer(testData.TX_PAYLOAD)))
      const keypair = new KeyPair({ prv: testData.secretKey1 });
      await tx.sign(keypair);
      should.equal(tx.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
    });
  });
});
