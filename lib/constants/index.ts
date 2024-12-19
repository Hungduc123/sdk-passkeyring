const uuidSdk = '23e4567-e89b-12d3-a456-426614174000'
const rdnsSdk = 'co.bacoor.keyring'

export const infoGroup = {
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
  bacoorpasskeywallet: {
    uuid: uuidSdk,
    name: 'Bacoor Passkey Wallet',
    icon: 'https://ipfs.pantograph.app/ipfs/QmUN2o25Bhf7nLdHRU6wivFLN7dTZCjuuMGszSdSy7TRHh?filename=bacoorem-fix-noti.png',
    rdns: rdnsSdk,
  },
  passkeywallet: {
    uuid: uuidSdk,
    name: 'KEYRING SMART',
    icon: 'https://ipfs.pantograph.app/ipfs/QmWdV4p9FvAUKEnGHefwsYxUrtY8qyEX61xbHdGXworS8k?filename=icon%20NOTI.png',
    rdns: rdnsSdk,
  },

}

export const GROUP_SLUG = 'egglegamewallet'
// export const GROUP_SLUG = 'egglepasskeywallet'
// export const GROUP_SLUG = 'passkeywallet'
// export const GROUP_SLUG = 'bacoorpasskeywallet'
// export const GROUP_SLUG = 'keyringpasskeywallet'

export const STORAGE_KEY = {
  ACCOUNT_PASSKEY: 'ACCOUNT_PASSKEY_' + GROUP_SLUG,
  MODE_ENV_PASSKEY: 'MODE_ENV_PASSKEY_' + GROUP_SLUG,
  PERMISSIONS_PASSKEY: 'PERMISSIONS_PASSKEY_' + GROUP_SLUG,

}

export const chainsSupported = [
  '0x1', '0xa', '0x38', '0x89', '0xa4b1', '0x2105',
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

// export const URL_PASSKEY = getURLPasskey()
// export const URL_PASSKEY = 'http://localhost:3000'
export const URL_PASSKEY = 'https://pass.w3w.app'

export const infoWallet = { slug: GROUP_SLUG, url: URL_PASSKEY, ...infoGroup[GROUP_SLUG] }
