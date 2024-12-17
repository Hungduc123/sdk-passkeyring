'use client'
import React, { useState, ReactNode, useEffect } from 'react'

import '../../styles/index.css'
import AccountProvider from 'lib/Components/AccountProvider'
import { onPageLoad } from 'lib/function'

const PasskeyProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    onPageLoad()
  }, [])
  return (
    <AccountProvider>
      {children}
    </AccountProvider>
  )
}

export default PasskeyProvider
