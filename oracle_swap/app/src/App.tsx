import {
  EvmPriceServiceConnection,
  HexString,
  Price,
  PriceFeed,
} from "@pythnetwork/pyth-evm-js";
import { useMetaMask } from "metamask-react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import "./App.css";
import { MintButton } from "./MintButton";
import { OrderEntry } from "./OrderEntry";
import { PriceText } from "./PriceText";
import { getBalance } from "./erc20";
import { ChainState, ExchangeRateMeta, tokenQtyToNumber } from "./utils";

// Configuration for the app.
const CONFIG = {
  // Each token is configured with its ERC20 contract address and Pyth Price Feed ID.
  // You can find the list of price feed ids at https://pyth.network/developers/price-feed-ids
  baseToken: {
    name: "BRL",
    erc20Address: "0xa9322C8424580E0b38F3E90FdDC73e009609fB4b",
    pythPriceFeedId:
      "0xd2db4dbf1aea74e0f666b0e8f73b9580d407f5e5cf931940b06dc633d7a95906",
    decimals: 18,
  },
  quoteToken: {
    name: "USD",
    erc20Address: "0xD41E1A91876c237521522DbD5ef2985e6afE1AD9",
    pythPriceFeedId:
      "0xd2db4dbf1aea74e0f666b0e8f73b9580d407f5e5cf931940b06dc633d7a95906",
    decimals: 18,
  },
  swapContractAddress: "0x5B907Bd1b59760169a0946bD0A9044fF3E15c3e9", //ここを任意のアドレスに変える (元は0x15F9ccA28688F5E6Cbc8B00A8f33e8cE73eD7B02)
  pythContractAddress: "0x0708325268dF9F66270F1401206434524814508b",
  hermesUrl: "https://hermes.pyth.network",
  mintQty: 100,
};

function App() {
  const { status, connect, account, ethereum } = useMetaMask();

  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);

  useEffect(() => {
    if (status === "connected") {
      setWeb3(new Web3(ethereum));
    }
  }, [status, ethereum]);

  const [chainState, setChainState] = useState<ChainState | undefined>(
    undefined
  );

  useEffect(() => {
    async function refreshChainState() {
      if (web3 !== undefined && account !== null) {
        setChainState({
          accountBaseBalance: await getBalance(
            web3,
            CONFIG.baseToken.erc20Address,
            account
          ),
          accountQuoteBalance: await getBalance(
            web3,
            CONFIG.quoteToken.erc20Address,
            account
          ),
          poolBaseBalance: await getBalance(
            web3,
            CONFIG.baseToken.erc20Address,
            CONFIG.swapContractAddress
          ),
          poolQuoteBalance: await getBalance(
            web3,
            CONFIG.quoteToken.erc20Address,
            CONFIG.swapContractAddress
          ),
        });
      } else {
        setChainState(undefined);
      }
    }

    const interval = setInterval(refreshChainState, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [web3, account]);

  const [pythOffChainPrice, setPythOffChainPrice] = useState<
    Record<HexString, Price>
  >({});

  // Subscribe to offchain prices. These are the prices that a typical frontend will want to show.
  useEffect(() => {
    // The Pyth price service client is used to retrieve the current Pyth prices and the price update data that
    // needs to be posted on-chain with each transaction.
    const pythPriceService = new EvmPriceServiceConnection(CONFIG.hermesUrl, {
      logger: {
        error: console.error,
        warn: console.warn,
        info: () => undefined,
        debug: () => undefined,
        trace: () => undefined,
      },
    });

    pythPriceService.subscribePriceFeedUpdates(
      [CONFIG.baseToken.pythPriceFeedId, CONFIG.quoteToken.pythPriceFeedId],
      (priceFeed: PriceFeed) => {
        const price = priceFeed.getPriceUnchecked(); // Fine to use unchecked (not checking for staleness) because this must be a recent price given that it comes from a websocket subscription.
        setPythOffChainPrice((prev) => ({ ...prev, [priceFeed.id]: price }));
      }
    );
  }, []);

  const [exchangeRateMeta, setExchangeRateMeta] = useState<
    ExchangeRateMeta | undefined
  >(undefined);

  useEffect(() => {
    let basePrice = pythOffChainPrice[CONFIG.baseToken.pythPriceFeedId];
    let quotePrice = pythOffChainPrice[CONFIG.quoteToken.pythPriceFeedId];

    if (basePrice !== undefined && quotePrice !== undefined) {
      const exchangeRate =
        basePrice.getPriceAsNumberUnchecked() /
        quotePrice.getPriceAsNumberUnchecked();
      const lastUpdatedTime = new Date(
        Math.max(basePrice.publishTime, quotePrice.publishTime) * 1000
      );
      setExchangeRateMeta({ rate: exchangeRate, lastUpdatedTime });
    } else {
      setExchangeRateMeta(undefined);
    }
  }, [pythOffChainPrice]);

  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const [isBuy, setIsBuy] = useState<boolean>(true);

  return (
    <div className="App">
      <div className="control-panel">
        <h3>Control Panel</h3>

        <div>
          {status === "connected" ? (
            <label>
              Connected Wallet: <br /> {account}
            </label>
          ) : (
            <button
              onClick={async () => {
                connect();
              }}
            >
              {" "}
              Connect Wallet{" "}
            </button>
          )}
        </div>

        <div>
          <h3>Wallet Balances</h3>
          {chainState !== undefined ? (
            <div>
              <p>
                {tokenQtyToNumber(
                  chainState.accountBaseBalance,
                  CONFIG.baseToken.decimals
                )}{" "}
                {CONFIG.baseToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG.baseToken.erc20Address}
                  destination={account!}
                  qty={CONFIG.mintQty}
                  decimals={CONFIG.baseToken.decimals}
                />
              </p>
              <p>
                {tokenQtyToNumber(
                  chainState.accountQuoteBalance,
                  CONFIG.quoteToken.decimals
                )}{" "}
                {CONFIG.quoteToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG.quoteToken.erc20Address}
                  destination={account!}
                  qty={CONFIG.mintQty}
                  decimals={CONFIG.quoteToken.decimals}
                />
              </p>
            </div>
          ) : (
            <p>loading...</p>
          )}
        </div>

        <h3>AMM Balances</h3>
        <div>
          <p>Contract address: {CONFIG.swapContractAddress}</p>
          {chainState !== undefined ? (
            <div>
              <p>
                {tokenQtyToNumber(
                  chainState.poolBaseBalance,
                  CONFIG.baseToken.decimals
                )}{" "}
                {CONFIG.baseToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG.baseToken.erc20Address}
                  destination={CONFIG.swapContractAddress}
                  qty={CONFIG.mintQty}
                  decimals={CONFIG.baseToken.decimals}
                />
              </p>
              <p>
                {tokenQtyToNumber(
                  chainState.poolQuoteBalance,
                  CONFIG.quoteToken.decimals
                )}{" "}
                {CONFIG.quoteToken.name}
                <MintButton
                  web3={web3!}
                  sender={account!}
                  erc20Address={CONFIG.quoteToken.erc20Address}
                  destination={CONFIG.swapContractAddress}
                  qty={CONFIG.mintQty}
                  decimals={CONFIG.quoteToken.decimals}
                />
              </p>
            </div>
          ) : (
            <p>loading...</p>
          )}
        </div>
      </div>

      <div className={"main"}>
        <h3>
          Swap between {CONFIG.baseToken.name} and {CONFIG.quoteToken.name}
        </h3>
        <PriceText
          price={pythOffChainPrice}
          currentTime={time}
          rate={exchangeRateMeta}
          baseToken={CONFIG.baseToken}
          quoteToken={CONFIG.quoteToken}
        />
        <div className="tab-header">
          <div
            className={`tab-item ${isBuy ? "active" : ""}`}
            onClick={() => setIsBuy(true)}
          >
            Buy
          </div>
          <div
            className={`tab-item ${!isBuy ? "active" : ""}`}
            onClick={() => setIsBuy(false)}
          >
            Sell
          </div>
        </div>
        <div className="tab-content">
          <OrderEntry
            web3={web3}
            account={account}
            isBuy={isBuy}
            approxPrice={exchangeRateMeta?.rate}
            baseToken={CONFIG.baseToken}
            quoteToken={CONFIG.quoteToken}
            hermesUrl={CONFIG.hermesUrl}
            pythContractAddress={CONFIG.pythContractAddress}
            swapContractAddress={CONFIG.swapContractAddress}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
