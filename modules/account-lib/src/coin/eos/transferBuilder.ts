import { BaseCoin as CoinConfig } from '@bitgo/statics';
import * as EosJs from 'eosjs';
import { NotImplementedError } from '../baseCoin/errors';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';

export class TransferBuilder extends TransactionBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    return super.buildImplementation();
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: any): Transaction {
    throw new NotImplementedError('method not implemented');
  }

  protected actionData(
    action: EosJs.ApiInterfaces.ActionSerializerType,
    data: any,
  ): EosJs.ApiInterfaces.ActionSerializerType {
    return action.transfer(data);
  }

  protected actionName(): string {
    return 'transfer';
  }
}
