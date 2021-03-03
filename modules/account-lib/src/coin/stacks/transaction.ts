import BigNumber from 'bignumber.js';
import { BufferReader, PayloadType, StacksTransaction, TransactionSigner, createStacksPrivateKey, deserializeTransaction } from '@stacks/transactions';
import { BaseCoin as CoinConfig } from '@bitgo/statics';
// import { serializePayload } from '@stacks/transactions/dist/transactions/src/payload';
import { addressToString } from '@stacks/transactions';
import { SigningError } from '../baseCoin/errors';
import { BaseKey } from '../baseCoin/iface';
import { BaseTransaction, TransactionType } from '../baseCoin';
import { TxData } from './iface';
import { getTxSenderAddress, bufferToHexPrefixString } from './utils';
import { KeyPair } from './';
import { publicKeyFromBuffer } from '@stacks/transactions'

export class Transaction extends BaseTransaction {
  private _stxTransaction: StacksTransaction;
  protected _type: TransactionType;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritdoc */
  canSign(key: BaseKey): boolean {
    return true;
  }

  async sign(keyPair: KeyPair): Promise<void> {
    const keys = keyPair.getKeys();
    if (!keys.prv) {
      throw new SigningError('Missing private key');
    }
    const privKey = createStacksPrivateKey(keys.prv);
    const signer = new TransactionSigner(this._stxTransaction);
    signer.signOrigin(privKey);
  }

  /** @inheritdoc */
  toJson() {
    const result: TxData = {
      id: this._stxTransaction.txid(),
      fee: new BigNumber(this._stxTransaction.auth.getFee().toString()).toNumber(),
      from: getTxSenderAddress(this._stxTransaction),
      payload: { payloadType: this._stxTransaction.payload.payloadType },
    };

    if (this._stxTransaction.payload.payloadType == PayloadType.TokenTransfer) {
      const payload = this._stxTransaction.payload;
      result.payload.memo = payload.memo.content;
      result.payload.to = addressToString({
        type: 0,
        version: payload.recipient.address.version,
        hash160: payload.recipient.address.hash160.toString(),
      });
      result.payload.amount = payload.amount.toString();
    }
    return result;
  }
  toBroadcastFormat(): string {
    return bufferToHexPrefixString(this._stxTransaction.serialize());
  }

  get stxTransaction(): StacksTransaction {
    return this._stxTransaction;
  }

  set stxTransaction(t: StacksTransaction) {
    this._stxTransaction = t;
  }

  /**
   * Sets this transaction payload
   *
   * @param {Payload} payload transaction payload
   */
  fromRawTransaction(rawTransaction: string) {
    this._stxTransaction = deserializeTransaction(BufferReader.fromBuffer(Buffer.from(rawTransaction.substring(2), 'hex')))
    this.loadInputsAndOutputs();
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
    if (txJson.payload.to && txJson.payload.amount) {
      this._outputs = [
        {
          address: txJson.payload.to,
          value: txJson.payload.amount,
          coin: this._coinConfig.name,
        },
      ];

      this._inputs = [
        {
          address: txJson.from,
          value: txJson.payload.amount,
          coin: this._coinConfig.name,
        },
      ];
    }
  }
}
