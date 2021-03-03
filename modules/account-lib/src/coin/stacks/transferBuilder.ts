import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { createTokenTransferPayload } from "@stacks/transactions/dist/payload.esm";
import BigNum from 'bn.js';
import {
  makeSTXTokenTransfer,
  SignedTokenTransferOptions,
  BufferReader,
  deserializeTransaction,
  StacksTransaction,
  TransactionSigner,
  createStacksPrivateKey,
} from '@stacks/transactions';
import { TransactionType } from '../baseCoin';
import { NotImplementedError, InvalidParameterValueError } from '../baseCoin/errors';
import { BaseKey } from '../baseCoin/iface';
import { Transaction } from './transaction';
import { TransactionBuilder } from './transactionBuilder';
import { isValidAddress, isValidAmount } from './utils'

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
    this.transaction.stxTransaction = await makeSTXTokenTransfer(this._options);
    return await super.buildImplementation();
  }

  private buildTokenTransferOptions(): SignedTokenTransferOptions {
    const options: SignedTokenTransferOptions = {
      recipient: this._toAddress,
      amount: this._amount,
      senderKey: this._senderKey,
      memo: this._memo
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

  //region Transfer fields
  /**
   * Set the destination address where the funds will be sent,
   * it may take the format `'<shard>.<realm>.<account>'` or `'<account>'`
   *
   * @param {string} address the address to transfer funds to
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  to(address: string): this {
    if (!isValidAddress(address)) {
      throw new InvalidParameterValueError('Invalid address');
    }
    this._toAddress = address;
    return this;
  }

  /**
   * Set the amount to be transferred
   *
   * @param {string} amount amount to transfer in tinyBars (there are 100,000,000 tinyBars in one Hbar)
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  amount(amount: string): this {
    if (!isValidAmount(amount)) {
      throw new InvalidParameterValueError('Invalid amount');
    }
    this._amount = new BigNum(amount);
    return this;
  }
}
