////////////////////////
// Module Imports
/////////////////////////

import React, { useState, useEffect } from 'react';
import { LedgerAccount } from '@stardust-collective/dag4-ledger';
import { makeStyles } from '@material-ui/core/styles';
import YubikeyBridgeUtil from '../../utils/yubikey/yubikeyBridge.util';
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

import ConnectView, { ConnectYubikeyView } from './views/connect';
import FetchingProgressView from './views/fetchingProgress';
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

/////////////////////////
// Types
/////////////////////////

import { getWalletController } from 'utils/controllersUtils';

/////////////////////////
// Constants
/////////////////////////

// Strings
const ROUTES = {
    SIGN_TRANSACTION: 'signTransaction',
    SIGN_MESSAGE: 'signMessage',
  };
  
  const YUBIKEY_ERROR_STRINGS = {
    INVLAID_DEVICE_ID: 'Invalid device ID',
    CANNOT_READ_PROPERTIES: 'Cannot read properties of undefined',
    INVALID_HEX_STRING: 'Invalid hex string',
    TIMEOUT: 'Timeout Error',
    BLOCKED: 'USER IS BLOCKING',
    BUSY: 'USER IS BUSY',
    REJECTED: 'REJECTED',
    ERROR_CODE_ZERO: '0',
  };
  const ALERT_MESSAGES_STRINGS = {
    DEFAULT: 'Error: Please contact support.',
    TIMEOUT: 'Error: Timeout, please, try again',
    INVLAID_DEVICE_ID: 'Error: Please input a valid device ID.',
    REJECTED: 'Error: Request has been rejected by user.',
    BUSY: 'Error: There is a pending request on device, please, cancel it',
    BLOCKED: 'Error: "Allow connect" toggle on the device is switched OFF',
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
    FETCHING,
    FETCHING_PAGE,
    VIEW_ACCOUNTS,
    SENDING,
    SUCCESS,
    SIGN,
    YUBIKEY_SIGNIN,
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
  const [waitingMessage, setWaitingMessage] = useState<string>('Waiting For Yubikey');
  const [message, setMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');
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

  const getAccountData = async () => {
    try {
      const accountData = await YubikeyBridgeUtil.getAccountData();
      setAccountData(accountData);
      setWalletState(WALLET_STATE_ENUM.VIEW_ACCOUNTS);
    } catch (error: any) {
      console.log('error', error);
      setWalletState(WALLET_STATE_ENUM.LOCKED);
      showAlert(error);
    }
  };

  const showAlert = (error: string): void => {
    console.log('Error: ' + error);
    let errorMessage = ALERT_MESSAGES_STRINGS.DEFAULT;
    let errorSeverity = ALERT_SEVERITY_STATE.ERROR;

    if (error.includes(YUBIKEY_ERROR_STRINGS.INVALID_HEX_STRING)) {
      errorMessage = ALERT_MESSAGES_STRINGS.INVLAID_DEVICE_ID;
    } else if (
      error.includes(YUBIKEY_ERROR_STRINGS.INVLAID_DEVICE_ID) ||
      error.includes(YUBIKEY_ERROR_STRINGS.CANNOT_READ_PROPERTIES)
    ) {
      errorMessage = ALERT_MESSAGES_STRINGS.INVLAID_DEVICE_ID;
    } else if (
      error.includes(YUBIKEY_ERROR_STRINGS.REJECTED) ||
      error.includes(YUBIKEY_ERROR_STRINGS.ERROR_CODE_ZERO)
    ) {
      errorMessage = ALERT_MESSAGES_STRINGS.REJECTED;
    } else if (error.includes(YUBIKEY_ERROR_STRINGS.TIMEOUT)) {
      errorMessage = ALERT_MESSAGES_STRINGS.TIMEOUT;
    } else if (error.includes(YUBIKEY_ERROR_STRINGS.BUSY)) {
      errorMessage = ALERT_MESSAGES_STRINGS.BUSY;
    } else if (error.includes(YUBIKEY_ERROR_STRINGS.BLOCKED)) {
      errorMessage = ALERT_MESSAGES_STRINGS.BLOCKED;
    }

    setAlertSeverity(errorSeverity);
    setAlertMessage(errorMessage);
    setOpenAlert(true);
  };

  const onConnectError = (error: string) => {
    showAlert(error);
  };

  const onConnectClick = async (deviceId: string) => {
    try {
      setCode('');
      setWalletState(WALLET_STATE_ENUM.YUBIKEY_SIGNIN);
      setDeviceId(deviceId);
      await YubikeyBridgeUtil.requestPermissions(deviceId, setMessage, setCode);
      await getAccountData();
    } catch (exc: any) {
      showAlert(exc.message || exc.toString());
      setWalletState(WALLET_STATE_ENUM.LOCKED);
      YubikeyBridgeUtil.closeConnection();
    }
  };

  const onAlertBarClose = () => {
    setOpenAlert(false);
  };

  const onImportClick = async () => {
    if (!selectedAccount) return;

    setWaitingForYubikey(true);

    await walletController.importHardwareWalletAccounts(
      [selectedAccount] as any,
      deviceId as string
    );

    setWalletState(WALLET_STATE_ENUM.SUCCESS);
    setWaitingForYubikey(false);
    YubikeyBridgeUtil.closeConnection();
  };

  const onSignMessagePress = async () => {
    const { data } = queryString.parse(location.search) as any;

    const jsonData = JSON.parse(data);
    const message = jsonData.signatureRequestEncoded;

    try {
      setWaitingForYubikey(true);
      setCode('');
      await YubikeyBridgeUtil.requestPermissions(
        deviceId as string,
        (message : any) => {
          setWaitingMessage(message);
        },
        setCode
      );
      const signature = await YubikeyBridgeUtil.signMessage(message);
      console.log('signature', signature);
      YubikeyBridgeUtil.closeConnection();
      window.close();
    } catch (error: any) {
      showAlert(error.message || error.toString());
      setWaitingForYubikey(false);
      YubikeyBridgeUtil.closeConnection();
    }
  };

  const onCancelClick = () => {
    YubikeyBridgeUtil.closeConnection();
    setWalletState(WALLET_STATE_ENUM.LOCKED);
  };

  const onSignPress = async () => {
    const { amount, from, to, fee } = queryString.parse(location.search) as any;

    try {
      setWaitingForYubikey(true);
      setCode('');
      await YubikeyBridgeUtil.requestPermissions(
        deviceId as string,
        (message : any) => {
          setWaitingMessage(message);
        },
        setCode
      );
      const signedTX = await YubikeyBridgeUtil.buildTransaction(amount, from, to, fee);
      const hash = await dag4.account.networkInstance.postTransaction(signedTX);
      console.log('tx hash', hash);
      setWaitingForYubikey(false);
      setTransactionSigned(true);
      YubikeyBridgeUtil.closeConnection();
    } catch (error: any) {
      showAlert(error.message || error.toString());
      setWaitingForYubikey(false);
      YubikeyBridgeUtil.closeConnection();
    }
  };

  const onCheckboxChange = (account: LedgerAccount, checked: boolean, key: number) => {
    // Handle checkbox change logic here
    console.log(`Checkbox for account ${account.address} at index ${key} changed to ${checked}`);
  };


  function RenderByWalletState() {
    if (walletState === WALLET_STATE_ENUM.YUBIKEY_SIGNIN) {
      return (
        <>
          <ConnectYubikeyView
            message={message}
            error={error}
            code={code}
            onBack={() => setWalletState(WALLET_STATE_ENUM.LOCKED)}
          />
        </>
      );
    } else if (walletState === WALLET_STATE_ENUM.LOCKED) {
      return (
        <>
          <ConnectView onConnectClick={onConnectClick} onConnectError={onConnectError} />
        </>
      );
    } else if (walletState === WALLET_STATE_ENUM.FETCHING) {
      return (
        <>
          <FetchingProgressView accountsLoadProgress={0} />
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
    } else if (walletState === WALLET_STATE_ENUM.SUCCESS) {
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
            code={code}
            amount={amount}
            fee={fee}
            deviceId={deviceId as string}
            fromAddress={from}
            toAddress={to}
            waiting={waitingForYubikey}
            onSignPress={onSignPress}
            transactionSigned={transactionSigned}
            waitingMessage={waitingMessage}
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
            code={code}
            waitingMessage={waitingMessage}
            walletLabel={parsedData.walletLabel}
            deviceId={deviceId}
            message={message}
            waiting={waitingForYubikey}
            onSignMessagePress={onSignMessagePress}
            messageSigned={transactionSigned}
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