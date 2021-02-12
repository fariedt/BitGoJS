import should from 'should';
import { WrappedBuilder } from '../../../../../src/coin/trx';
import { getBuilder } from '../../../../../src/index';
import {
  PARTICIPANTS,
  CONTRACTS,
  MINT_CONFIRM_DATA,
  BLOCK_HASH,
  FEE_LIMIT,
  BLOCK_NUMBER,
  EXPIRATION,
} from '../../../../resources/trx/trx';

describe('Trx Contract call Builder', () => {
  const initTxBuilder = () => {
    const builder = (getBuilder('ttrx') as WrappedBuilder).getContractCallBuilder();
    builder
      .source({ address: PARTICIPANTS.custodian.address })
      .to({ address: CONTRACTS.factory })
      .block({ number: BLOCK_NUMBER, hash: BLOCK_HASH })
      .fee({ feeLimit: FEE_LIMIT });

    return builder;
  };

  describe('Contract Call builder', () => {
    describe('should success to create', () => {
      it('a toJson', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: PARTICIPANTS.custodian.pk });
        const tx = await txBuilder.build();
        tx.toJson();
      });
      it('a transaction from implementation', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: PARTICIPANTS.custodian.pk });
        const tx = await txBuilder.build();
        const txBuilder2 = (getBuilder('ttrx') as WrappedBuilder).from(tx.toBroadcastFormat());
      });
      it('a transaction unsigned', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA);
        const tx = await txBuilder.build();
        const txBuilder2 = (getBuilder('ttrx') as WrappedBuilder).from(tx.toBroadcastFormat());
      });
    });

    describe('should build', () => {
      it('a signed contract call transaction', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: PARTICIPANTS.custodian.pk });
        const tx = await txBuilder.build();
        tx.toJson();
      });

      it('a transaction from implementation', async () => {
        const timestamp = Date.now();
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA);
        txBuilder.timestamp(timestamp);
        txBuilder.expiration(timestamp + 40000);
        const tx = await txBuilder.build();

        const txBuilder2 = getBuilder('ttrx').from(tx.toBroadcastFormat());
        txBuilder2.sign({ key: PARTICIPANTS.custodian.pk });
        const tx2 = await txBuilder2.build();

        const txBuilder3 = getBuilder('ttrx').from(tx.toJson());
        txBuilder3.sign({ key: PARTICIPANTS.custodian.pk });
        const tx3 = await txBuilder3.build();

        should.deepEqual(tx2, tx3);
      });
    });

    describe('should fail to build', () => {
      it('a transaction with wrong data', async () => {
        const txBuilder = initTxBuilder();
        should.throws(
          () => {
            txBuilder.data('addMintRequest()');
          },
          e => e.message === 'addMintRequest() is not a valid hex string.',
        );
      });
    });
  });

  describe('Should validate ', () => {
    it('expiration', async () => {
      const expiration = Date.now() + EXPIRATION;
      const txBuilder = initTxBuilder();
      txBuilder.data(MINT_CONFIRM_DATA);
      txBuilder.expiration(expiration + 1000);
      txBuilder.expiration(expiration);

      const tx = await txBuilder.build();
      should.throws(
        () => {
          txBuilder.expiration(expiration + 20000);
        },
        e => e.message === 'Expiration is already set, it can only be extended',
      );
      const txJson = tx.toJson();
      should.equal(txJson.raw_data.expiration, expiration);

      const txBuilder2 = getBuilder('ttrx').from(tx.toBroadcastFormat());
      should.throws(
        () => {
          txBuilder2.expiration(expiration + 20000);
        },
        e => e.message === 'Expiration is already set, it can only be extended',
      );
    });
  });
});
