import { createHash } from 'crypto';
import { BaseCoin as CoinConfig } from '@bitgo/statics/';
import ByteBuffer from 'byte';
import { TransactionType } from '../baseCoin';
import { protocol } from '../../../resources/trx/protobuf/tron';
import { BaseKey } from '../baseCoin/iface';
import { BuildTransactionError, InvalidParameterValueError, SigningError } from '../baseCoin/errors';
import { TransactionBuilder } from './transactionBuilder';
import { Address } from './address';
import { Transaction } from './transaction';
import { Block, Fee, TransactionReceipt, TriggerSmartContract } from './iface';
import { KeyPair } from './keyPair';
import {
  decodeTransaction,
  getBase58AddressFromHex,
  getByteArrayFromHexAddress,
  getHexAddressFromBase58Address,
  signTransaction,
} from './utils';

import ContractType = protocol.Transaction.Contract.ContractType;

export class ContractCallBuilder extends TransactionBuilder {
  protected _signingKeys: BaseKey[];
  private _toContractAddress: string;
  private _data: string;
  private _ownerAddress: string;
  private _refBlockBytes: string;
  private _refBlockHash: string;
  private _expiration: number;
  private _timestamp: number;
  private _feeLimit: string;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
    this._signingKeys = [];
    this.transaction = new Transaction(_coinConfig);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.createTransaction();
    /** @inheritdoc */
    // This method must be extended on child classes
    if (this._signingKeys.length > 0) {
      this.applySignatures();
    }

    if (!this.transaction.id) {
      throw new BuildTransactionError('A valid transaction must have an id');
    }
    return Promise.resolve(this.transaction);
  }

  /** @inheritdoc */
  protected signImplementation(key: BaseKey): Transaction {
    if (this._signingKeys.includes(key)) {
      throw new SigningError('Duplicated key');
    }
    this._signingKeys.push(key);

    // We keep this return for compatibility but is not meant to be use
    return this.transaction;
  }

  /** @inheritdoc */
  initBuilder(tx: Transaction): this {
    this.transaction = tx;
    this._signingKeys = [];
    const rawData = tx.toJson().raw_data;
    this._refBlockBytes = rawData.ref_block_bytes;
    this._refBlockHash = rawData.ref_block_hash;
    this._expiration = rawData.expiration;
    this._timestamp = rawData.timestamp;

    this.transaction.setTransactionType(TransactionType.ContractCall);
    const raw_data = tx.toJson().raw_data;
    const contractCall = raw_data.contract[0] as TriggerSmartContract;
    this.initContractCall(contractCall);
    return this;
  }

  /**
   * Initialize the contract call specific data
   * @param {ValueFields} contractCall object with transfer data
   */
  protected initContractCall(contractCall: TriggerSmartContract): void {
    const { data, owner_address, contract_address } = contractCall.parameter.value;
    if (data) {
      this.data(data);
    }
    if (contract_address) {
      this.to({ address: getBase58AddressFromHex(contract_address) });
    }
    if (owner_address) {
      this.source({ address: getBase58AddressFromHex(owner_address) });
    }
  }

  /** @inheritdoc */
  validateMandatoryFields() {
    // super.validateMandatoryFields();
    if (!this._data) {
      throw new BuildTransactionError('Missing parameter: source');
    }
    if (!this._toContractAddress) {
      throw new BuildTransactionError('Missing parameter: to');
    }
    if (!this._refBlockBytes || !this._refBlockHash) {
      throw new BuildTransactionError('Missing block reference information');
    }
    // TODO : fix validation and how we handle expiration/timestamp
    // if (!this._expiration || !this._timestamp) {
    //   throw new BuildTransactionError('Missing expiration or timestamp info');
    // }
  }

  //region Transfer fields
  /**
   * Set the source address,
   *
   * @param {Address} address source account
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  source(address: Address): this {
    this.validateAddress(address);
    this._ownerAddress = getHexAddressFromBase58Address(address.address);
    return this;
  }

  /**
   * Set the destination address where the funds will be sent,
   *
   * @param {Address} address the address to transfer funds to
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  to(address: Address): this {
    this.validateAddress(address);
    this._toContractAddress = getHexAddressFromBase58Address(address.address);
    return this;
  }

  /**
   * Set the data with the method call and parameters
   * @param {string} data data encoded on hexa
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  data(data: string): this {
    // TODO : validate hexa;
    this._data = data;
    return this;
  }

  /**
   * Set the block values,
   *
   * @param {Block} block
   * @returns {TransferBuilder} the builder with the new parameter set
   */
  block(block: Block): this {
    const array = ByteBuffer.allocate(8)
      .putLong(block.number)
      .array();

    this._refBlockHash = Buffer.from(block.hash, 'hex')
      .slice(8, 16)
      .toString('hex');

    this._refBlockBytes = array.slice(6, 8).toString('hex');
    return this;
  }

  expiration(time: number): this {
    this._timestamp = this._timestamp || Date.now();
    this.validateExpirationTime(time);
    this._expiration = time;
    return this;
  }

  timestamp(time: number): this {
    this._timestamp = time;
    return this;
  }

  fee(fee: Fee): this {
    this._feeLimit = fee.feeLimit; // TODO : fee validation
    return this;
  }

  //endregion
  // TODO: make proper time validation
  validateExpirationTime(value: number): void {
    if (value < this._timestamp) {
      throw new InvalidParameterValueError('Value must be greater than timestamp');
    }
  }

  private createTransaction(): void {
    const rawDataHex = this.getRawDataHex();
    const rawData = decodeTransaction(rawDataHex);
    (rawData
      .contract[0] as TriggerSmartContract).parameter.value.contract_address = this._toContractAddress.toLocaleLowerCase();
    (rawData
      .contract[0] as TriggerSmartContract).parameter.value.owner_address = this._ownerAddress.toLocaleLowerCase();
    (rawData.contract[0] as TriggerSmartContract).parameter.value.data = this._data.toLocaleLowerCase();
    (rawData.contract[0] as TriggerSmartContract).parameter.type_url =
      'type.googleapis.com/protocol.TriggerSmartContract';
    (rawData.contract[0] as TriggerSmartContract).type = 'TriggerSmartContract';
    const hexBuffer = Buffer.from(rawDataHex, 'hex');
    const id = createHash('sha256')
      .update(hexBuffer)
      .digest('hex');
    const txRecip: TransactionReceipt = {
      raw_data: rawData,
      raw_data_hex: rawDataHex,
      txID: id,
      signature: this.transaction.signature,
    };
    this.transaction = new Transaction(this._coinConfig, txRecip);
  }

  private getRawDataHex(): string {
    const rawContract = {
      ownerAddress: getByteArrayFromHexAddress(this._ownerAddress),
      contractAddress: getByteArrayFromHexAddress(this._toContractAddress),
      data: getByteArrayFromHexAddress(this._data),
    };
    const contractCall = protocol.TriggerSmartContract.fromObject(rawContract);
    const contractBytes = protocol.TriggerSmartContract.encode(contractCall).finish();
    const txContract = {
      type: ContractType.TriggerSmartContract,
      parameter: {
        value: contractBytes,
        type_url: 'type.googleapis.com/protocol.TriggerSmartContract',
      },
    };
    const raw = {
      refBlockBytes: Buffer.from(this._refBlockBytes, 'hex'),
      refBlockHash: Buffer.from(this._refBlockHash, 'hex'),
      expiration: this._expiration,
      timestamp: this._timestamp,
      contract: [txContract],
      fee_limit: this._feeLimit,
    };
    const rawTx = protocol.Transaction.raw.create(raw);
    return Buffer.from(protocol.Transaction.raw.encode(rawTx).finish()).toString('hex');
  }

  private applySignatures(): void {
    if (!this.transaction.inputs) {
      throw new SigningError('Transaction has no sender');
    }

    if (!this.transaction.outputs) {
      throw new SigningError('Transaction has no receiver');
    }
    this._signingKeys.forEach(key => this.applySignature(key));
  }

  private applySignature(key: BaseKey): void {
    const oldTransaction = this.transaction.toJson();
    // Store the original signatures to compare them with the new ones in a later step. Signatures
    // can be undefined if this is the first time the transaction is being signed
    const oldSignatureCount = oldTransaction.signature ? oldTransaction.signature.length : 0;
    let signedTransaction: TransactionReceipt;
    try {
      const keyPair = new KeyPair({ prv: key.key });
      // Since the key pair was generated using a private key, it will always have a prv attribute,
      // hence it is safe to use non-null operator
      signedTransaction = signTransaction(keyPair.getKeys().prv!, this.transaction.toJson());
    } catch (e) {
      throw new SigningError('Failed to sign transaction via helper.');
    }

    // Ensure that we have more signatures than what we started with
    if (!signedTransaction.signature || oldSignatureCount >= signedTransaction.signature.length) {
      throw new SigningError('Transaction signing did not return an additional signature.');
    }
  }

  /** @inheritdoc */
  // Specifically, checks hex underlying transaction hashes to correct transaction ID.
  validateTransaction(transaction: Transaction): void {
    this.validateMandatoryFields();
  }
}
