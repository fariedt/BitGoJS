import should from 'should';
import { WrappedBuilder, ContractCallBuilder } from '../../../../../src/coin/trx';
import { getBuilder, register } from '../../../../../src/index';
import { participants, contractsAddress } from '../../../../resources/trx'

describe('Trx Contract call Builder', () => {
  const builder = getBuilder('ttrx') as WrappedBuilder;

  // const initTxBuilder = () => {
  //   const txBuilder = builder.getContractCallBuilder();
  //   txBuilder.source();
  //   txBuilder.to();
  //   return txBuilder;
  // };
  describe('should build a contract call tx', () => {
    it('should return a toJson', async () => {
      const txBuilder = builder.getContractCallBuilder();
      const blockNumber = 51407;
      const blockHash = '0000000000badb0d89177fd84c5d9196021cc1085b9e689b3e9a6195cac8bcae';
      const data = '2bf90baa1273140c3e1b5756b242cc88cd7c4dd8a61bf85cb5c1dd5f50ba61e066b53a15';
      const expiration = 1612964187000;
      txBuilder
        .source({ address: participants.custodian.address })
        .to({ address: contractsAddress.factory })
        .data(data)
        .block({ number: blockNumber, hash: blockHash })
        .fee({ feeLimit: '10000' })
        // .expiration(expiration)
        .sign({ key: participants.custodian.pk });

      const tx = await txBuilder.build();
      const txJson = tx.toJson();
      console.log(txJson);
    });
  });
});
