import { BaseCoin as CoinConfig } from '@bitgo/statics';
import BigNum from 'bn.js';
import {
  makeSTXTokenTransfer,
  makeUnsignedSTXTokenTransfer,
  SignedTokenTransferOptions,
  BufferReader,
  deserializeTransaction,
  StacksTransaction,
  TransactionSigner,
  createStacksPrivateKey,
  UnsignedTokenTransferOptions, TokenTransferOptions
} from '@stacks/transactions';
import { TransactionType } from '../baseCoin';
import { NotImplementedError, InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { BaseKey } from '../baseCoin/iface';
import { Transaction } from './transaction';
import { TransactionBuilder } from './transactionBuilder';
import { isValidAddress, isValidAmount } from './utils'


// import { KeyPair } from './keyPair';

export class TransferBuilder extends TransactionBuilder {
  private _options: UnsignedTokenTransferOptions;
  private _toAddress: string;
  private _amount: BigNum;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  initBuilder(tx: Transaction): void {
    const txData = tx.toJson();
    if (txData.payload == undefined) {
      throw new InvalidTransactionError("payload must not be undefined")
    }
    this.to(txData.payload.to!);
    this.amount(txData.payload.amount!)
    super.initBuilder(tx)

  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this._options = this.buildTokenTransferOptions();
    this.transaction.setTransactionType(TransactionType.Send);
    this.transaction.stxTransaction = await makeUnsignedSTXTokenTransfer(this._options);
    return await super.buildImplementation();
  }

  private buildTokenTransferOptions(): UnsignedTokenTransferOptions {
    const options: UnsignedTokenTransferOptions = {
      recipient: this._toAddress,
      amount: this._amount,
      memo: this._memo,
      publicKey: this._senderPubKey,
      network: this._network
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

  // /** @inheritdoc */
  // protected signImplementation(key: BaseKey): Transaction {
  //   const privKey = createStacksPrivateKey(key.key);
  //   const signer = new TransactionSigner(this.transaction.stxTransaction);
  //   signer.signOrigin(privKey);
  //   return this.transaction;
  // }

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
