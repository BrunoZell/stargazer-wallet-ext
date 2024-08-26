/////////////////////////
// Module Imports
/////////////////////////

import React from 'react';
import { withStyles } from '@material-ui/core/styles';

/////////////////////////
// Components Imports
/////////////////////////

import Button from '@material-ui/core/Button';

/////////////////////////
// Image Imports
/////////////////////////

import YubikeyLogo from 'assets/images/yubikey_logo.png';

/////////////////////////
// Styles Imports
/////////////////////////

import styles from './styles.module.scss';

/////////////////////////
// Constants
/////////////////////////

// Properties
const BUTTON_SIZE_PROP = 'large';
const BUTTON_VARIANT_PROP = 'contained';
const BUTTON_COLOR_PROP = 'primary';
const BUTTON_CUSTOM_COLOR_PROP = '#521e8a';
// Strings
const CONNECT_TO_LEDGER_STRING = 'Connect to Yubikey';
// Numbers
const YUBIKEY_LOGO_WIDTH = 120;
const YUBIKEY_LOGO_HEIGHT = 120;

/////////////////////////
// Interface
/////////////////////////

interface IConnectProps {
  onConnectClick: () => void;
  onConnectError: (error: string) => void;
}

/////////////////////////
// Component
/////////////////////////

function Connect(props: IConnectProps) {
  /////////////////////////
  // Callbacks
  /////////////////////////

  const onClick = () => {
    try {
      if (props.onConnectClick) {
        props.onConnectClick();
      }
    } catch (exc: any) {
      if (props.onConnectError) {
        props.onConnectError(JSON.stringify(exc.message || exc));
      }
    }
  };

  /////////////////////////
  // Renders
  /////////////////////////

  const BlueButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(BUTTON_CUSTOM_COLOR_PROP),
      backgroundColor: BUTTON_CUSTOM_COLOR_PROP,
      '&:hover': {
        backgroundColor: BUTTON_CUSTOM_COLOR_PROP,
      },
    },
  }))(Button);

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <div className={styles.connect}>
          <div className={styles.logo} style={{ marginBottom: '35px' }}>
            <img
              src={YubikeyLogo}
              alt="yubikey_logo"
              width={YUBIKEY_LOGO_WIDTH}
              height={YUBIKEY_LOGO_HEIGHT}
            />
          </div>
          <div className={styles.instructions}>
            <span className={styles.text}>
              1. Make sure the Yubikey Bridge and the gpg command line tool is installed on your computer.
              <br />
              2. Connect your Yubikey via USB
              <br />
              3. Click "Connect to Yubikey" button.
            </span>
          </div>
        </div>
        <div>
          <BlueButton
            style={{ textTransform: 'none' }}
            onClick={onClick}
            className={styles.button}
            size={BUTTON_SIZE_PROP}
            variant={BUTTON_VARIANT_PROP}
            color={BUTTON_COLOR_PROP}
          >
            {CONNECT_TO_LEDGER_STRING}
          </BlueButton>
        </div>
      </div>
    </div>
  );
}

export default Connect;
