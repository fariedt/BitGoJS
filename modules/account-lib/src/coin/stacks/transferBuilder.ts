import { BaseCoin as CoinConfig } from '@bitgo/statics';
import BigNum from 'bn.js';
import {
  makeUnsignedSTXTokenTransfer,
  BufferReader,
  deserializeTransaction,
  UnsignedTokenTransferOptions,
  TokenTransferOptions,
  UnsignedMultiSigTokenTransferOptions,
} from '@stacks/transactions';
import { TransactionType } from '../baseCoin';
import { InvalidParameterValueError, InvalidTransactionError } from '../baseCoin/errors';
import { Transaction } from './transaction';
import { TransactionBuilder } from './transactionBuilder';
import { isValidAddress, isValidAmount, removeHexPrefix } from './utils';
import { KeyPair } from './keyPair';

export class TransferBuilder extends TransactionBuilder {
  private _options: UnsignedTokenTransferOptions | UnsignedMultiSigTokenTransferOptions;
  private _toAddress: string;
  private _amount: BigNum;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  initBuilder(tx: Transaction): void {
    const txData = tx.toJson();
    if (txData.payload == undefined) {
      throw new InvalidTransactionError('payload must not be undefined');
    }
    this.to(txData.payload.to!);
    this.amount(txData.payload.amount!);
    super.initBuilder(tx);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this._options = this.buildTokenTransferOptions();
    this.transaction.setTransactionType(TransactionType.Send);
    this.transaction.stxTransaction = await makeUnsignedSTXTokenTransfer(this._options);
    return await super.buildImplementation();
  }

  private buildTokenTransferOptions(): UnsignedTokenTransferOptions | UnsignedMultiSigTokenTransferOptions {
    const defaultOpts: TokenTransferOptions = {
      recipient: this._toAddress,
      amount: this._amount,
      memo: this._memo,
      network: this._network,
      fee: new BigNum(this._fee.fee),
      nonce: new BigNum(this._nonce)
    };
    if (this._multiSignerKeyPairs.length == 0) {
      throw new InvalidParameterValueError('supply at least 1 public key');
    }
    if (this._multiSignerKeyPairs.length == 1) {
      return {
        ...defaultOpts,
        publicKey: this._multiSignerKeyPairs[0].getKeys(true).pub,
      };
    } else {
      return {
        ...defaultOpts,
        publicKeys: this._multiSignerKeyPairs.map(i => i.getKeys(true).pub),
        numSignatures: this._numberSignatures,
      };
    }
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: string): Transaction {
    const tx = new Transaction(this._coinConfig);
    const stackstransaction = deserializeTransaction(
      BufferReader.fromBuffer(Buffer.from(removeHexPrefix(rawTransaction))),
    );
    tx.stxTransaction = stackstransaction;
    this.initBuilder(tx);
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
