import { Transaction } from './transaction';
import { BaseKey } from '../baseCoin/iface';
import { Address } from './address';
import BigNumber from 'bignumber.js';
import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { TransactionBuilder } from './transactionBuilder';
import { BaseTransaction } from '../baseCoin';
import { KeyPair } from './keyPair';
import { decodeTransaction } from './utils';
import { ContractType } from './enum';
import { InvalidTransactionError } from '../baseCoin/errors';
// import { ContractCallBuilder } from './contractCallBuilder';

export class WrappedBuilder extends TransactionBuilder {
  private _builder: TransactionBuilder;
  // private _builder: TransactionBuilder | ContractCallBuilder;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    // defaults to old builder
    this._builder = new TransactionBuilder(_coinConfig);
  }

  // getContractCallBuilder(tx?: Transaction): ContractCallBuilder {
  //   return this.initializeBuilder(tx, new ContractCallBuilder(this._coinConfig));
  // }

  private initializeBuilder<T extends TransactionBuilder>(tx: Transaction | undefined, builder: T): T {
    if (tx) {
      builder.initBuilder(tx);
    }
    return builder;
  }
  extendValidTo(extensionMs: number) {
    this._builder.extendValidTo(extensionMs);
  }

  sign(key: BaseKey) {
    this._builder.sign(key);
  }

  async build(): Promise<BaseTransaction> {
    return this._builder.build();
  }

  from(raw: any) {
    // this.validateRawTransaction(raw);
    const rawDataHex = this.getTxReceip(raw);
    const decodedTx = decodeTransaction(rawDataHex);
    const contractType = decodedTx.contractType;
    switch (contractType) {
      case ContractType.Transfer:
      case ContractType.AccountPermissionUpdate:
        this._builder = new TransactionBuilder(this._coinConfig);
        break;
      // case ContractType.TriggerSmartContract:
      //   return true
      default:
        throw new InvalidTransactionError('Invalid transaction type: ' + contractType);
    }
    this._builder.from(raw);
    return this._builder;
  }

  private getTxReceip(raw: string | { [key: string]: any }): string {
    return raw['raw_data_hex'] || this.getTxReceip(JSON.parse(raw as string));
  }

  validateAddress(address: Address): void {
    this._builder.validateAddress(address);
  }

  validateKey(key: BaseKey): void {
    try {
      new KeyPair({ prv: key.key });
    } catch (err) {
      throw new Error('The provided key is not valid');
    }
  }

  validateRawTransaction(rawTransaction: any): void {
    this._builder.validateRawTransaction(rawTransaction);
  }

  validateTransaction(transaction: Transaction): void {
    this._builder.validateTransaction(transaction);
  }

  validateValue(value: BigNumber): void {
    this._builder.validateValue(value);
  }
}
