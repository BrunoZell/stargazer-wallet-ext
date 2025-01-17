import { dag4 } from '@stardust-collective/dag4';
import { KeyringNetwork } from '@stardust-collective/dag4-keyring';
import { DagWalletMonitorUpdate } from '@stardust-collective/dag4-wallet';
import { Subscription } from 'rxjs';
import { getAccountController } from 'utils/controllersUtils';
import { IAssetInfoState } from 'state/assets/types';
import store from '../../../state/store';
import { updateBalances } from '../../../state/vault';
import IVaultState, {
  ActiveNetwork,
  AssetType,
  IWalletState,
} from '../../../state/vault/types';
import ControllerUtils from '../controllers/ControllerUtils';
import { AccountTracker } from '../controllers/EVMChainController';
import { getAllEVMChains } from '../controllers/EVMChainController/utils';
import { toDag } from 'utils/number';
import { DAG_NETWORK } from 'constants/index';

const THIRTY_SECONDS = 30 * 1000;

export type AccountTrackerList = {
  [network: string]: AccountTracker;
};

export class AssetsBalanceMonitor {
  private priceIntervalId: any;

  private dagBalIntervalId: any;

  private accountTrackerList: AccountTrackerList;

  private subscription: Subscription;

  private utils = ControllerUtils();

  constructor() {
    // 349: New network should be added here.
    this.accountTrackerList = {
      [KeyringNetwork.Constellation]: new AccountTracker(),
      [KeyringNetwork.Ethereum]: new AccountTracker(),
      Polygon: new AccountTracker(),
      Avalanche: new AccountTracker(),
      BSC: new AccountTracker(),
    };
  }

  async start() {
    const { activeWallet, activeNetwork }: IVaultState = store.getState().vault;

    if (activeWallet) {
      let hasDAG = false;
      let hasETH = false;

      activeWallet.assets.forEach((a) => {
        hasDAG =
          hasDAG ||
          a.type === AssetType.Constellation ||
          a.type === AssetType.LedgerConstellation;
        hasETH = hasETH || a.type === AssetType.Ethereum || a.type === AssetType.ERC20;
      });

      if (hasDAG) {
        // TODO-421: Check observeMemPoolChange and startMonitor
        this.subscription = dag4.monitor
          .observeMemPoolChange()
          .subscribe((up) => this.pollPendingTxs(up));
        dag4.monitor.startMonitor();

        if (this.dagBalIntervalId) {
          clearInterval(this.dagBalIntervalId);
        }

        this.dagBalIntervalId = setInterval(
          () => this.refreshDagBalance(),
          THIRTY_SECONDS
        );
        setTimeout(() => {
          this.refreshDagBalance();
        }, 100);
      }

      if (hasETH) {
        this.startMonitor(activeWallet, activeNetwork);
      }

      if (this.priceIntervalId) {
        clearInterval(this.priceIntervalId);
      }

      this.utils.updateFiat();
      this.priceIntervalId = setInterval(this.utils.updateFiat, THIRTY_SECONDS);
    }
  }

  stop() {
    const { activeNetwork } = store.getState().vault;
    const networksList = Object.keys(activeNetwork);
    clearInterval(this.priceIntervalId);
    clearInterval(this.dagBalIntervalId);
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.priceIntervalId = null;
    this.dagBalIntervalId = null;
    for (let i = 0; i < networksList.length; i++) {
      const networkId = networksList[i];
      this.accountTrackerList[networkId].config(null, null, null, null, null);
    }
  }

  private async pollPendingTxs(update: DagWalletMonitorUpdate) {
    if (update.pendingHasConfirmed) {
      getAccountController().getLatestTxUpdate();
    }
  }

  private async getCurrencyAddressBlockExplorerBalance(
    metagraphAddress: string,
    dagAddress: string
  ): Promise<string> {
    try {
      const balance =
        (
          (await dag4.network.blockExplorerV2Api.getCurrencyAddressBalance(
            metagraphAddress,
            dagAddress
          )) as any
        )?.data?.balance ?? 0;
      const balanceNumber = toDag(balance);

      return String(balanceNumber);
    } catch (err) {
      return '-';
    }
  }

  private async getCurrencyAddressL0Balance(l0asset: IAssetInfoState): Promise<string> {
    try {
      const metagraphClient = dag4.account.createMetagraphTokenClient({
        metagraphId: l0asset.address,
        id: l0asset.address,
        l0Url: l0asset.l0endpoint,
        l1Url: l0asset.l1endpoint,
        // Block explorer not available for local development
        beUrl: '',
      });

      const balanceNumber = await metagraphClient.getBalance();

      return String(balanceNumber);
    } catch (err) {
      return '-';
    }
  }

  private async getAddressBlockExplorerBalance(address: string): Promise<string> {
    try {
      const balance: number =
        ((await dag4.network.blockExplorerV2Api.getAddressBalance(address)) as any)?.data
          ?.balance ?? 0;
      const balanceNumber = toDag(balance);

      return String(balanceNumber);
    } catch (err) {
      return '-';
    }
  }

  async refreshL0balances(l0assets: IAssetInfoState[], dagAddress: string) {
    let l0balances: Record<string, string> = {};
    await Promise.all(
      l0assets.map(async (l0asset) => {
        let balanceString;
        if (l0asset.network === DAG_NETWORK.local2.id) {
          // Get balance from L0 API for local development
          balanceString = await this.getCurrencyAddressL0Balance(l0asset);
        } else {
          balanceString = await this.getCurrencyAddressBlockExplorerBalance(
            l0asset.address,
            dagAddress
          );
        }

        l0balances[l0asset.id] = balanceString;
      })
    );

    return l0balances;
  }

  async refreshDagBalance() {
    const { balances, activeNetwork } = store.getState().vault;
    const { assets } = store.getState();

    try {
      // Hotfix: Use block explorer API directly.
      const { address } = dag4.account;

      const l0assets = Object.values(assets).filter(
        (asset) =>
          !!asset?.l0endpoint &&
          !!asset?.l1endpoint &&
          asset?.network === activeNetwork.Constellation
      );
      const [l0balances, balanceString] = await Promise.all([
        this.refreshL0balances(l0assets, address),
        this.getAddressBlockExplorerBalance(address),
      ]);

      store.dispatch(
        updateBalances({
          ...balances,
          ...l0balances,
          [AssetType.Constellation]: balanceString,
        })
      );
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      } else {
        console.log(e);
      }
    }
  }

  // TODO-349: Check if this util is fine here
  private getNetworkMainTokenType(networkId: string) {
    switch (networkId) {
      case KeyringNetwork.Constellation:
        return AssetType.Constellation;
      case KeyringNetwork.Ethereum:
        return AssetType.Ethereum;
      case 'Avalanche':
        return AssetType.Avalanche;
      case 'BSC':
        return AssetType.BSC;
      case 'Polygon':
        return AssetType.Polygon;

      default:
        return AssetType.Constellation;
    }
  }

  private startMonitor(activeWallet: IWalletState, activeNetwork: ActiveNetwork) {
    const { assets } = store.getState();
    const networksList = Object.keys(activeNetwork);
    const chainsList = Object.values(activeNetwork);
    const EVM_CHAINS = getAllEVMChains();

    // Remove Constellation chain
    networksList.shift();
    chainsList.shift();

    for (let i = 0; i < chainsList.length; i++) {
      const chainId = chainsList[i];
      const networkId = networksList[i];
      const chainInfo = EVM_CHAINS[chainId];

      // TODO-349: Check if tokens are filtered correctly
      const chainTokens = activeWallet.assets
        .filter((a) => {
          return a.type === AssetType.ERC20 && assets[a.id]?.network === chainId;
        })
        .map((a) => {
          const { address, decimals, network } = assets[a.id];
          return { contractAddress: address, decimals, chain: network };
        });

      // Main token type
      const MainAssetType = this.getNetworkMainTokenType(networkId);

      // ETH asset
      const ethAsset = activeWallet.assets.find((a) => a.type === AssetType.Ethereum);

      if (!!ethAsset && !!chainInfo) {
        this.accountTrackerList[networkId].config(
          ethAsset?.address,
          chainInfo.rpcEndpoint,
          chainTokens,
          chainInfo.chainId,
          (mainAssetBalance, tokenBals) => {
            const { balances } = store.getState().vault;
            store.dispatch(
              updateBalances({
                ...balances,
                [MainAssetType]: mainAssetBalance || '-',
                ...tokenBals,
              })
            );
          },
          30
        );
      } else {
        console.log(`Error: Unable to configure ${networkId}`);
      }
    }
  }
}
