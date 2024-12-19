import { chainsSupported, GROUP_SLUG, STORAGE_KEY, URL_PASSKEY } from 'lib/constants'
import { decodeBase64, encodeBase64, isObject } from 'lib/function'
import { I_TYPE_URL, WalletProvider } from 'lib/web3/type'
import { isMobile } from 'react-device-detect'

class MyCustomWalletProvider implements WalletProvider {
  name: string
  icon: string
  uuid: string
  version: string
  private permissions: Record<string, boolean> = {}
  private accounts: string[] = []
  private chainId: string = '0x1' // Ethereum Mainnet
  private currentPopup: Window | null = null // Track the currently opened popup
  constructor () {
    this.name = 'MyCustomWallet'
    this.icon = 'https://example.com/my-wallet-icon.png'
    this.uuid = '123e4567-e89b-12d3-a456-426614174000' // UUID duy nhất
    this.version = '1.0.0'
    this.init()
  }

  private async init () {
    try {
      if (this.accounts.length === 0) {
        const accountPasskey = localStorage.getItem(STORAGE_KEY.ACCOUNT_PASSKEY)
        if (accountPasskey) {
          const accountPasskeyParse = JSON.parse(accountPasskey)
          this.accounts = [accountPasskeyParse.address]
          this.chainId = accountPasskeyParse.chainId || this.chainId
          this.triggerEvent('accountsChanged', this.accounts)
          this.triggerEvent('chainChanged', this.chainId)
        }
      }
    } catch (error) {
      console.log('🚀 ~ init ~ error:', error)
    }
  }

  async request ({ method, params = [] }: { method: string; params?: any[] }): Promise<any> {
    console.log('🚀 ~ MyCustomWalletProvider ~ request ~ method:', method)
    console.log('🚀 ~ request ~ params:', params)

    switch (method) {
      case 'wallet_requestPermissions':
        return this.requestPermissions(params)
      case 'eth_requestAccounts':
        return this.enable()
      case 'eth_accounts':
        return this.getAccounts()
      case 'eth_chainId':
        return this.getChainId()
      case 'net_version':
        return Number(this.chainId.toString())
      case 'eth_sendTransaction':
        return this.sendTransaction(params)
      case 'eth_sign':
        return this.signMessage(params)
      case 'personal_sign':
        return this.personalSign(params)
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        return this.signTypedData(params)
      case 'eth_subscribe':
        return this.subscribe(params)
      case 'eth_unsubscribe':
        return this.unsubscribe(params)
      case 'wallet_switchEthereumChain':
        return this.switchEthereumChain(params)
      case 'wallet_addEthereumChain':
        return this.addEthereumChain(params)
      case 'eth_estimateGas':
        return this.estimateGas(params)
      case 'eth_gasPrice':
        return this.getGasPrice()
      case 'eth_blockNumber':
        return this.getBlockNumber()
      case 'eth_getBalance':
        return this.getBalance(params)
      case 'eth_getTransactionByHash':
        return this.getTransactionByHash(params)
      case 'eth_getTransactionReceipt':
        return this.getTransactionReceipt(params)
      case 'disconnect':
      case 'wallet_revokePermissions':
        return this.disconnect()
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  private async requestPermissions (params: any[]): Promise<any> {
    // Define supported permissions
    const supportedPermissions = ['eth_accounts', 'eth_chainId']

    // Validate requested permissions
    const requestedPermissions = params[0]?.permissions || (params?.length > 0 && params?.map(obj => Object.keys(obj)[0])) || []
    const invalidPermissions = requestedPermissions.filter(
      (perm: string) => !supportedPermissions.includes(perm),
    )

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Unsupported permissions requested: ${invalidPermissions.join(', ')}`,
      )
    }

    // Simulate user approval (replace with actual UI prompt for production)
    const grantedPermissions = requestedPermissions.reduce(
      (acc: Record<string, boolean>, perm: string) => {
        acc[perm] = true
        return acc
      },
      {},
    )

    // Persist granted permissions
    this.permissions = { ...this.permissions, ...grantedPermissions }
    localStorage.setItem(
      STORAGE_KEY.PERMISSIONS_PASSKEY,
      JSON.stringify(this.permissions),
    )

    return {
      permissions: this.permissions,
    }
  }

  // Add a method to retrieve current permissions
  getPermissions (): Record<string, boolean> {
    return this.permissions
  }

  getUrl (type?:I_TYPE_URL): string {
    switch (type) {
      case 'SEND_TRANSACTION':
      case 'PERSONAL_SIGN':
        return `${URL_PASSKEY}/${GROUP_SLUG}/mypage/${this.accounts[0]}`
      default:
        return `${URL_PASSKEY}/activate-by-passkey/${GROUP_SLUG}`
    }
  }

  getFavicon () {
    const link = document.querySelector("link[rel~='icon']")
    return link ? (link as HTMLLinkElement).href : '/favicon.ico' // Trả về favicon mặc định nếu không tìm thấy
  };

  openPopup (type?:I_TYPE_URL, query?:{[key:string]:any}): Promise<any> {
    const infoPageConnected = {
      site: window.location.origin,
      icon: this.getFavicon(),
      timeStamp: Date.now(),
      expiry: Date.now() + 1000 * 60 * 5, // 5 minutes

    }
    const url = this.getUrl(type)

    const width = 470
    const height = 800
    let left = window.innerWidth / 2 - width / 2 + window.screenX
    let top = window.innerHeight / 2 - height / 2 + window.screenY

    if (isObject(query, true)) {
      query = { ...query, infoPageConnected, id: crypto.randomUUID() }
    }

    const encodedQuery = encodeBase64(query)
    let urlWithQuery = ''
    switch (type) {
      case 'SEND_TRANSACTION':
        urlWithQuery = `${url}?raw-transaction=${encodedQuery}`
        left = 0
        top = 0
        break
      case 'PERSONAL_SIGN':
        urlWithQuery = `${url}?sign-message=${encodedQuery}`
        left = 0
        top = 0
        break
      default:
        urlWithQuery = ''
        break
    }

    const urlFinal = encodedQuery ? urlWithQuery : url

    if (this.currentPopup && !this.currentPopup.closed && isMobile) {
      this.currentPopup.close()
    }

    const popup = window.open(
      urlFinal,
      `${GROUP_SLUG}`,
      `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=${width},height=${height},top=${top},left=${left}`,
    )

    if (!popup) {
      return Promise.reject(new Error('Popup could not be opened'))
    }

    if (isMobile) {
      this.currentPopup = popup
    }

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval)
          reject(new Error('Popup closed before completing authentication'))
        }
      }, 1000)

      window.addEventListener('message', function onMessage (event) {
        // Kiểm tra nguồn dữ liệu nếu cần

        if (event.origin !== new URL(URL_PASSKEY).origin) {
          return
        }

        if (event?.data) {
          clearInterval(interval)
          window.removeEventListener('message', onMessage)
          resolve({ data: event.data }) // Payload chứa dữ liệu từ popup
          const closePopupAfterDone = event?.data?.closePopupAfterDone
          if (isMobile || closePopupAfterDone) {
            popup.close()
          }
        }
      })
    })
  }

  private async enable (): Promise<string[]> {
    try {
      const { data } = await this.openPopup()

      // Xử lý kết quả trả về từ popup
      this.accounts = [data.addressPasskey] // Giả sử popup trả về thông tin account

      localStorage.setItem(STORAGE_KEY.ACCOUNT_PASSKEY, JSON.stringify({ address: this.accounts[0], chainId: this.chainId }))

      this.triggerEvent('accountsChanged', this.accounts)
      return this.accounts
    } catch (error) {
      console.error('Error during enable:', error)
      throw error
    }
  }

  private async disconnect (): Promise<void> {
    console.log('🚀 ~ disconnect ~ disconnect:')
    this.accounts = []
    localStorage.removeItem(STORAGE_KEY.ACCOUNT_PASSKEY)
    localStorage.removeItem(STORAGE_KEY.PERMISSIONS_PASSKEY)
    this.triggerEvent('accountsChanged', [])
    console.log('Wallet disconnected.')
  }

  private async getAccounts (): Promise<string[]> {
    return this.accounts
  }

  private async getChainId (): Promise<string> {
    return this.chainId
  }

  private async sendTransaction (params: any[]): Promise<string|undefined> {
    const tx = params[0]

    if (!tx.chainId) {
      tx.chainId = this.chainId
    }

    const { data } = await this.openPopup('SEND_TRANSACTION', { transaction: tx })

    if (data.type === 'ERROR_TRANSACTION') {
      throw new Error(data.payload?.message || 'Error send transaction')
    }
    if (data.type === 'SEND_TRANSACTION') {
      return data?.payload?.hash
    }
  }

  private async signMessage (params: any[]): Promise<string> {
  // const [address, message] = params
    // return '0xSignedMessage'

    throw new Error('Unsupported method signMessage')
  }

  private async personalSign (params: any[]): Promise<string|undefined> {
    const { data } = await this.openPopup('PERSONAL_SIGN', {
      chainId: this.chainId,
      message: params[0],
      account: params[1],
    })
    if (data.type === 'ERROR_TRANSACTION') {
      throw new Error(data?.payload?.message || 'Error sign message')
    }
    if (data.type === 'PERSONAL_SIGN') {
      return data?.payload?.signature
    }
  }

  private async signTypedData (params: any[]): Promise<string> {
    // const [address, typedData] = params
    // return '0xTypedDataSignature'
    throw new Error('Unsupported method signTypedData')
  }

  private async subscribe (params: any[]): Promise<string> {
    // return 'subscriptionId'
    throw new Error('Unsupported method subscribe')
  }

  private async unsubscribe (params: any[]): Promise<boolean> {
    // return true
    throw new Error('Unsupported method unsubscribe')
  }

  private async switchEthereumChain (params: any[]): Promise<void> {
    const chainId = params[0].chainId

    if (!chainsSupported.includes(chainId)) {
      throw new Error(`Unsupported chainId: ${chainId}`)
    }

    this.chainId = chainId
    localStorage.setItem(STORAGE_KEY.ACCOUNT_PASSKEY, JSON.stringify({ address: this.accounts[0], chainId }))

    // Kích hoạt sự kiện chainChanged
    this.triggerEvent('chainChanged', chainId)
  }

  private async addEthereumChain (params: any[]): Promise<void> {
    // console.log('Adding Ethereum chain:', params)
    throw new Error('Unsupported method addEthereumChain')
  }

  private async estimateGas (params: any[]): Promise<string> {
    return '0x0'
  }

  private async getGasPrice (): Promise<string> {
    // return '0x3B9ACA00' // 1 Gwei
    // throw new Error('Unsupported method getBlockNumber')
    return '0x0'
  }

  private async getBlockNumber (): Promise<string> {
    // return '0x10d4f' // Block number dưới dạng hex
    throw new Error('Unsupported method getBlockNumber')
  }

  private async getBalance (params: any[]): Promise<string> {
    const [address] = params
    // return '0xDE0B6B3A7640000' // 1 ETH
    throw new Error('Unsupported method getBalance')
  }

  private async getTransactionByHash (params: any[]): Promise<any> {
    // const [txHash] = params
    // return { hash: txHash, status: 'pending' } // Mô phỏng
    throw new Error('Unsupported method getTransactionByHash')
  }

  private async getTransactionReceipt (params: any[]): Promise<any> {
    // const [txHash] = params
    // return { hash: txHash, status: 'success' } // Mô phỏng

    throw new Error('Unsupported method getTransactionReceipt')
  }

  // Quản lý sự kiện
  on (event: string, handler: (...args: any[]) => void): void {
    window.addEventListener(event, (e: Event) => handler((e as CustomEvent).detail))
  }

  off (event: string, handler: (...args: any[]) => void): void {
    window.removeEventListener(event, handler)
  }

  private triggerEvent (event: string, detail: any): void {
    const customEvent = new CustomEvent(event, { detail })
    window.dispatchEvent(customEvent)
  }
}

const isWeb3Injected = () => {
  return typeof window !== 'undefined' && typeof window?.ethereum !== 'undefined'
}

export { MyCustomWalletProvider, isWeb3Injected }
