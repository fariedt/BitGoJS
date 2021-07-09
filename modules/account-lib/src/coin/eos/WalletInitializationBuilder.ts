import { BaseCoin as CoinConfig } from '@bitgo/statics';
import { TransactionBuilder } from './transactionBuilder';
import { Transaction } from './transaction';
import { StakeActionBuilder } from './StakeActionBuilder';
import { BuyRamBytesActionBuilder } from './BuyRamBytesActionBuilder';
import { NewAccountActionBuilder } from './NewAccountActionBuilder';


export class WalletInitializationBuilder extends TransactionBuilder {
  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this.actionBuilders = [];
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    return super.buildImplementation();
  }

  /** @inheritdoc */
  protected fromImplementation(rawTransaction: any): Transaction {
    return super.fromImplementation(rawTransaction);
  }

  /**
   * Initialize building action
   *
   * @param {string} account Account name
   * @param {string[]} actors Authorization field
   * @returns {BuyRamBytesActionBuilder} builder to construct buy ram bytes action
   */
   buyRamBytesActionBuilder(account: string, actors: string[]): BuyRamBytesActionBuilder {
    const builder = new BuyRamBytesActionBuilder(super.action(account, actors));
    this.actionBuilders.push(builder);
    return builder;
  }

  /**
   * Initialize building action
   *
   * @param {string} account Account name
   * @param {string[]} actors Authorization field
   * @returns {StakeActionBuilder} builder to construct stake action
   */
  stakeActionBuilder(account: string, actors: string[]): StakeActionBuilder {
    const builder = new StakeActionBuilder(super.action(account, actors));
    this.actionBuilders.push(builder);
    return builder;
  }

  /**
   * Initialize building action
   *
   * @param {string} account Account name
   * @param {string[]} actors Authorization field
   * @returns {NewAccountActionBuilder} builder to construct new account
   */
   newAccountActionBuilder(account: string, actors: string[]): NewAccountActionBuilder {
    const builder = new NewAccountActionBuilder(super.action(account, actors));
    this.actionBuilders.push(builder);
    return builder;
  }

  /** @inheritdoc */
  validateRawTransaction(rawTransaction: any): void {
    super.validateRawTransaction(rawTransaction);
  }

  /** @inheritdoc */
  validateTransaction(transaction?: Transaction): void {
    super.validateTransaction(transaction);
  }
}
