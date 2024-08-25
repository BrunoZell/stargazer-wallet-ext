import { dag4 } from '@stardust-collective/dag4';
import { DAG_NETWORK } from 'constants/index';
import store from 'state/store';

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
      chrome.runtime.sendNativeMessage('com.constellation.yubikey', message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve(response);
        }
      });
    });
  }

  static async requestPermissions(deviceId: string, setMessage: Function, setCode: Function) {
    const message = {
      command: 'requestPermissions',
      deviceId,
    };

    // Set the message and code before sending the native message
    setMessage('Requesting permissions...');
    setCode(100); // Example code, adjust as needed

    try {
      const response = await this.sendNativeMessage(message);
      setMessage('Permissions granted.');
      setCode(200); // Example code, adjust as needed
      return response;
    } catch (error) {
      setMessage(`Error: ${error}`);
      setCode(500); // Example code, adjust as needed
      throw error;
    }
  }

  static async getAccountData() {
    const message = {
      command: 'getAccountData',
    };
    return this.sendNativeMessage(message);
  }

  static async signMessage(message: string) {
    const jsonMessage = {
      command: 'signMessage',
      message,
    };
    return this.sendNativeMessage(jsonMessage);
  }

  static async buildTransaction(amount: string, from: string, to: string, fee: string) {
    const message = {
      command: 'buildTransaction',
      amount,
      from,
      to,
      fee,
    };
    return this.sendNativeMessage(message);
  }

  static closeConnection() {
    const message = {
      command: 'closeConnection',
    };
    return this.sendNativeMessage(message);
  }
}

export default YubikeyBridgeUtil;