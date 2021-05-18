import { StacksTestnet } from '@stacks/network';
import should from 'should';
import { TransactionType } from '../../../../../src/coin/baseCoin';
import { SigningError } from '../../../../../src/coin/baseCoin/errors';
import { TransactionBuilderFactory } from '../../../../../src/coin/stx';
import { register } from '../../../../../src/index';
import * as testData from '../../../../resources/stx/stx';

describe('Stx Transfer Builder', () => {
  const factory = register('stx', TransactionBuilderFactory);

  const initTxBuilder = () => {
    const txBuilder = factory.getTransferBuilder();
    // console.log('My Log: ', txBuilder);
    txBuilder.fee({ fee: '180' });
    txBuilder.nonce(0);
    txBuilder.to(testData.TX_RECIEVER.address);
    txBuilder.amount('1000');
    return txBuilder;
  };

  describe('should build ', () => {
    it('a signed transfer transaction', async () => {
      const builder = initTxBuilder();
      builder.fromPubKey(testData.TX_SENDER.pub);
      builder.sign({ key: testData.TX_SENDER.prv });
      const tx = await builder.build();

      const txJson = tx.toJson();
      // should.deepEqual(tx.signature.length, 1);
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '1000');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.nonce, 0);
      should.deepEqual(txJson.fee.toString(), '180');
      should.deepEqual(tx.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
      tx.type.should.equal(TransactionType.Send);

      tx.outputs.length.should.equal(1);
      tx.outputs[0].address.should.equal(testData.TX_RECIEVER.address);
      tx.outputs[0].value.should.equal('1000');
      tx.inputs.length.should.equal(1);
      tx.inputs[0].address.should.equal(testData.TX_SENDER.address);
      tx.inputs[0].value.should.equal('1000');
    });

    it('a transfer transaction with memo', async () => {
      const builder = initTxBuilder();
      builder.fromPubKey(testData.TX_SENDER.pub);
      builder.memo('This is an example');
      builder.sign({ key: testData.TX_SENDER.prv });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '1000');
      should.deepEqual(txJson.payload.memo, 'This is an example');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.nonce, 0);
      should.deepEqual(txJson.fee.toString(), '180');
    });

    it('an unsigned multisig signed and verified', async function() {
      const destination = 'STDE7Y8HV3RX8VBM2TZVWJTS7ZA1XB0SSC3NEVH0';
      const amount = '1000';
      const memo = 'test';
      const kp = new KeyPair({ prv: '21d43d2ae0da1d9d04cfcaac7d397a33733881081f0b2cd038062cf0ccbb752601' });
      const kp1 = new KeyPair({ prv: 'c71700b07d520a8c9731e4d0f095aa6efb91e16e25fb27ce2b72e7b698f8127a01' });
      const kp2 = new KeyPair({ prv: 'e75dcb66f84287eaf347955e94fa04337298dbd95aa0dbb985771104ef1913db01' });
      const txBuilder = factory.getTransferBuilder();
      txBuilder.fee({
        fee: '180',
      });
      txBuilder.to(destination);
      txBuilder.amount(amount);
      txBuilder.nonce(1);
      txBuilder.fromPubKey([kp.getKeys().pub, kp1.getKeys().pub, kp2.getKeys().pub]);
      txBuilder.numberSignatures(2);
      txBuilder.memo(memo);
      const tx = await txBuilder.build(); // unsigned multisig tx

      const txBuilder2 = factory.getTransferBuilder();
      txBuilder2.from(tx.toBroadcastFormat());
      txBuilder2.sign({ key: '21d43d2ae0da1d9d04cfcaac7d397a33733881081f0b2cd038062cf0ccbb752601' });
      txBuilder2.sign({ key: 'c71700b07d520a8c9731e4d0f095aa6efb91e16e25fb27ce2b72e7b698f8127a01' });
      txBuilder2.fromPubKey([kp2.getKeys(kp2.getCompressed()).pub]);
      // txBuilder2.sign({ key: 'e75dcb66f84287eaf347955e94fa04337298dbd95aa0dbb985771104ef1913db01' });
      txBuilder2.numberSignatures(2);
      const signedTx = await txBuilder2.build(); // signed multisig tx

      const txBuilder3 = factory.getTransferBuilder();
      txBuilder3.from(signedTx.toBroadcastFormat());
      const remake = await txBuilder3.build();
      should.deepEqual(remake.toBroadcastFormat(), signedTx.toBroadcastFormat());
    });

    it('a multisig transfer transaction', async () => {
      const builder = initTxBuilder();
      builder.network(new StacksTestnet());
      builder.memo('test memo');
      builder.sign({ key: testData.prv1 });
      builder.sign({ key: testData.prv2 });
      const kp = new KeyPair({ prv: testData.prv3 });
      builder.fromPubKey(kp.getKeys(kp.getCompressed()).pub);
      builder.numberSignatures(2);
      const tx = await builder.build();
      should.deepEqual(tx.toBroadcastFormat(), testData.MULTI_SIG_SINGED_TRANSACTION);
    });

    it('a multisig serialized transfer transaction', async () => {
      const builder = factory.from(testData.MULTI_SIG_SINGED_TRANSACTION);
      const tx = await builder.build();
      should.deepEqual(tx.toBroadcastFormat(), testData.MULTI_SIG_SINGED_TRANSACTION);
    });

    it('a signed transaction from a raw transaction', async () => {
      const builder = factory.getTransferBuilder();
      builder.from(testData.SIGNED_TRANSACTION);
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '1000');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.nonce, 0);
      should.deepEqual(txJson.fee.toString(), '180');
      tx.type.should.equal(TransactionType.Send);
      tx.outputs.length.should.equal(1);
      tx.outputs[0].address.should.equal(testData.TX_RECIEVER.address);
      tx.outputs[0].value.should.equal('1000');
      tx.inputs.length.should.equal(1);
      tx.inputs[0].address.should.equal(testData.TX_SENDER.address);
      tx.inputs[0].value.should.equal('1000');
    });

    it('a transfer transaction signed multiple times', async () => {
      const builder = initTxBuilder();
      builder.memo('test memo');
      builder.sign({ key: testData.prv1 });
      builder.sign({ key: testData.prv2 });
      const kp = new KeyPair({ prv: testData.prv3 });
      builder.fromPubKey(kp.getKeys(kp.getCompressed()).pub);
      builder.numberSignatures(2);
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(tx.signature.length, 3);
      should.deepEqual(txJson.fee.toString(), '180');
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.memo, 'test memo');
      should.deepEqual(txJson.payload.amount, '1000');
    });

    it('a transfer transaction with amount 0', async () => {
      const builder = initTxBuilder();
      builder.amount('0');
      builder.fromPubKey(testData.TX_SENDER.pub);
      builder.sign({ key: testData.TX_SENDER.prv });
      const tx = await builder.build();
      const txJson = tx.toJson();
      should.deepEqual(txJson.payload.to, testData.TX_RECIEVER.address);
      should.deepEqual(txJson.payload.amount, '0');
      should.deepEqual(txJson.from, testData.TX_SENDER.address);
      should.deepEqual(txJson.fee.toString(), '180');
    });

    describe('serialized transactions', () => {
      it('a non signed transfer transaction from serialized', async () => {
        const builder = factory.from(testData.RAW_TX_UNSIGNED);
        builder.sign({ key: testData.TX_SENDER.prv });
        const tx2 = await builder.build();
        should.deepEqual(tx2.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
        tx2.type.should.equal(TransactionType.Send);
      });

      it('a signed transfer transaction from serilaized', async () => {
        const txBuilder = factory.from(testData.SIGNED_TRANSACTION);
        const tx = await txBuilder.build();
        should.deepEqual(tx.toBroadcastFormat(), testData.SIGNED_TRANSACTION);
        tx.type.should.equal(TransactionType.Send);
      });
    });

    describe('should fail', () => {
      it('a transfer transaction with an invalid key', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.sign({ key: 'invalidKey' }),
          e => e.message === 'Unsupported private key',
        );
      });

      it('a transfer transaction with an invalid pubKey', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.fromPubKey('invalid key'),
          e => e.message === 'Invalid public key',
        );
      });

      // it('validateKey method', () => {
      //   const builder = initTxBuilder();
      //   should.throws(
      //     () => builder.validateKey({ key: testData.prv1 }),
      //     e => e.message === 'Invalid key',
      //   );
      // });

      it('validateRawTransaction empty input', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.validateRawTransaction(''),
          e => e.message === 'Raw transaction is empty',
        );
      });

      it('validateRawTransaction invalid input', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.validateRawTransaction('Some bad raw transaction'),
          e => e.message === 'There was an error parsing the raw transaction',
        );
      });

      it('transaction with a fee less than 0', () => {
        const builder = initTxBuilder();
        should.throws(
          () => builder.fee({ fee: '-100' }),
          e => e.message === 'Invalid fee -100',
        );
      });

      it('transaction with a missing fee', () => {
        const builder = factory.getTransferBuilder();
        should.throws(
          () => builder.validateTransaction(),
          e => e.message === 'Invalid transaction: missing fee',
        );
      });

      // Invalid fee not possible, unreachable code due to type check in fee
      it('transaction with an invalid fee', () => {
        const builder = factory.getTransferBuilder();
        should.throws(
          () => builder.fee({ fee: 'asd' }),
          // e => e.message === 'Invalid fee',
          e => e.message === 'Invalid fee asd',
        );
      });

      it('transaction with a missing nonce', () => {
        const builder = factory.getTransferBuilder();
        builder.fee({ fee: '180' });
        should.throws(
          () => builder.validateTransaction(),
          e => e.message === 'Invalid transaction: missing nonce',
        );
      });

      // Invalid nonce not possible, unreachable code due to type check in big number
      it('transaction with an invalid nonce', () => {
        const builder = factory.getTransferBuilder();
        builder.fee({ fee: '180' });
        builder.nonce(-100);
        should.throws(
          () => builder.validateTransaction(),
          e => e.message === 'Invalid nonce -100',
        );
      });

      // it('a transfer with an undefined spending condition ', async () => {
      //   const builder = initTxBuilder();
      //   try {
      //     // builder.sign({ key: undefined });
      //     // const tx = await builder.build();
      //     // console.log('built', builder);
      //   } catch (error) {
      //     console.log('built error', error);
      //   }

      //   should.throws(
      //     () => builder.sign({ key: undefined }),
      //     e => {
      //       console.log(e);
      //       return e.message === 'spending condition cannot be undefined';
      //     },
      //   );
      // });

      // it('a transfer transaction with an invalid number of signatures key', async () => {
      //   const builder = initTxBuilder();
      //   builder.numberSignatures(2);
      //   builder.sign({ key: testData.prv1 });
      //   // const tx = await builder.build();
      //   // // console.log('success', tx.toJson());
      //   should.throws(
      //     async () => await builder.build(),
      //     e => e.message === 'Invalid number of signers for multi-sig',
      //   );
      // });

      it('a transfer transaction with a duplicate key', async () => {
        const builder = initTxBuilder();
        builder.network(new StacksTestnet());
        builder.memo('test memo');
        builder.numberSignatures(2);
        builder.sign({ key: testData.prv1 });
        should.throws(
          () => builder.sign({ key: testData.prv1 }),
          e => e.message === `Repeated sign: ${testData.prv1}`,
        );
      });

      it('a transfer transaction with an invalid address', () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.validateAddress({ address: 'asdsdas' }),
          e => e.message === 'Invalid address asdsdas',
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

      it('a transfer transaction with an invalid memo', async () => {
        const txBuilder = factory.getTransferBuilder();
        should.throws(
          () => txBuilder.memo('This is a memo that is too long for a transaction'),
          e => e.message === 'Memo is too long',
        );
      });
    });
  });
});
