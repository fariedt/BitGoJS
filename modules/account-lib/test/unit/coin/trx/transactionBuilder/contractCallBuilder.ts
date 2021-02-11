import should from 'should';
import { WrappedBuilder, ContractCallBuilder } from '../../../../../src/coin/trx';
import { getBuilder, register } from '../../../../../src/index';
import {
  participants,
  contractsAddress,
  MINT_CONFIRM_DATA,
  BLOCK_HASH,
  FEE_LIMIT,
  BLOCK_NUMBER,
  EXPIRATION,
} from '../../../../resources/trx/trx';

describe('Trx Contract call Builder', () => {
  const builder = getBuilder('ttrx') as WrappedBuilder;

  const initTxBuilder = () => {
    const txBuilder = builder.getContractCallBuilder();
    txBuilder
      .source({ address: participants.custodian.address })
      .to({ address: contractsAddress.factory })
      .block({ number: BLOCK_NUMBER, hash: BLOCK_HASH })
      .fee({ feeLimit: FEE_LIMIT });

    return txBuilder;
  };

  describe('Contract Call builder', () => {
    describe('should success to create', () => {
      it('a toJson', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: participants.custodian.pk });
        const tx = await txBuilder.build();
        tx.toJson();
      });
      it('a transaction from implementation', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: participants.custodian.pk });
        const tx = await txBuilder.build();
        builder.from(tx.toBroadcastFormat());
      });
      it('a transaction unsigned', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA);
        const tx = await txBuilder.build();
        builder.from(tx.toBroadcastFormat());
      });
    });

    describe('should build', () => {
      it('a signed contract call transaction', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: participants.custodian.pk });
        const tx = await txBuilder.build();
        tx.toJson();
      });
      it('a transaction from implementation', async () => {
        const txBuilder = initTxBuilder();
        txBuilder.data(MINT_CONFIRM_DATA).sign({ key: participants.custodian.pk });
        const tx = await txBuilder.build();
        builder.from(tx.toBroadcastFormat());
      });
    });

    describe('should fail to build', () => {
      it('a transaction with same key', async () => {
        const txBuilder = initTxBuilder();
      });
    });
  });
});
