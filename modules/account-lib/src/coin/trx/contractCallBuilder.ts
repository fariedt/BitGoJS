import { createHash } from 'crypto';
import { BaseCoin as CoinConfig } from '@bitgo/statics/';
import BigNumber from 'bignumber.js';
import { TransactionType } from '../baseCoin';
import { protocol } from '../../../resources/trx/protobuf/tron';
import { TransactionBuilder } from './transactionBuilder';
import { Address } from './address';
import { Transaction } from './transaction';
import { TransactionReceipt, TriggerSmartContract } from './iface';
import {
  decodeTransaction,
  getBase58AddressFromHex,
  getByteArrayFromHexAddress,
  getHexAddressFromBase58Address,
} from './utils';

import ContractType = protocol.Transaction.Contract.ContractType;

export class ContractCallBuilder extends TransactionBuilder {
  private _toContractAddress: string;
  private _data: string;
  private _ownerAddress: string;
  private _refBlockBytes: string;
  private _refBlockHash: string;
  private _expiration: number;
  private _timestamp: number;

  constructor(_coinConfig: Readonly<CoinConfig>) {
    super(_coinConfig);
  }

  /** @inheritdoc */
  protected async buildImplementation(): Promise<Transaction> {
    this.createTransaction();
    return super.buildImplementation();
  }

  /** @inheritdoc */
  initBuilder(tx: Transaction): this {
    // super.initBuilder(tx);
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

  // /** @inheritdoc */
  // validateMandatoryFields() {
  //   super.validateMandatoryFields();
  //   if (!this._data) {
  //     throw new BuildTransactionError('Missing parameter: source');
  //   }
  //   if (!this._toContractAddress) {
  //     throw new BuildTransactionError('Missing parameter: to');
  //   }
  // }

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

  //endregion

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
      toContractAddress: getByteArrayFromHexAddress(this._toContractAddress),
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
    };
    const rawTx = protocol.Transaction.raw.create(raw);
    return Buffer.from(protocol.Transaction.raw.encode(rawTx).finish()).toString('hex');
  }
}
