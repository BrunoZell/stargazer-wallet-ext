import { ITransactionInfo } from '../../types';
import { IAssetState } from '../../../state/vault/types';
import { AccountMonitor } from '../helpers/accountMonitor';

export interface IAccountController {
  monitor: Readonly<AccountMonitor>;
  getTempTx: () => ITransactionInfo | null;
  updateTempTx: (tx: ITransactionInfo) => void;
  confirmTempTx: () => Promise<void>;
  isValidDAGAddress: (address: string) => boolean;
  isValidERC20Address: (address: string) => boolean;
  // subscribeAccount: (id: string, label?: string) => Promise<string | null>;
  // unsubscribeAccount: (index: number, pwd: string) => boolean;
  // addNewAccount: (label: string) => Promise<string | null>;
  updateTxs: (limit?: number, searchAfter?: string) => Promise<void>;
  getFullETHTxs: () => any[];
  updateWalletLabel: (walletId: string, label: string) => void;
  updateAccountActiveAsset: (asset: IAssetState) => void;
  addNewToken: (address: string) => Promise<void>;
  getRecommendFee: () => Promise<number>;
  getRecommendETHTxConfig: () => Promise<{
    nonce: number;
    gas: number;
    gasLimit: number;
  }>;
  updateETHTxConfig: ({
                        nonce,
                        gas,
                        gasLimit,
                      }: {
    gas?: number;
    gasLimit?: number;
    nonce?: number;
  }) => void;
  getLatestGasPrices: () => Promise<number[]>;
  estimateGasFee: (gas: number, gasLimit?: number) => Promise<number>;
  // watchMemPool: () => void;
  getLatestTxUpdate: () => Promise<void>;
}