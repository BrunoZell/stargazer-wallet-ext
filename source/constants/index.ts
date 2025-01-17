import {
  AvalancheChainId,
  AvalancheChainValue,
  BSCChainId,
  BSCChainValue,
  EthChainId,
  EthChainValue,
  PolygonChainId,
  PolygonChainValue,
} from 'scripts/Background/controllers/EVMChainController/types';
import { StargazerChain } from 'scripts/common';
import {
  isProd,
  isNative,
  COINGECKO_API_KEY,
  STARGAZER_PROVIDERS_BASE_URL,
  STARGAZER_PROVIDERS_BASE_URL_PROD,
  QUICKNODE_ETHEREUM_MAINNET,
  QUICKNODE_ETHEREUM_SEPOLIA,
  QUICKNODE_AVALANCHE_MAINNET,
  QUICKNODE_AVALANCHE_TESTNET,
  QUICKNODE_BSC_MAINNET,
  QUICKNODE_BSC_TESTNET,
  QUICKNODE_POLYGON_MAINNET,
  QUICKNODE_POLYGON_TESTNET,
} from 'utils/envUtil';

export const STORE_PORT = 'STARGAZER';

export const STARGAZER_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/stargazer.png';
export const CONSTELLATION_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/dag.png';
export const CONSTELLATION_DEFAULT_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/dag-default.png';
export const DOR_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/dor.png';
export const ELPACA_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/elpaca.png';
export const ETHEREUM_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/eth.png';
export const ETHEREUM_DEFAULT_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/eth-default.png';
export const AVALANCHE_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/avax.png';
export const AVALANCHE_DEFAULT_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/avax-default.png';
export const BSC_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/bsc.png';
export const BSC_DEFAULT_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/bsc-default.png';
export const POLYGON_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/polygon.png';
export const POLYGON_DEFAULT_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/polygon-default.png';
export const LATTICE_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/ltx.png';
export const VE_LTX_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/veltx.png';
export const DODI_LOGO = 'https://lattice-exchange-assets.s3.amazonaws.com/dodi-logo.png';
export const LEET_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/leet.png';
export const ALKIMI_LOGO =
  'https://assets.coingecko.com/coins/images/17979/small/alkimi.PNG';
export const JENNYCO_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/jco.png';
export const GEOJAM_LOGO = 'https://lattice-exchange-assets.s3.amazonaws.com/geojam.png';
export const SIMPLEX_LOGO =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/simplex-logo.png';
export const PLACEHOLDER_IMAGE =
  'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/placeholder.png';

export const DAG_NETWORK: {
  [networkId: string]: {
    id: string;
    label: string;
    version: string;
    testnet: boolean;
    explorer: string;
    chainId: number;
    hexChainId: string;
    logo: string;
    network: string;
    config: {
      beUrl: string; // 1.0 and 2.0
      lbUrl?: string; // 1.0
      l0Url?: string; // 2.0
      l1Url?: string; // 2.0
    };
  };
} = {
  main2: {
    id: 'main2',
    label: 'Mainnet',
    version: '2.0',
    testnet: false,
    explorer: 'https://mainnet.dagexplorer.io',
    chainId: 1,
    hexChainId: '0x1',
    logo: CONSTELLATION_LOGO,
    network: 'Constellation',
    config: {
      beUrl: 'https://be-mainnet.constellationnetwork.io',
      l0Url: 'https://l0-lb-mainnet.constellationnetwork.io',
      l1Url: 'https://l1-lb-mainnet.constellationnetwork.io',
    },
  },
  test2: {
    id: 'test2',
    label: 'Testnet',
    version: '2.0',
    testnet: true,
    explorer: 'https://testnet.dagexplorer.io',
    chainId: 3,
    hexChainId: '0x3',
    logo: CONSTELLATION_LOGO,
    network: 'Constellation',
    config: {
      beUrl: 'https://be-testnet.constellationnetwork.io',
      l0Url: 'https://l0-lb-testnet.constellationnetwork.io',
      l1Url: 'https://l1-lb-testnet.constellationnetwork.io',
    },
  },
  integration2: {
    id: 'integration2',
    label: 'IntegrationNet',
    version: '2.0',
    testnet: true,
    explorer: 'https://integrationnet.dagexplorer.io',
    chainId: 4,
    hexChainId: '0x4',
    logo: CONSTELLATION_LOGO,
    network: 'Constellation',
    config: {
      beUrl: 'https://be-integrationnet.constellationnetwork.io',
      l0Url: 'https://l0-lb-integrationnet.constellationnetwork.io',
      l1Url: 'https://l1-lb-integrationnet.constellationnetwork.io',
    },
  },
  local2: {
    id: 'local2',
    label: 'Local',
    version: '2.0',
    testnet: true,
    explorer: '',
    chainId: 5,
    hexChainId: '0x5',
    logo: CONSTELLATION_LOGO,
    network: 'Constellation',
    config: {
      beUrl: '',
      l0Url: '',
      l1Url: '',
    },
  },
};

export const ETH_NETWORK: {
  [networkId: string]: {
    id: EthChainId;
    value: EthChainValue;
    label: string;
    explorer: string;
    chainId: number;
    hexChainId: string;
    rpcEndpoint: string;
    explorerAPI: string;
    nativeToken: string;
    mainnet: string;
    network: string;
    networkId: string;
    logo: string;
  };
} = {
  mainnet: {
    id: 'mainnet',
    value: 'homestead',
    label: 'Mainnet',
    rpcEndpoint: QUICKNODE_ETHEREUM_MAINNET,
    explorer: 'https://etherscan.io/',
    explorerAPI: 'https://api.etherscan.io',
    chainId: 1,
    hexChainId: '0x1',
    nativeToken: 'ETH',
    mainnet: 'mainnet',
    network: 'Ethereum',
    networkId: StargazerChain.ETHEREUM,
    logo: ETHEREUM_LOGO,
  },
  sepolia: {
    id: 'sepolia',
    value: 'sepolia',
    label: 'Sepolia',
    rpcEndpoint: QUICKNODE_ETHEREUM_SEPOLIA,
    explorer: 'https://sepolia.etherscan.io/',
    explorerAPI: 'https://api-sepolia.etherscan.io',
    chainId: 11155111,
    hexChainId: '0xaa36a7',
    nativeToken: 'ETH',
    mainnet: 'mainnet',
    network: 'Ethereum',
    networkId: StargazerChain.ETHEREUM,
    logo: ETHEREUM_LOGO,
  },
};

export const AVALANCHE_NETWORK: {
  [networkId: string]: {
    id: AvalancheChainId;
    value: AvalancheChainValue;
    label: string;
    explorer: string;
    chainId: number;
    hexChainId: string;
    rpcEndpoint: string;
    explorerAPI: string;
    nativeToken: string;
    mainnet: string;
    network: string;
    networkId: string;
    logo: string;
  };
} = {
  'avalanche-mainnet': {
    id: 'avalanche-mainnet',
    value: 'avalanche-mainnet',
    label: 'Avalanche C-Chain',
    rpcEndpoint: QUICKNODE_AVALANCHE_MAINNET,
    explorer: 'https://snowtrace.io/',
    explorerAPI: 'https://api.snowtrace.io',
    chainId: 43114,
    hexChainId: '0xa86a',
    nativeToken: 'AVAX',
    mainnet: 'avalanche-mainnet',
    network: 'Avalanche',
    networkId: StargazerChain.AVALANCHE,
    logo: AVALANCHE_LOGO,
  },
  'avalanche-testnet': {
    id: 'avalanche-testnet',
    value: 'avalanche-testnet',
    label: 'Fuji Testnet',
    rpcEndpoint: QUICKNODE_AVALANCHE_TESTNET,
    explorer: 'https://testnet.snowtrace.io/',
    explorerAPI: 'https://api-testnet.snowtrace.io',
    chainId: 43113,
    hexChainId: '0xa869',
    nativeToken: 'AVAX',
    mainnet: 'avalanche-mainnet',
    network: 'Avalanche',
    networkId: StargazerChain.AVALANCHE,
    logo: AVALANCHE_LOGO,
  },
};

export const BSC_NETWORK: {
  [networkId: string]: {
    id: BSCChainId;
    value: BSCChainValue;
    label: string;
    explorer: string;
    chainId: number;
    hexChainId: string;
    rpcEndpoint: string;
    explorerAPI: string;
    nativeToken: string;
    mainnet: string;
    network: string;
    networkId: string;
    logo: string;
  };
} = {
  bsc: {
    id: 'bsc',
    value: 'bsc',
    label: 'BSC Mainnet',
    rpcEndpoint: QUICKNODE_BSC_MAINNET,
    explorer: 'https://bscscan.com/',
    explorerAPI: 'https://api.bscscan.com',
    chainId: 56,
    hexChainId: '0x38',
    nativeToken: 'BNB',
    mainnet: 'bsc',
    network: 'BSC',
    networkId: StargazerChain.BSC,
    logo: BSC_LOGO,
  },
  'bsc-testnet': {
    id: 'bsc-testnet',
    value: 'bsc-testnet',
    label: 'BSC Testnet',
    rpcEndpoint: QUICKNODE_BSC_TESTNET,
    explorer: 'https://testnet.bscscan.com/',
    explorerAPI: 'https://api-testnet.bscscan.com',
    chainId: 97,
    hexChainId: '0x61',
    nativeToken: 'BNB',
    mainnet: 'bsc',
    network: 'BSC',
    networkId: StargazerChain.BSC,
    logo: BSC_LOGO,
  },
};

export const POLYGON_NETWORK: {
  [networkId: string]: {
    id: PolygonChainId;
    value: PolygonChainValue;
    label: string;
    explorer: string;
    chainId: number;
    hexChainId: string;
    rpcEndpoint: string;
    explorerAPI: string;
    nativeToken: string;
    mainnet: string;
    network: string;
    networkId: string;
    logo: string;
  };
} = {
  matic: {
    id: 'matic',
    value: 'matic',
    label: 'Polygon Mainnet',
    rpcEndpoint: QUICKNODE_POLYGON_MAINNET,
    explorer: 'https://polygonscan.com/',
    explorerAPI: 'https://api.polygonscan.com',
    chainId: 137,
    hexChainId: '0x89',
    nativeToken: 'MATIC',
    mainnet: 'matic',
    network: 'Polygon',
    networkId: StargazerChain.POLYGON,
    logo: POLYGON_LOGO,
  },
  amoy: {
    id: 'amoy',
    value: 'amoy',
    label: 'Polygon Amoy Testnet',
    rpcEndpoint: QUICKNODE_POLYGON_TESTNET,
    explorer: 'https://amoy.polygonscan.com/',
    explorerAPI: 'https://api-amoy.polygonscan.com',
    chainId: 80002,
    hexChainId: '0x13882',
    nativeToken: 'MATIC',
    mainnet: 'matic',
    network: 'Polygon',
    networkId: StargazerChain.POLYGON,
    logo: POLYGON_LOGO,
  },
};

export const ALL_MAINNET_CHAINS = [
  DAG_NETWORK.main2,
  ETH_NETWORK.mainnet,
  AVALANCHE_NETWORK['avalanche-mainnet'],
  BSC_NETWORK.bsc,
  POLYGON_NETWORK.matic,
];

export const ALL_TESTNETS_CHAINS = [
  DAG_NETWORK.test2,
  DAG_NETWORK.integration2,
  DAG_NETWORK.local2,
  ETH_NETWORK.sepolia,
  AVALANCHE_NETWORK['avalanche-testnet'],
  BSC_NETWORK['bsc-testnet'],
  POLYGON_NETWORK.amoy,
];

export const ALL_CHAINS = [...ALL_MAINNET_CHAINS, ...ALL_TESTNETS_CHAINS];

export const ALL_EVM_CHAINS = {
  ...ETH_NETWORK,
  ...AVALANCHE_NETWORK,
  ...BSC_NETWORK,
  ...POLYGON_NETWORK,
};

export const SUPPORTED_HEX_CHAINS = [
  '0x1',
  '0xaa36a7',
  '0xa86a',
  '0xa869',
  '0x89',
  '0x13882',
  '0x38',
  '0x61',
];

export const ASSET_PRICE_API = 'https://pro-api.coingecko.com/api/v3/simple/price';
export const TOKEN_INFO_API = 'https://pro-api.coingecko.com/api/v3/coins';
export const ERC20_TOKENS_API =
  'https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=ethereum-ecosystem';
export const ERC20_TOKENS_WITH_ADDRESS_API =
  'https://pro-api.coingecko.com/api/v3/coins/list?include_platform=true';
export const SEARCH_API = 'https://pro-api.coingecko.com/api/v3/search?query=';
export const COINGECKO_API_KEY_PARAM = `x_cg_pro_api_key=${COINGECKO_API_KEY}`;
export const OPENSEA_API_V2 = 'https://api.opensea.io/api/v2';
export const OPENSEA_API_TESTNETS_V2 = 'https://testnets-api.opensea.io/api/v2';

export const PRICE_DAG_ID = 'constellation-labs';
export const PRICE_BTC_ID = 'bitcoin';
export const PRICE_ETH_ID = 'ethereum';

export const LATTICE_ASSET = '0xa393473d64d2F9F026B60b6Df7859A689715d092';

export const ETH_PREFIX = '0X-';

export const DEFAULT_CURRENCY = {
  id: 'usd',
  symbol: '$',
  name: 'USD',
};

export const DEFAULT_LANGUAGE = 'en-US';

export const URL_REGEX_PATTERN = '^(https?|ftp)://';

export const DAG_EXPLORER_API_URL = 'https://dyzt5u1o3ld0z.cloudfront.net';

export const BUY_DAG_URL = 'https://howtobuydag.com/';
const PROVIDERS_BASE_URL = isProd
  ? STARGAZER_PROVIDERS_BASE_URL_PROD
  : STARGAZER_PROVIDERS_BASE_URL;

export const GET_QUOTE_API = `${PROVIDERS_BASE_URL}/quote`;
export const PAYMENT_REQUEST_API = `${PROVIDERS_BASE_URL}/payment-request`;
export const GET_SUPPORTED_ASSETS_API = `${PROVIDERS_BASE_URL}/v2/supported-assets`;
const SIMPLEX_FORM_BASE_URL = 'https://stargazer-assets.s3.us-east-2.amazonaws.com';
const SIMPLEX_FORM_SUBMISSION_URL_WEB = isProd
  ? `${SIMPLEX_FORM_BASE_URL}/stargazer-simplex.web.html?payment_id=`
  : `${SIMPLEX_FORM_BASE_URL}/stargazer-simplex.web.staging.html?payment_id=`;
const SIMPLEX_FORM_SUBMISSION_URL_NATIVE = isProd
  ? `${SIMPLEX_FORM_BASE_URL}/stargazer-simplex.html?payment_id=`
  : `${SIMPLEX_FORM_BASE_URL}/stargazer-simplex.staging.html?payment_id=`;
export const SIMPLEX_FORM_SUBMISSION_URL = isNative
  ? SIMPLEX_FORM_SUBMISSION_URL_NATIVE
  : SIMPLEX_FORM_SUBMISSION_URL_WEB;
