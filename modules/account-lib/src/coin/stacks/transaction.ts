import BigNumber from 'bignumber.js';
import { PayloadType, StacksTransaction } from '@stacks/transactions';
import { BaseTransaction, TransactionType } from '../baseCoin';
import { BaseKey } from '../baseCoin/iface';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { TxData } from './iface';
import { serializePayload } from '@stacks/transactions/dist/transactions/src/payload';
import { addressToString } from '@blockstack/stacks-transactions/lib/types';

export class Transaction extends BaseTransaction {

  private _stxTransaction: StacksTransaction
  protected _type: TransactionType;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritdoc */
  canSign(key: BaseKey): boolean {
    throw new Error('Method not implemented.');
  }

  /** @inheritdoc */
  toJson() {
    const result: TxData = {
      id: this._stxTransaction.txid(),
      hash: this.getTxHash(),
      data: '0x' + serializePayload(this._stxTransaction.payload).toString('hex'),
      fee: new BigNumber(this._stxTransaction.auth.getFee().toString()).toNumber(),
      from: "", // TODO: get sender address from stxTransaction
    };

    if (this._stxTransaction.payload.payloadType == PayloadType.TokenTransfer) {
      const payload = this._stxTransaction.payload
      result.memo = payload.memo.content
      result.to = addressToString({
        type: 0,
        version: payload.recipient.address.version,
        hash160: payload.recipient.address.hash160.toString(),
      })
      result.amount = payload.amount.toString()
    }
    return result;
  }
  toBroadcastFormat() {
    throw new Error('Method not implemented.');
  }

  get stxTransaction(): StacksTransaction {
    return this._stxTransaction
  }

  /**
  * Sets this transaction body components
  *
  * @param {proto.Transaction} tx body transaction
  */
  body(tx: StacksTransaction) {
    this._stxTransaction = tx;
    this.loadInputsAndOutputs();
  }

  /**
 * Returns this transaction hash
 *
 * @returns {string} - The transaction hash
 */
  getTxHash(): string {
    if (!this._stxTransaction) {
      throw new Error('Missing transaction');
    }
    return this._stxTransaction.serialize().toString('hex')
  }

  /**
  * Set the transaction type
  *
  * @param {TransactionType} transactionType The transaction type to be set
  */
  setTransactionType(transactionType: TransactionType): void {
    this._type = transactionType;
  }

  /**
   * Load the input and output data on this transaction using the transaction json
   * if there are outputs. For transactions without outputs (e.g. wallet initializations),
   * this function will not do anything
   */
  loadInputsAndOutputs(): void {
    const txJson = this.toJson();
    if (txJson.to && txJson.amount) {
      this._outputs = [{
        address: txJson.to,
        value: txJson.amount,
        coin: this._coinConfig.name,
      }];

      this._inputs = [{
        address: txJson.from,
        value: txJson.amount,
        coin: this._coinConfig.name,
      }];
    }
  }
}
