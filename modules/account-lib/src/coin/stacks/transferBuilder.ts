import { BaseCoin as CoinConfig } from '@bitgo/statics';
// import { createTokenTransferPayload } from '@stacks/transactions/dist/transactions/src/payload';
import BigNum from 'bn.js';
import {
  makeSTXTokenTransfer,
  SignedTokenTransferOptions,
  BufferReader,
  deserializeTransaction,
  // StacksTransaction,
  TransactionSigner,
  createStacksPrivateKey,
} from '@stacks/transactions';
import { TransactionType } from '../baseCoin';
// import { NotImplementedError } from '../baseCoin/errors';
import { BaseKey } from '../baseCoin/iface';
import { Transaction } from './transaction';
import { TransactionBuilder } from './transactionBuilder';

// import { KeyPair } from './keyPair';

export class TransferBuilder extends TransactionBuilder {
  private _options: SignedTokenTransferOptions;
  private _toAddress: string;
  private _amount: BigNum;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this._options = this.buildTokenTransferOptions();
    this.transaction.setTransactionType(TransactionType.Send);
    // this.transaction.payload(createTokenTransferPayload(this._toAddress, this._amount, this._memo));
    this.transaction.stxTransaction = await makeSTXTokenTransfer(this._options);
    return await super.buildImplementation();
  }

  private buildTokenTransferOptions(): SignedTokenTransferOptions {
    const options: SignedTokenTransferOptions = {
      recipient: this._toAddress,
      amount: this._amount,
      senderKey: this._senderKey,
    };
    return options;
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: any): Transaction {
    const tx = new Transaction(this._coinConfig);
    const stackstransaction = deserializeTransaction(BufferReader.fromBuffer(Buffer.from(rawTransaction)));
    tx.stxTransaction = stackstransaction;
    this.initBuilder(tx);
    return this.transaction;
  }

  /** @inheritdoc */
  protected signImplementation(key: BaseKey): Transaction {
    const privKey = createStacksPrivateKey(key.key);
    const signer = new TransactionSigner(this.transaction.stxTransaction);
    signer.signOrigin(privKey);
    return this.transaction;
  }
}
