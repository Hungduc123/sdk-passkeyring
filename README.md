# Passkey connect

> The sdk package provides a simple support connect Smart account.

## Install (for single position)

```bash
npm install --save sdk-v2-egglegamewallet
```

```bash
yarn add sdk-v2-egglegamewallet
```

## Usage

```jsx
//MUST HAVE - Used for the first file to run (index.js)

import React from "react";
import { PasskeyProvider } from "sdk-v2-egglegamewallet";

const App = ({ children }) => {
  return <PasskeyProvider>{children}</PasskeyProvider>;
};

export default App;
```

```jsx
//If you want to connect wallet to browsers that do not support injected
//Then follow these steps.
//NOTE: You have setup AppKit in your dapp, make sure enableEIP6963 = true, enableInjected = true
#### 📚 [Documentation AppKit](https://docs.reown.com/appkit/overview)

//step 1 : create button to connect
import React from "react";
import { infoWallet } from "sdk-v2-egglegamewallet";
import { useConnect, useConnectors, useSwitchChain } from "wagmi";

const ButtonConnectWallet = () => {
  const { connect } = useConnect();

  const { switchChainAsync } = useSwitchChain();
  const connectors = useConnectors();

  const handleConnect = async () => {
    const chainId = 137;

    await switchChainAsync({ chainId: chainId }); //  switch to chain you want connect

    connectors.forEach((connector) => {
      if (connector.id === infoWallet.rdns) {
        connect({
          connector,
          chainId: chainId,
        });
      }
    });
  };

  return (
    <button
      onClick={async () => {
        await handleConnect();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px",
        borderRadius: "5px",
        cursor: "pointer",
        gap: "10px",
      }}
    >
      <img src={infoWallet.icon} width={20} height={20} />
      <div>{infoWallet.name}</div>
    </button>
  );
};

export default ButtonConnectWallet;



//step 2:

import React from "react";
import { isWeb3Injected } from "sdk-v2-egglegamewallet";
import ButtonConnectWallet from "./ButtonConnectWallet";// step above
import { useWeb3Modal } from "@web3modal/wagmi/react";

const YourComponent = () => {
  const { open } = useWeb3Modal();

  return (
    <>
      {isWeb3Injected() ? (
        <div
          onClick={() => {
            open({ view: "Connect" });
          }}
        >
          Connect
        </div>
      ) : (
        <ButtonConnectWallet />
      )}
    </>
  );
};

export default YourComponent;






```
