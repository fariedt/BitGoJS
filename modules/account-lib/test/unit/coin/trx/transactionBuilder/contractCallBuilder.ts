import should from 'should';
import { WrappedBuilder, ContractCallBuilder } from '../../../../../src/coin/trx';
import { getBuilder, register } from '../../../../../src/index';

describe('Trx Contract call Builder', () => {
  const builder = getBuilder('ttrx') as WrappedBuilder;

  const initTxBuilder = () => {
    const txBuilder = builder.getContractCallBuilder();
    return txBuilder;
  };
});
