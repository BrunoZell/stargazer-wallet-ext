// An extension of the KeyringWalletType enum to support YubikeyAccountWallet
// Original enum: https://github.com/StardustCollective/dag4.js/blob/main/packages/dag4-keyring/src/kcs.ts
// Or locally: stargazer-wallet-ext\node_modules\@stardust-collective\dag4-keyring\dist\types\kcs.d.ts
export const KeyringWalletTypeExt = {
    YubikeyAccountWallet: 'YAW',
};

// For a production build, we should amend the original KeyringWalletType in package @stardust-collective/dag4-keyring and import it like this:
//import { KeyringWalletType } from '@stardust-collective/dag4-keyring';
