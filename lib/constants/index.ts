import { SlugGroup } from 'lib/constants/type'
import { EIP6963ProviderInfo } from 'lib/function'

const uuidSdk = '23e4567-e89b-12d3-a456-426614174000'
const rdnsSdk = 'co.bacoor.keyring'

const uuidSdkDeCard = '13e4568-e89b-12d3-a456-426614174000'
const rdnsSdkDeCard = 'app.decard.wallet'

export const GROUP_SLUG: SlugGroup = 'egglepasskeywallet'
// export const GROUP_SLUG: SlugGroup = 'egglepasskeywallet'

export const infoGroup: { [key in SlugGroup]: EIP6963ProviderInfo } = {
  egglegamewallet: {
    uuid: uuidSdk,
    name: 'Eggle Gamewallet',
    icon: 'https://ipfs.pantograph.app/ipfs/QmUn7MnyA9HWfHNRG7oLTweNG93ztaErFdcg36Y2uxENUu?filename=noti.png',
    rdns: rdnsSdk,
  },
  egglepasskeywallet: {
    uuid: uuidSdk,
    name: 'EGGLE GAME WALLET',
    icon: 'https://ipfs.pantograph.app/ipfs/QmUn7MnyA9HWfHNRG7oLTweNG93ztaErFdcg36Y2uxENUu?filename=noti.png',
    rdns: rdnsSdk,
  },
  // bacoorpasskeywallet: {
  //   uuid: uuidSdk,
  //   name: 'Bacoor Passkey Wallet',
  //   icon: 'https://ipfs.pantograph.app/ipfs/QmUN2o25Bhf7nLdHRU6wivFLN7dTZCjuuMGszSdSy7TRHh?filename=bacoorem-fix-noti.png',
  //   rdns: rdnsSdk,
  // },
  // passkeywallet: {
  //   uuid: uuidSdk,
  //   name: 'KEYRING SMART',
  //   icon: 'https://ipfs.pantograph.app/ipfs/QmWdV4p9FvAUKEnGHefwsYxUrtY8qyEX61xbHdGXworS8k?filename=icon%20NOTI.png',
  //   rdns: rdnsSdk,
  // },
  keyringpasskeywallet: {
    uuid: uuidSdk,
    name: 'KEYRING SMART',
    icon: 'https://ipfs.pantograph.app/ipfs/QmWdV4p9FvAUKEnGHefwsYxUrtY8qyEX61xbHdGXworS8k?filename=icon%20NOTI.png',
    rdns: rdnsSdk,
  },
  'egglepasskeywallet-decard': {
    uuid: uuidSdkDeCard,
    name: 'DECARD EGGLE GAME WALLET',
    icon: 'https://ipfs.pantograph.app/ipfs/QmUn7MnyA9HWfHNRG7oLTweNG93ztaErFdcg36Y2uxENUu?filename=noti.png',
    rdns: rdnsSdkDeCard,
  },
}

export const STORAGE_KEY = {
  ACCOUNT_PASSKEY: 'ACCOUNT_PASSKEY_' + GROUP_SLUG,
  MODE_ENV_PASSKEY: 'MODE_ENV_PASSKEY_' + GROUP_SLUG,
  PERMISSIONS_PASSKEY: 'PERMISSIONS_PASSKEY_' + GROUP_SLUG,
}

export const chainsSupported = [
  '0x1',
  '0xa',
  '0x38',
  '0x89',
  '0xa4b1',
  '0x2105',
]

// export const URL_PASSKEY = 'https://smart.keyring.app'
// export const URL_PASSKEY = 'https://pass.w3w.app'

const getURLPasskey = () => {
  try {
    const modeEnv = localStorage.getItem(STORAGE_KEY.MODE_ENV_PASSKEY)
    if (modeEnv && modeEnv === 'development') {
      return 'https://pass.w3w.app'
    } else {
      return 'https://smart.keyring.app'
    }
  } catch (error) {
    return 'https://smart.keyring.app'
  }
}

export const URL_PASSKEY = getURLPasskey()
// export const URL_PASSKEY = 'https://pass.w3w.app'

export const RPC_DEFAULT = {
  1: 'https://cloudflare-eth.com',
  137: 'https://polygon-rpc.com',
  56: 'https://rpc.ankr.com/bsc',
  42161: 'https://arb1.arbitrum.io/rpc',
  8453: 'https://mainnet.base.org',
  10: 'https://mainnet.optimism.io',
}

export const infoWallet = {
  slug: GROUP_SLUG,
  url: URL_PASSKEY,
  ...infoGroup[GROUP_SLUG],
}
