import React, { FC, MouseEvent, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import CheckIcon from '@material-ui/icons/CheckCircleRounded';

import Icon from 'components/Icon';
import { RootState } from 'state/store';
import IVaultState, { AssetType } from 'state/vault/types';
import { useController } from 'hooks/index';

import StargazerIcon from 'assets/images/logo-s.svg';
import styles from './index.scss';
import IAssetListState from 'state/assets/types';
import {
  KeyringAssetType,
  KeyringWalletType,
} from '@stardust-collective/dag4-keyring';
import addHeader from 'navigation/headers/add';
import { useLinkTo } from '@react-navigation/native'

interface IWalletsView {
  onChange: (id: string) => void;
  navigation: any;
}

const Wallets: FC<IWalletsView> = ({ navigation }) => {
  const controller = useController();
  const linkTo =  useLinkTo();
  const { wallets, activeWallet: activeWallet }: IVaultState = useSelector(
    (state: RootState) => state.vault
  );
  const assets: IAssetListState = useSelector(
    (state: RootState) => state.assets
  );

  useLayoutEffect(() => {
    const onRightIconClick = () => {
      linkTo('/settings/wallets/add');
    }
    navigation.setOptions(addHeader({ navigation, onRightIconClick }));
  }, []);

  const privKeyAccounts = wallets.filter(
    (w) => w.type === KeyringWalletType.SingleAccountWallet
  );

  const handleSwitchWallet = async (walletId: string) => {
    await controller.wallet.switchWallet(walletId);
    //controller.wallet.account.watchMemPool();
  };

  const handleManageWallet = async (
    ev: MouseEvent<HTMLButtonElement>,
    walletId: string
  ) => {
    ev.stopPropagation();
    await controller.wallet.switchWallet(walletId);
    linkTo(`/settings/wallets/manage?id=${walletId}`);
  };

  return (
    <div className={styles.wallets}>
      <label>
        Multi chain wallets
      </label>
      <div className={styles.group}>
        {wallets
          .filter((w) => w.type === KeyringWalletType.MultiChainWallet)
          .map((wallet) => (
            <section
              className={styles.wallet}
              key={wallet.id}
              onClick={() => handleSwitchWallet(wallet.id)}
            >
              {wallet.id === activeWallet.id && (
                <CheckIcon className={styles.check} />
              )}
              <Icon width={25} Component={StargazerIcon} iconStyles={styles.icon} />
              <span>
                {wallet.label}
                <small>Multi Chain Wallet</small>
              </span>
              <IconButton
                className={styles.details}
                onClick={(ev) => handleManageWallet(ev, wallet.id)}
              >
                <InfoIcon />
              </IconButton>
            </section>
          ))}
      </div>
      {!!privKeyAccounts.length && (
        <>
          <label>Private key wallets</label>
          <div className={styles.group}>
            {privKeyAccounts.map((wallet) => (
              <section
                className={styles.wallet}
                key={wallet.id}
                onClick={() => handleSwitchWallet(wallet.id)}
              >
                {wallet.id === activeWallet.id && (
                  <CheckIcon className={styles.check} />
                )}
                <Icon
                  width={24}
                  Component={
                    assets[
                      wallet.supportedAssets.includes(KeyringAssetType.ETH)
                        ? AssetType.Ethereum
                        : AssetType.Constellation
                    ].logo || StargazerIcon
                  }
                />
                <span>
                  {wallet.label}
                  <small>{wallet.accounts[0].address}</small>
                </span>
                <IconButton
                  className={styles.details}
                  onClick={(ev) => handleManageWallet(ev, wallet.id)}
                >
                  <InfoIcon />
                </IconButton>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wallets;