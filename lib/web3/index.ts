import { GROUP_SLUG, STORAGE_KEY, URL_PASSKEY } from 'lib/constants'
import { decodeBase64, encodeBase64 } from 'lib/function'
import { I_TYPE_URL, WalletProvider } from 'lib/web3/type'

class MyCustomWalletProvider implements WalletProvider {
  name: string
  icon: string
  uuid: string
  version: string
  private accounts: string[] = []
  private chainId: string = '0x1' // Ethereum Mainnet
  constructor () {
    this.name = 'MyCustomWallet'
    this.icon = 'https://example.com/my-wallet-icon.png'
    this.uuid = '123e4567-e89b-12d3-a456-426614174000' // UUID duy nhất
    this.version = '1.0.0'
  }

  async request ({ method, params = [] }: { method: string; params?: any[] }): Promise<any> {
    console.log('🚀 ~ MyCustomWalletProvider ~ request ~ method:', method)
    console.log('🚀 ~ request ~ params:', params)

    switch (method) {
      case 'eth_requestAccounts':
        return this.enable()
      case 'eth_accounts':
        return this.getAccounts()
      case 'eth_chainId':
        return this.getChainId()
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

  getUrl (type?:I_TYPE_URL): string {
    switch (type) {
      case 'SEND_TRANSACTION':
        // return `${URL_PASSKEY}/wallet/send-transaction`
        return `${URL_PASSKEY}/mypage/${this.accounts[0]}`
      default:

        // if (isConnected && address) {
        //   const query = type === 'NFT' ? '/list-nfts' : ''
        //   url = `${URL_PASSKEY}/${GROUP_SLUG}/mypage/${address}${query}`
        // } else {
        return `${URL_PASSKEY}/activate-by-passkey/${GROUP_SLUG}`
    }
  }

  getFavicon () {
    const link = document.querySelector("link[rel~='icon']")
    return link ? (link as HTMLLinkElement).href : '/favicon.ico' // Trả về favicon mặc định nếu không tìm thấy
  };

  openPopup (type?:I_TYPE_URL, query?:{[key:string]:any}): Promise<any> {
    const url = this.getUrl(type)

    const encodedQuery = encodeBase64(query)
    let urlWithQuery = ''
    switch (type) {
      case 'SEND_TRANSACTION':
        urlWithQuery = `${url}?raw-transaction=${encodedQuery}`
        break
      default:
        urlWithQuery = ''
        break
    }

    const urlFinal = encodedQuery ? urlWithQuery : url
    const width = 450
    const height = 800
    const left = window.innerWidth / 2 - width / 2 + window.screenX
    const top = window.innerHeight / 2 - height / 2 + window.screenY

    const popup = window.open(
      urlFinal,
      `${GROUP_SLUG}`,
      `toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=${width},height=${height},top=${top},left=${left}`,
    )

    if (!popup) {
      return Promise.reject(new Error('Popup could not be opened'))
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
          // popup.close()
        }
      })
    })
  }

  private async enable (): Promise<string[]> {
    try {
      const { data } = await this.openPopup()

      // Xử lý kết quả trả về từ popup
      this.accounts = [data.addressPasskey] // Giả sử popup trả về thông tin account
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
    this.triggerEvent('accountsChanged', [])
    console.log('Wallet disconnected.')
  }

  private async getAccounts (): Promise<string[]> {
    return this.accounts
  }

  private async getChainId (): Promise<string> {
    return this.chainId
  }

  private async sendTransaction (params: any[]): Promise<string> {
    console.log('🚀 ~ MyCustomWalletProvider ~ sendTransaction ~ params:', params)
    const tx = params[0]
    console.log('Sending transaction:', tx)

    if (!tx.chainId) {
      tx.chainId = this.chainId
    }
    const infoPageConnected = {
      site: window.location.origin,
      icon: this.getFavicon(),
      timeStamp: Date.now(),
    }

    const { data } = await this.openPopup('SEND_TRANSACTION', { transaction: tx, infoPageConnected })

    if (data.type === 'ERROR_TRANSACTION') {
      throw new Error(data.payload)
    } else {
      console.log('🚀 ~ sendTransaction ~ result:', data)
      return data?.hash
    }
  }

  private async signMessage (params: any[]): Promise<string> {
    const [address, message] = params
    return '0xSignedMessage'
  }

  private async personalSign (params: any[]): Promise<string> {
    const [message, address] = params
    return '0xPersonalSignedMessage'
  }

  private async signTypedData (params: any[]): Promise<string> {
    const [address, typedData] = params
    return '0xTypedDataSignature'
  }

  private async subscribe (params: any[]): Promise<string> {
    return 'subscriptionId'
  }

  private async unsubscribe (params: any[]): Promise<boolean> {
    return true
  }

  private async switchEthereumChain (params: any[]): Promise<void> {
    const chainId = params[0].chainId
    // if (chainId === this.chainId) {
    //   return
    // }
    // throw new Error(`Unsupported chainId: ${chainId}`)

    this.chainId = chainId

    // Kích hoạt sự kiện chainChanged
    this.triggerEvent('chainChanged', chainId)
  }

  private async addEthereumChain (params: any[]): Promise<void> {
    console.log('Adding Ethereum chain:', params)
  }

  private async estimateGas (params: any[]): Promise<string> {
    console.log('Estimating gas for:', params)
    return '0x5208' // 21000 Gwei
  }

  private async getGasPrice (): Promise<string> {
    return '0x3B9ACA00' // 1 Gwei
  }

  private async getBlockNumber (): Promise<string> {
    return '0x10d4f' // Block number dưới dạng hex
  }

  private async getBalance (params: any[]): Promise<string> {
    const [address] = params
    return '0xDE0B6B3A7640000' // 1 ETH
  }

  private async getTransactionByHash (params: any[]): Promise<any> {
    const [txHash] = params
    return { hash: txHash, status: 'pending' } // Mô phỏng
  }

  private async getTransactionReceipt (params: any[]): Promise<any> {
    const [txHash] = params
    return { hash: txHash, status: 'success' } // Mô phỏng
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
export { MyCustomWalletProvider }
