////////////////////////
// Module Imports
/////////////////////////

import React, { useState, useEffect } from 'react';
import { LedgerAccount } from '@stardust-collective/dag4-ledger';
import { keyStore } from '@stardust-collective/dag4-keystore';
import { makeStyles } from '@material-ui/core/styles';
import { YubikeyBridgeUtil } from '../../utils/yubikeyBridge';
import queryString from 'query-string';
import _ from 'lodash';

/////////////////////////
// Component Imports
/////////////////////////

import Card from '@material-ui/core/Card';
import { Header, AlertBar } from './components';

/////////////////////////
// View Imports
/////////////////////////

import ConnectView, { ConnectYubikeyFetchingView } from './views/connect';
import AccountsView from './views/accounts';
import SignView from './views/sign';
import ImportSuccess from './views/importSuccess';
import MessageSigning from './views/messageSigning';

/////////////////////////
// Styles
/////////////////////////

import 'assets/styles/global.scss';
import { Color } from '@material-ui/lab/Alert';
import { dag4 } from '@stardust-collective/dag4';
// import { StargazerExternalPopups, StargazerWSMessageBroker } from 'scripts/Background/messaging';

/////////////////////////
// Types
/////////////////////////

import { getWalletController } from 'utils/controllersUtils';
import { AccountItem } from 'scripts/types';
// import { KeyringWalletType } from '@stardust-collective/dag4-keyring';
import { KeyringWalletTypeExt } from 'polyfill/KeyringWalletTypeExt';

/////////////////////////
// Constants
/////////////////////////

// Strings
const ROUTES = {
    SIGN_TRANSACTION: 'signTransaction',
    SIGN_MESSAGE: 'signMessage',
};

const YUBIKEY_ERROR_STRINGS = {
    YUBIKEY_BRIDGE_NOT_INSTALLED: 'native messaging host not found',
    YUBIKEY_BRIDGE_FAILED: 'Native host has exited',
    YUBIKEY_BRIDGE_NOT_IMPLEMENTED: 'Yubikey Bridge error: Not implemented',
    YUBIKEY_NO_SIGNATURE_KEY: 'No signature key on Yubikey',
    YUBIKEY_SIGNATURE_KEY_NOT_SECP256K1: 'key is not of type secp256k1',
    CANNOT_CONNECT_TO_YUBIKEYWALLET: '',
    NO_YUBIKEY_FOUND: '',
    NO_GPGKEY_ON_YUBIKEY: '',
    YUBIKEY_USER_REJECTION: '',
    ERROR_CODE_ZERO: '0',
};

const ALERT_MESSAGES_STRINGS = {
    DEFAULT: 'Error: Please contact support.',
    YUBIKEYWALLET_NOT_INSTALLED: 'Yubikey Bridge is not installed in your computer.',
    YUBIKEYWALLET_FAILED: 'Failed to reach Yubikey Bridge. Please contact support.',
    YUBIKEY_BRIDGE_NOT_IMPLEMENTED: 'Yubikey Bridge is not fully implemented',
    CANNOT_CONNECT_TO_YUBIKEYWALLET: 'Unable to connect to Yubikey Bridge. Please ensure the software is installed on your computer.',
    NO_YUBIKEY_FOUND: 'No Yubikey device detected. Please make sure your Yubikey is properly connected.',
    NO_GPGKEY_ON_YUBIKEY: 'No GPG key found on your Yubikey. Please set up a GPG key on your device.',
    YUBIKEY_USER_REJECTION: 'The operation was cancelled by the user.',
    ERROR_CODE_ZERO: 'An unknown error occurred. Please try again or contact support.',
};

// States
enum ALERT_SEVERITY_STATE {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

/////////////////////////
// ENUMS
/////////////////////////

enum WALLET_STATE_ENUM {
    LOCKED = 1,
    YUBIKEY_FETCHING_ADDRESS,
    VIEW_ACCOUNTS,
    IMPORT_SUCCESS,
    SIGN,
    MESSAGE_SIGNING,
}

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: 380,
        height: 570,
        backgroundColor: '#ffffff',
        borderRadius: 6,
    },
});

const YubikeyPage = () => {
    const classes = useStyles();
    const [walletState, setWalletState] = useState<WALLET_STATE_ENUM>(
        WALLET_STATE_ENUM.LOCKED
    );
    const [accountData, setAccountData] = useState<LedgerAccount | null>(null);
    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertSeverity, setAlertSeverity] = useState<Color>('success');
    const [waitingForYubikey, setWaitingForYubikey] = useState<boolean>(false);
    const [transactionSigned, setTransactionSigned] = useState<boolean>(false);
    const [deviceId, setDeviceId] = useState<string | string[]>('');
    const [error] = useState<string>('');
    const walletController = getWalletController();

    //    useEffect(() => {
    //      if (['main2'].includes(activeNetwork.Constellation)) {
    //        YubikeyBridgeUtil.switchDagNetwork(activeNetwork.Constellation);
    //      }
    //    }, [activeNetwork.Constellation]);

    useEffect(() => {
        const { route, deviceId: id } = queryString.parse(location.search);

        if (id) {
            setDeviceId(id);
        }

        if (route === ROUTES.SIGN_TRANSACTION) {
            setWalletState(WALLET_STATE_ENUM.SIGN);
        } else if (route === ROUTES.SIGN_MESSAGE) {
            setWalletState(WALLET_STATE_ENUM.MESSAGE_SIGNING);
        }
    }, []);

    useEffect(() => {
        if (accountData) {
            setSelectedAccount(accountData);
        }
    }, [accountData]);

    const showAlert = (error: string): void => {
        console.log('Error: ' + error);
        let errorMessage = ALERT_MESSAGES_STRINGS.DEFAULT;
        let errorSeverity = ALERT_SEVERITY_STATE.ERROR;

        if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_BRIDGE_NOT_INSTALLED)) {
            errorMessage = ALERT_MESSAGES_STRINGS.YUBIKEYWALLET_NOT_INSTALLED;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_BRIDGE_NOT_IMPLEMENTED)) {
            errorMessage = ALERT_MESSAGES_STRINGS.YUBIKEY_BRIDGE_NOT_IMPLEMENTED;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_NO_SIGNATURE_KEY)) {
            errorMessage = error;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_SIGNATURE_KEY_NOT_SECP256K1)) {
            errorMessage = error;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_BRIDGE_FAILED)) {
            errorMessage = ALERT_MESSAGES_STRINGS.YUBIKEYWALLET_FAILED;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.CANNOT_CONNECT_TO_YUBIKEYWALLET)) {
            errorMessage = ALERT_MESSAGES_STRINGS.CANNOT_CONNECT_TO_YUBIKEYWALLET;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.NO_YUBIKEY_FOUND)) {
            errorMessage = ALERT_MESSAGES_STRINGS.NO_YUBIKEY_FOUND;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.NO_GPGKEY_ON_YUBIKEY)) {
            errorMessage = ALERT_MESSAGES_STRINGS.NO_GPGKEY_ON_YUBIKEY;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.YUBIKEY_USER_REJECTION)) {
            errorMessage = ALERT_MESSAGES_STRINGS.YUBIKEY_USER_REJECTION;
        } else if (error.includes(YUBIKEY_ERROR_STRINGS.ERROR_CODE_ZERO)) {
            errorMessage = ALERT_MESSAGES_STRINGS.ERROR_CODE_ZERO;
        }

        setAlertSeverity(errorSeverity);
        setAlertMessage(errorMessage);
        setOpenAlert(true);
    };

    const onConnectError = (error: string) => {
        showAlert(error);
    };

    const onConnectClick = async () => {
        try {
            setWalletState(WALLET_STATE_ENUM.YUBIKEY_FETCHING_ADDRESS);
            await getAccountData();
        } catch (exc: any) {
            showAlert(exc.message || exc.toString());
            setWalletState(WALLET_STATE_ENUM.LOCKED);
        }
    };

    const getAccountData = async () => {
        try {
            const response = await YubikeyBridgeUtil.getPublicKeyFromYubikey();
            if (response.error) {
                throw new Error(response.error);
            }

            const publicKey = response.publicKey;
            const fingerprint = response.fingerprint;

            if (!publicKey) {
                throw new Error('No public key found');
            }

            if (!fingerprint) {
                throw new Error('No key fingerprint found');
            }

            console.log('Fetched public key: ', publicKey);
            console.log('Fetched fingerprint: ', fingerprint);
            const address = keyStore.getDagAddressFromPublicKey(publicKey);
            console.log('Generated address: ', address);

            // const privKey = dag4.keyStore.generatePrivateKey();
            // const pubKey = dag4.keyStore.getPublicKeyFromPrivate(privKey);
            // console.log('Random private key: ', privKey);
            // console.log('Random public key: ', pubKey);

            const accountData: LedgerAccount = {
                address: address,
                publicKey: publicKey,
                balance: null,
            };

            setAccountData(accountData);
            setDeviceId(fingerprint); // GPG identifies keys with fingerprint. Use as deviceId so it works with all Yubikeys that hold the same key.
            setWalletState(WALLET_STATE_ENUM.VIEW_ACCOUNTS);
        } catch (error: any) {
            console.log('error', error);
            setWalletState(WALLET_STATE_ENUM.LOCKED);
            showAlert(error);
        }
    };

    const onAlertBarClose = () => {
        setOpenAlert(false);
    };

    const onCheckboxChange = (account: LedgerAccount, checked: boolean, key: number) => {
        // Handle checkbox change logic here
        console.log(`Checkbox for account ${account.address} at index ${key} changed to ${checked}`);
    };

    const onImportClick = async () => {
        if (!selectedAccount) return;

        console.log('selectedAccount', selectedAccount);

        const accountsToImport: AccountItem[] = [{
            id: null,
            bipIndex: null,
            type: KeyringWalletTypeExt.YubikeyAccountWallet as any,
            address: selectedAccount.address,
            publicKey: selectedAccount.publicKey,
        }];

        await walletController.importHardwareWalletAccounts(
            accountsToImport,
            deviceId as string
        );

        setWalletState(WALLET_STATE_ENUM.IMPORT_SUCCESS);
    };

    const onCancelClick = () => {
        setWalletState(WALLET_STATE_ENUM.LOCKED);
    };

    const onSignPress = async () => {
        const { deviceId, publicKey, amount, from, to, fee } = queryString.parse(location.search) as any;

        try {
            // setWaitingForYubikey(true);

            const { hash, signedTransaction } = await YubikeyBridgeUtil.generateSignedTransactionWithHashV2(publicKey, deviceId, from, to, Number(amount), Number(fee));
            console.log('tx hash generated and signed: ', hash);
            console.log(signedTransaction);

            const hashSent = await dag4.account.networkInstance.postTransaction(signedTransaction);
            console.log('tx hash sent: ', hashSent);

            // if (hashSent) {
            //     StargazerWSMessageBroker.sendResponseResult(hash, requestMessage);
            // }

            // setWaitingForYubikey(false);
            setTransactionSigned(true);
        } catch (error: any) {
            showAlert(error.message || error.toString());
        }
    };

    const onSignMessagePress = async () => {
        // const { data } = queryString.parse(location.search) as any;
        // const jsonData = JSON.parse(data);
        // const message = jsonData.signatureRequestEncoded;

        // const { data, message: requestMessage } =
        //     StargazerExternalPopups.decodeRequestMessageLocationParams<{
        //         signatureRequestEncoded: string;
        //         asset: string;
        //         provider: string;
        //         chainLabel: string;
        //         walletLabel: string;
        //         bipIndex: string;
        //     }>(location.href);

        // const message = data.signatureRequestEncoded;

        try {
            setWaitingForYubikey(true);
            // const publicKey = null;
            // const keyId = null;
            // const signature = await YubikeyBridgeUtil.signHashOnYubikey(publicKey, keyId, hash);
            // console.log('signature', signature);

            // StargazerWSMessageBroker.sendResponseResult(signature, requestMessage);

            setWaitingForYubikey(false);
            setTransactionSigned(true);
        } catch (error: any) {
            showAlert(error.message || error.toString());
            setWaitingForYubikey(false);
        }
    };

    function RenderByWalletState() {
        if (walletState === WALLET_STATE_ENUM.LOCKED) {
            return (
                <>
                    <ConnectView onConnectClick={onConnectClick} onConnectError={onConnectError} />
                </>
            );
        } else if (walletState === WALLET_STATE_ENUM.YUBIKEY_FETCHING_ADDRESS) {
            return (
                <>
                    <ConnectYubikeyFetchingView
                        error={error}
                        onBack={() => setWalletState(WALLET_STATE_ENUM.LOCKED)}
                    />
                </>
            );
        } else if (walletState === WALLET_STATE_ENUM.VIEW_ACCOUNTS) {
            return (
                <>
                    <AccountsView
                        onCancelClick={onCancelClick}
                        onImportClick={onImportClick}
                        accountData={accountData ? [accountData] : []}
                        checkBoxesState={[true]}
                        fetchingPage={false}
                        startIndex={0}
                        onCheckboxChange={onCheckboxChange}
                    />
                </>
            );
        } else if (walletState === WALLET_STATE_ENUM.IMPORT_SUCCESS) {
            return (
                <>
                    <ImportSuccess />
                </>
            );
        } else if (walletState === WALLET_STATE_ENUM.SIGN) {
            const { amount, fee, from, to } = queryString.parse(location.search) as any;

            return (
                <>
                    <SignView
                        amount={amount}
                        fee={fee}
                        deviceId={deviceId as string}
                        fromAddress={from}
                        toAddress={to}
                        waiting={waitingForYubikey}
                        onSignPress={onSignPress}
                        transactionSigned={transactionSigned}
                    />
                </>
            );
        } else if (walletState === WALLET_STATE_ENUM.MESSAGE_SIGNING) {
            const { data } = queryString.parse(location.search) as any;

            const parsedData = JSON.parse(data);
            const message = JSON.parse(atob(parsedData.signatureRequestEncoded));
            const deviceId = parsedData.deviceId;
            setDeviceId(deviceId);

            return (
                <>
                    <MessageSigning
                        walletLabel={parsedData.walletLabel}
                        deviceId={deviceId}
                        message={message}
                        waiting={waitingForYubikey}
                        onSignMessagePress={onSignMessagePress}
                        messageSigned={transactionSigned}
                        waitingMessage={'Waiting For Yubikey'}
                    />
                </>
            );
        }

        return null;
    }

    return (
        <div>
            <Card className={classes.root}>
                <Header />
                <RenderByWalletState />
            </Card>
            <AlertBar
                openAlert={openAlert}
                message={alertMessage}
                severity={alertSeverity}
                onClose={onAlertBarClose}
            />
        </div>
    );
};

export default YubikeyPage;