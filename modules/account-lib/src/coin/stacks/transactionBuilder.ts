import BigNumber from 'bignumber.js';
import BigNum from 'bn.js';
import { BaseTransactionBuilder } from "../baseCoin";
import { NotImplementedError } from '../baseCoin/errors';
import { BaseCoin as CoinConfig } from '@bitgo/statics/dist/src/base';
import { Transaction } from './transaction';
import { BufferReader, deserializeTransaction, StacksTransaction } from "@stacks/transactions";
import { BaseAddress, BaseFee, BaseKey } from '../baseCoin/iface';
import { deserializePayload } from '@stacks/transactions/dist/transactions/src/payload';
import { KeyPair } from './keyPair'
import { SignatureData } from './iface'


export abstract class TransactionBuilder extends BaseTransactionBuilder {

    private _transaction: Transaction
    protected _fee: BaseFee;
    protected _nonce: number;
    protected _source: BaseAddress;
    protected _memo: string;
    protected _multiSignerKeyPairs: KeyPair[];
    protected _signatures: SignatureData[];
    protected _senderKey: string

    constructor(_coinConfig: Readonly<CoinConfig>) {
        super(_coinConfig);
        this.transaction = new Transaction(_coinConfig)
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

    }

    /** @inheritdoc */
    protected fromImplementation(rawTransaction: string): Transaction {
        const tx = new Transaction(this._coinConfig);
        const stackstransaction = deserializeTransaction(BufferReader.fromBuffer(Buffer.from(rawTransaction)))
        tx.stxTransaction = stackstransaction
        this.initBuilder(tx);
        return this.transaction;
    }

    // region Base Builder
    /** @inheritdoc */
    protected async buildImplementation(): Promise<Transaction> {
        this._transaction.stxTransaction.setFee(new BigNum(this._fee.fee))
        this._transaction.stxTransaction.setNonce(new BigNum(this._nonce))
        return this._transaction;
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

    senderKey(sKey: string): this {
        this._senderKey = sKey
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

    // region Validators
    /** @inheritdoc */
    validateAddress(address: BaseAddress, addressFormat?: string): void {
        throw new NotImplementedError('validateAddress not implemented');
    }

    /** @inheritdoc */
    validateKey(key: BaseKey): void {
        throw new NotImplementedError('validateKey not implemented');
    }

    /** @inheritdoc */
    validateRawTransaction(rawTransaction: any): void {
        throw new NotImplementedError('validateRawTransaction not implemented');
    }

    /** @inheritdoc */
    validateTransaction(transaction?: Transaction): void {
        throw new NotImplementedError('validateTransaction not implemented');
    }

    /** @inheritdoc */
    validateValue(value: BigNumber): void {
        throw new NotImplementedError('validateValue not implemented');
    }

}