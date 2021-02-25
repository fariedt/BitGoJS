import { PayloadType } from '@stacks/transactions';
import { KeyPair } from '.';
export interface TxData {
    id: string;
    from: string;
    fee: number;
    payload: StacksTransactionPayload
}
export interface SignatureData {
    signature: string;
    keyPair: KeyPair;
}

export interface StacksTransactionPayload {
    payloadType: PayloadType
    memo?: string;
    to?: string;
    amount?: string;
}