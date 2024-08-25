import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import styles from './yubikeyStyles.module.scss';
import YubikeyUserGuide from 'assets/images/bitfi-user-guide.png';

const BUTTON_SIZE_PROP = 'large';
const BUTTON_VARIANT_PROP = 'contained';
const BUTTON_COLOR_PROP = 'primary';
const BUTTON_CUSTOM_COLOR_PROP = '#521e8a';
const YUBIKEY_USER_GUIDE_WIDTH = 360;
const YUBIKEY_USER_GUIDE_HEIGHT = 130;

interface IConnectProps {
  error: string;
  onBack: () => void;
}

function ConnectYubikeyView({ onBack, error }: IConnectProps) {
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
        <div style={{ marginTop: '0px', marginBottom: '50px' }}>
          <img
            src={YubikeyUserGuide}
            alt="yubikey_user_guide"
            width={YUBIKEY_USER_GUIDE_WIDTH}
            height={YUBIKEY_USER_GUIDE_HEIGHT}
          />
        </div>
        {error}
        <div className={styles.footer}>
          <BlueButton
            style={{ textTransform: 'none' }}
            onClick={onBack}
            className={styles.button}
            size={BUTTON_SIZE_PROP}
            variant={BUTTON_VARIANT_PROP}
            color={BUTTON_COLOR_PROP}
          >
            Back
          </BlueButton>
        </div>
      </div>
    </div>
  );
}

export default ConnectYubikeyView;
