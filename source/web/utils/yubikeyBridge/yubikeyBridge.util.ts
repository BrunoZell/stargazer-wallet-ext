import { dag4 } from '@stardust-collective/dag4';
import { DAG_NETWORK } from 'constants/index';
import store from 'state/store';
import { TransactionV2, PostTransactionV2 } from "@stardust-collective/dag4-keystore";

class YubikeyBridgeUtil {

  /////////////////////////////
  // Constructor
  /////////////////////////////

  constructor() {
    // Initialize required dependencies
    this.initialize();
  }

  /////////////////////////////
  // Private Methods
  /////////////////////////////

  private initialize = async () => {
    // Configure Dag4 network
    const { activeNetwork } = store.getState().vault;
    const dagNetworkValue = activeNetwork.Constellation;
    dag4.account.connect(
      {
        id: DAG_NETWORK[dagNetworkValue].id,
        networkVersion: DAG_NETWORK[dagNetworkValue].version,
        ...DAG_NETWORK[dagNetworkValue].config,
      },
      false
    );
  };

  static async sendNativeMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('Sending message to Yubikey Bridge:', message);
      chrome.runtime.sendNativeMessage('com.constellation.yubikey', message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Chrome runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError.message);
        } else if (response.error) {
          console.log('Received Yubikey Bridge response:', response);
          reject('Yubikey Bridge error: ' + response.error);
        } else {
          console.log('Received Yubikey Bridge response:', response);
          resolve(response);
        }
      });
    });
  }

  static async getPublicKeyFromYubikey() {
    const ipcMessage = {
      command: 'getPublicKey',
    };
    return this.sendNativeMessage(ipcMessage);
  }

  static async signHashOnYubikey(publicKey: string, keyId: string, hash: string) {
    const ipcMessage = {
      command: 'signHash',
      publicKey,
      keyId,
      hash,
    };

    const response = await this.sendNativeMessage(ipcMessage);

    return response.signature;
  }

  // Copied from node_modules\@stardust-collective\dag4-keystore\src\key-store.ts
  static async generateSignedTransactionWithHashV2(fromPublicKey: string, fromAddress: string, toAddress: string, amount: number, fee = 0) {
    if (!fromPublicKey) {
      throw new Error('No public key set');
    }

    const lastRef = await dag4.network.getAddressLastAcceptedTransactionRef(fromAddress);
    const { tx, hash } = dag4.keyStore.prepareTx(amount, toAddress, fromAddress, lastRef, fee, '2.0');

    console.log('prepared transaction:',);
    console.log(tx);

    // Compute the GPG key id (through the SHA256 fingerprint) of the public key.
    // This routes the signature to the right key in the Yubikey.
    const publicKeyBuffer = Buffer.from(fromPublicKey, 'hex');
    const fingerprint = await crypto.subtle.digest('sha256', publicKeyBuffer);
    const fingerprintArray = new Uint8Array(fingerprint);
    const fingerprintHex = Array.from(fingerprintArray).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const gpgKeyId = fingerprintHex.slice(-16).toUpperCase(); // Last 16 characters in uppercase are the GPG key ID

    // Sign on Yubikey
    const signature = await this.signHashOnYubikey(fromPublicKey, gpgKeyId, hash);

    const uncompressedPublicKey = fromPublicKey.length === 128 ? '04' + fromPublicKey : fromPublicKey;

    const success = dag4.keyStore.verify(uncompressedPublicKey, hash, signature);

    if (!success) {
      throw new Error('Sign-Verify failed');
    }

    const signatureElt: any = {};
    signatureElt.id = uncompressedPublicKey.substring(2); //Remove 04 prefix
    signatureElt.signature = signature;

    const transaction = TransactionV2.fromPostTransaction(tx as PostTransactionV2);
    transaction.addSignature(signatureElt);

    return {
      hash,
      signedTransaction: transaction.getPostTransaction() as PostTransactionV2
    };
  }
}

export default YubikeyBridgeUtil;