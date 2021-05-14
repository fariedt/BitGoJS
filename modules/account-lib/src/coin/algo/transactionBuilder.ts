import BigNumber from 'bignumber.js';
import { BaseCoin as CoinConfig } from '@bitgo/statics';
import algosdk from 'algosdk';
import { BaseTransaction, BaseTransactionBuilder } from '../baseCoin';
import { BuildTransactionError, NotImplementedError } from '../baseCoin/errors';
import { BaseAddress, BaseFee, BaseKey } from '../baseCoin/iface';
import { Transaction } from './transaction';
import { isBase64String, isValidPrivateKey } from './validation';
import { AddressValidationError, InsufficientFeeError } from './errors';

const MIN_FEE = 1000; // in microalgos

const MAINNET_GENESIS_ID = 'mainnet-v1.0';
const MAINNET_GENESIS_HASH = 'wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=';
const TESTNET_GENESIS_ID = 'testnet-v1.0';
const TESTNET_GENESIS_HASH = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
const BETANET_GENESIS_ID = 'betanet-v1.0';
const BETANET_GENESIS_HASH = 'mFgazF+2uRS1tMiL9dsj01hJGySEmPN28B/TjjvpVW0=';

// Algosdk doesn't export the "Address" type so we need to extract it like this
type Address = ReturnType<typeof algosdk.decodeAddress>;

export abstract class TransactionBuilder extends BaseTransactionBuilder {
  private _transaction: Transaction;

  // the fee is specified as a number here instead of a big number because
  // the algosdk also specifies it as a number.
  protected _fee?: number;

  protected _sender?: Address;
  protected _receiver?: Address;
  protected _genesisHash?: string;
  protected _genesisId?: string;
  protected _firstRound?: number;
  protected _lastRound?: number;
  protected _lease?: Uint8Array;
  protected _note?: Uint8Array;
  protected _reKeyTo?: string;

  constructor(coinConfig: Readonly<CoinConfig>) {
    super(coinConfig);

    this._transaction = new Transaction(coinConfig);
  }

  /**
   * Sets the fee.
   *
   * The minimum fee is 1000 microalgos.
   *
   * @param {BaseFee} feeObj The amount to pay to the fee sink denoted in microalgos
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  fee(feeObj: BaseFee): this {
    const fee = new BigNumber(feeObj.fee).toNumber();
    if (fee < MIN_FEE) {
      throw new InsufficientFeeError(fee, MIN_FEE);
    }

    this._fee = fee;

    return this;
  }

  /**
   * Sets the transaction sender.
   *
   * @param {BaseAddress} sender The sender account
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  sender(sender: BaseAddress): this {
    this.validateAddress(sender);
    this._sender = algosdk.decodeAddress(sender.address);

    return this;
  }

  /**
   * Sets the transaction receiver.
   *
   * @param {BaseAddress} receiver The receiver account
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/#payment-transaction
   */
  receiver(receiver: BaseAddress): this {
    this.validateAddress(receiver);
    this._receiver = algosdk.decodeAddress(receiver.address);

    return this;
  }

  /**
   * Sets the genesis id.
   *
   * @param {string} genesisId The genesis id.
   * @example "mainnet-v1.0"
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  genesisId(genesisId: string): this {
    this._genesisId = genesisId;

    return this;
  }

  /**
   * Sets the genesis hash.
   *
   * The genesis hash must be base64 encoded.
   *
   * @param {string} genesisHash The genesis hash.
   * @example "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8="
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  genesisHash(genesisHash: string): this {
    if (!isBase64String(genesisHash)) {
      throw new BuildTransactionError(`Genesis hash: ${genesisHash} is not base64 encoded`);
    }

    this._genesisHash = genesisHash;

    return this;
  }

  /**
   * Sets the genesis id and hash to mainnet.
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/algorand-networks/mainnet/#genesis-id
   * @see https://developer.algorand.org/docs/reference/algorand-networks/mainnet/#genesis-hash
   */
  mainnet(): this {
    this.genesisId(MAINNET_GENESIS_ID);
    this.genesisHash(MAINNET_GENESIS_HASH);

    return this;
  }

  /**
   * Sets the genesis id and hash to testnet.
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/algorand-networks/testnet/#genesis-id
   * @see https://developer.algorand.org/docs/reference/algorand-networks/testnet/#genesis-hash
   */
  testnet(): this {
    this.genesisId(TESTNET_GENESIS_ID);
    this.genesisHash(TESTNET_GENESIS_HASH);

    return this;
  }

  /**
   * Sets the genesis id and hash to betanet.
   *
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/algorand-networks/betanet/#genesis-id
   * @see https://developer.algorand.org/docs/reference/algorand-networks/betanet/#genesis-hash
   */
  betanet(): this {
    this.genesisId(BETANET_GENESIS_ID);
    this.genesisHash(BETANET_GENESIS_HASH);

    return this;
  }

  /**
   * Sets the first round.
   *
   * @param {number} round The first protocol round on which this txn is valid.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  firstRound(round: number): this {
    this.validateValue(new BigNumber(round));

    this._firstRound = round;

    return this;
  }

  /**
   * Sets the last round.
   *
   * @param {number} round The first protocol round on which this txn is valid.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  lastRound(round: number): this {
    this.validateValue(new BigNumber(round));

    this._lastRound = round;

    return this;
  }

  /**
   * Sets the lease on the transaction.
   *
   * A lease is a mutex on the transaction that prevents any other transaction
   * from being sent with the same lease until the prior transaction's last
   * round has passed.
   *
   * @param {Uint8Array} lease The lease to put the transaction.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  lease(lease: Uint8Array): this {
    this._lease = lease;

    return this;
  }

  /**
   * Sets the note for the transaction.
   *
   * @param {Uint8Array} note Arbitrary data for sender to store.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  note(note: Uint8Array): this {
    this._note = note;

    return this;
  }

  /**
   * Sets the authorized address.
   *
   * The authorized asset will be used to authorize all future transactions.
   *
   * @param {BaseAddress} authorizer The address to delegate authorization authority to.
   * @returns {TransactionBuilder} This transaction builder.
   *
   * @see https://developer.algorand.org/docs/reference/transactions/
   */
  reKeyTo(authorizer: BaseAddress): this {
    this.validateAddress(authorizer);
    this._reKeyTo = authorizer.address;

    return this;
  }

  /** @inheritdoc */
  validateAddress({ address }: BaseAddress): void {
    if (!algosdk.isValidAddress(address)) {
      throw new AddressValidationError(address);
    }
  }

  /**
   * @inheritdoc
   * @see https://developer.algorand.org/docs/features/accounts/#transformation-private-key-to-base64-private-key
   */
  validateKey({ key }: BaseKey): void {
    if (!isValidPrivateKey(key)) {
      throw new BuildTransactionError(`Key validation failed`);
    }
  }

  /** @inheritdoc */
  validateRawTransaction(rawTransaction: unknown): void {
    throw new NotImplementedError('validateRawTransaction not implemented');
  }

  /** @inheritdoc */
  validateTransaction(transaction?: BaseTransaction): void {
    throw new NotImplementedError('validateTransaction not implemented');
  }

  /** @inheritdoc */
  validateValue(value: BigNumber): void {
    if (value.isLessThan(0)) {
      throw new BuildTransactionError('Value cannot be less than zero');
    }
  }

  /** @inheritdoc */
  protected get transaction(): BaseTransaction {
    return this._transaction;
  }
}
