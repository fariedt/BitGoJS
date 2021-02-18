import BigNumber from 'bignumber.js';
import BigNum from 'bn.js';
import { BaseTransactionBuilder } from "../baseCoin";
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Transaction } from './transaction';
import { BufferReader, deserializeTransaction, StacksTransaction } from "@stacks/transactions";
import { BaseAddress, BaseFee, BaseKey } from '../baseCoin/iface';
import { deserializePayload } from '@stacks/transactions/dist/transactions/src/payload';


export abstract class TransactionBuilder extends BaseTransactionBuilder {

    private _transaction: Transaction
    protected _fee: BaseFee;
    protected _source: BaseAddress;
    protected _memo: string;
    protected _data: string

    constructor(_coinConfig: Readonly<CoinConfig>) {
        super(_coinConfig);
        this.transaction = new Transaction(_coinConfig)
    }

    /** @inheritdoc */
    protected fromImplementation(rawTransaction: string): Transaction {
        const tx = new Transaction(this._coinConfig);
        const stackstransaction = deserializeTransaction(BufferReader.fromBuffer(Buffer.from(rawTransaction)))
        tx.body(stackstransaction)
        this.initBuilder(tx);
        return this.transaction;
    }

    // region Base Builder
    /** @inheritdoc */
    protected async buildImplementation(): Promise<Transaction> {
        this._transaction.stxTransaction.setFee(new BigNum(this._fee.fee))
        // this._txBody.transactionID = this.buildTxId();
        // this._txBody.memo = this._memo;
        const sTransaction = this.transaction.stxTransaction
        sTransaction.payload = deserializePayload(BufferReader.fromBuffer(Buffer.from(this._data)))
        this.transaction.body(sTransaction);
        // for (const kp of this._multiSignerKeyPairs) {
        //     await this.transaction.sign(kp);
        // }
        // for (const { signature, keyPair } of this._signatures) {
        //     this.transaction.addSignature(signature, keyPair);
        // }
        return this.transaction;
    }

    /** @inheritdoc */
    protected get transaction(): Transaction {
        return this._transaction;
    }

    /** @inheritdoc */
    protected set transaction(transaction: Transaction) {
        this._transaction = transaction;
    }

    /**
   * Initialize the transaction builder fields using the decoded transaction data
   *
   * @param {Transaction} tx the transaction data
   */
    initBuilder(tx: Transaction): void {
        this.transaction = tx;
        // this.transaction.loadPreviousSignatures();
        const txData = tx.toJson();
        this.fee({ fee: txData.fee.toString() });
        this.source({ address: txData.from });
        if (txData.memo) {
            this.memo(txData.memo);
        }
        this.data(txData.data)
    }

    /**
   * Set the transaction fees
   *
   * @param {BaseFee} fee The maximum gas to pay
   * @returns {TransactionBuilder} This transaction builder
   */
    fee(fee: BaseFee): this {
        this.validateValue(new BigNumber(fee.fee));
        this._fee = fee;
        return this;
    }

    data(payload: string): this {
        this._data = payload
        return this
    }

    /**
   *  Set the memo
   *
   * @param {string} memo 
   * @returns {TransactionBuilder} This transaction builder
   */
    memo(memo: string): this {
        this._memo = memo;
        return this;
    }


    /**
     * Set the transaction source
     *
     * @param {BaseAddress} address The source account
     * @returns {TransactionBuilder} This transaction builder
     */
    source(address: BaseAddress): this {
        this.validateAddress(address);
        this._source = address;
        return this;
    }

}