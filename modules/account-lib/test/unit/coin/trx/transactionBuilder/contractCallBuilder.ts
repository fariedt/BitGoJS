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
    txBuilder.source({ address: participants.custodian.address })
    txBuilder.to({ address: contractsAddress.factory })
    txBuilder.block({ number: BLOCK_NUMBER, hash: BLOCK_HASH });
    txBuilder.fee({ feeLimit: FEE_LIMIT });
    // txBuilder.expiration(EXPIRATION)

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
        const txBuilder2 = builder.from(tx.toBroadcastFormat());
        console.log(txBuilder2);
      });
    });
  });
});
