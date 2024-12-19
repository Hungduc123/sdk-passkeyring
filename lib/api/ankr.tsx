import BigNumber from 'bignumber.js'
import { BigNumber as BNEth, ethers } from 'ethers'
import { URL_PASSKEY } from 'lib/constants'
import { isEmpty } from 'lodash'
import axios from 'axios'

export default class AnkrApi {
  static async getGasPrice (chainId:any) {
    try {
      const params = {
        method: 'eth_gasPrice',
        params: [],
      }
      const gasPrice = await AnkrApi.ankrRpcApi(chainId, params)
      const gasPriceBN = new BigNumber(gasPrice)
      return gasPriceBN
    } catch (error) {
      throw new Error((error as any)?.message || 'getGasPrice error')
    }
  }

  // return blance in wei
  static async getBalance (chainId:any, address:any, needConvertWeiToBalance = false) {
    try {
      const params = {
        method: 'eth_getBalance',
        params: [
          address,
          'latest',
        ],
      }
      const balance = await AnkrApi.ankrRpcApi(chainId, params)
      const gasPriceBN = BNEth.from(balance)
      if (needConvertWeiToBalance) {
        return ethers.utils.formatEther(gasPriceBN)
      }
      return gasPriceBN
    } catch (error) {
      // console.error('🚀 ~ file: ankr.js:107 ~ AnkrApi ~ getBalance ~ error:', error)
      return BNEth.from(0)

      // throw new Error('getBalance error')
    }
  }

  static async getCode (chainId:any, address:any) {
    try {
      const params = {
        method: 'eth_getCode',
        params: [
          address,
          'latest',
        ],
      }
      const code = await AnkrApi.ankrRpcApi(chainId, params)
      return code
    } catch (error) {
      // console.error('🚀 ~ file: ankr.js:107 ~ AnkrApi ~ getCode ~ error:', error)
      throw new Error((error as any)?.message || 'getCode error')
    }
  }

  static async estimateGas (chainId:any, rawTransaction:any) {
    // try {
    //   if (rawTransaction?.value) {
    //     rawTransaction.value = converter.decToHex(rawTransaction.value.toString())
    //   }

    //   const params = {
    //     method: 'eth_estimateGas',
    //     params: [
    //       rawTransaction,
    //     ],
    //   }
    //   const balance = await AnkrApi.ankrRpcApi(chainId, params)
    //   const gasPriceBN = BNEth.from(isEmpty(balance) ? 0 : balance)
    //   return gasPriceBN
    // } catch (error) {
    //   // return new BigNumber(0)
    //   throw new Error('estimateGas error')
    // }
  }

  // get nonce
  static async getTransactionCount (chainId:any, address:any) {
    try {
      const params = {
        method: 'eth_getTransactionCount',
        params: [
          address,
          'pending',
        ],
      }
      const nonce = await AnkrApi.ankrRpcApi(chainId, params)
      const nonceBN = BNEth.from(nonce)
      return nonceBN.toString()
    } catch (error) {
      // console.error('🚀 ~ file: ankr.js:155 ~ AnkrApi ~ getTransactionCount ~ error:', error)
      return 0
    }
  }

  static async getTransactionReceipt (chainId:any, txsHash:any) {
    const params = {
      method: 'eth_getTransactionReceipt',
      params: [
        txsHash,
      ],
    }
    const transactionReceipt = await AnkrApi.ankrRpcApi(chainId, params)
    return transactionReceipt
  }

  // static async sendRawTransaction (chainId, signedTx) {
  //   try {
  //     const params = {
  //       method: 'eth_sendRawTransaction',
  //       params: [
  //         signedTx,
  //       ],
  //     }
  //     const res = await AnkrApi.ankrRpcApi(chainId, params)
  //     if (res) {
  //       return res
  //     } else {
  //       throw new Error('Bad Request sendRawTransaction')
  //     }
  //   } catch (error) {
  //     throw new Error('Bad Request sendRawTransaction')
  //   }
  // }

  /**
   *
   * @param {*} chainId
   * @param {*} transaction  gasPrice, value in wei
   * @returns
   */

  static async ankrRpcApi (chainId: any, { method = '', params = [] }: any, options = {}) {
    const dataRequest = {
      id: Math.floor(Math.random() * 100),
      jsonrpc: '2.0',
      method,
      params,
      ...options,
    }

    try {
      const res = await axios.post(`${URL_PASSKEY}/api/ankrRpc?chainId=${chainId}`, dataRequest, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.status === 200) {
        return res.data
      } else {
        throw new Error(`AnkrApi ~ error: ${res.data?.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      const err = error as any
      throw new Error(`AnkrApi ~ error: ${err.response?.data?.error?.message || err.message || 'Unknown error'}`)
    }
  }

  // static async sendTransaction (chainId:string, wallet:any, rawTransaction:any, callbackError:any) {
  //   try {
  //     if (!rawTransaction?.nonce) {
  //       const address = wallet?.address || await wallet.getAddress()
  //       const nonce = await this.getTransactionCount(chainId, address)
  //       rawTransaction.nonce = Number(nonce?.toString())
  //     }
  //     if (!rawTransaction?.chainId && chainId) {
  //       rawTransaction.chainId = Number(chainId?.toString())
  //     }
  //     const signedTx = await wallet.signTransaction(rawTransaction)
  //     const txsHash = await AnkrApi.sendRawTransaction(chainId, signedTx)

  //     if (txsHash && txsHash !== '0x' && !txsHash?.error) {
  //       return txsHash
  //     } else {
  //       if (callbackError) {
  //         callbackError()
  //       } else {
  //         throw new Error('sendTransaction error')
  //       }
  //     }
  //   } catch (error) {
  //     // console.error('🚀 ~ file: ankr.js:217 ~ AnkrApi ~ sendTransaction ~ error:', error)
  //     if (callbackError) {
  //       callbackError()
  //     } else {
  //       throw new Error('sendTransaction error')
  //     }
  //   }
  // }

  // static async trackingTxs (chainId:any, hash:any, callbackDone:any, callbackError:any, callbackOverTime:any, timeout = 20000) {
  //   const startTime = Date.now()

  //   while (true) {
  //     try {
  //       const res = await this.getTransactionReceipt(chainId, hash)
  //       if (res?.status === '0x1' || res?.status === 1) {
  //         callbackDone && callbackDone(res)
  //         return res?.status === '0x1' || res?.status === 1
  //       }
  //     } catch (error) {

  //     }

  //     // Kiểm tra xem đã qua thời gian timeout chưa
  //     if (Date.now() - startTime >= timeout) {
  //       if (callbackOverTime) {
  //         callbackOverTime()
  //       } else {
  //         throw new Error('overtime')
  //       }
  //     }

  //     // Chờ 1 giây trước khi thử lại
  //     await new Promise(resolve => setTimeout(resolve, 1000))
  //   }
  // }

  static async callReadContract (chainId:any, contract:any, nameFunction:any, arrPrams = []) {
    const dataTxs = contract.interface.encodeFunctionData(nameFunction, [...arrPrams])
    const tx = {
      data: dataTxs,
      to: contract.address.toLowerCase(),
    }

    const params = [
      tx,
      'latest',
    ]

    const payload = {
      method: 'eth_call',
      params,
    }

    const res = await this.ankrRpcApi(chainId, payload)
    return res
  }
}
