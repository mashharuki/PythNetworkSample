# Pyth Oracle AMM

This directory contains an example of an AMM application using Pyth Price Feeds.
This AMM application manages a pool of two tokens and allows a user to trade with the pool at the current Pyth price.

This application has two components. The first component is a smart contract (in the `contract` directory) that manages the pool and implements the trading functionality.
The second is a frontend application (in the `app` directory) that communicates with the smart contract.

Please see the [Pyth documentation](https://docs.pyth.network/documentation/pythnet-price-feeds) for more information about Pyth and how to integrate it into your application.

**Warning** this AMM is intended only as a demonstration of Pyth price feeds and is **not for production use**.

## AMM Contract

All of the commands in this section expect to be run from the `contract` directory.

### Building

You need to have [Foundry](https://getfoundry.sh/) and `node` installed to run this example.
Once you have installed these tools, run the following commands from the [`contract`](./contract) directory to install openzeppelin and forge dependencies:

```
forge install foundry-rs/forge-std@v1.8.0 --no-git --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v4.8.1 --no-git --no-commit
```

After installing the above dependencies, you need to install pyth-sdk-solidity.

```
npm init -y
npm install @pythnetwork/pyth-sdk-solidity
```

### Testing

Simply run `forge test` in the [`contract`](./contract) directory. This command will run the
tests located in the [`contract/test`](./contract/test) directory.

### Deploying

To deploy the contract, you first need to set up your environment with the following values:

```bash
export RPC_URL=<YOUR_RPC_URL>
export PRIVATE_KEY=<YOUR_PRIVATE_KEY>
export PYTH_ADDRESS=<PYTH_ADDRESS>

export TOKEN_NAME_1=MockWETH
export TOKEN_SYMBOL_1=mWETH
export TOKEN_NAME_2=MockSOL
export TOKEN_SYMBOL_2=mSOL


BASE_PRICE_ID=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace # ETH/USD
QUOTE_PRICE_ID=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d # SOL/USD
```

Here, `RPC_URL` is the URL of the EVM chain you want to use, `PRIVATE_KEY` is the private key of the account you want to deploy from, and `WALLET_ADDRESS` is the address of the account associated with the private key. Make sure the account has enough funds to pay for the gas.

Check [Pyth Contract Address](https://docs.pyth.network/price-feeds/contract-addresses/evm) to get the `PYTH_ADDRESS` for your respective network.

`TOKEN_NAME_1` and `TOKEN_SYMBOL_1` are the name and symbol of the base token in the pool, and `TOKEN_NAME_2` and `TOKEN_SYMBOL_2` are the name and symbol of the quote token in the pool. **NOTE:** The above values are made up, and you can use any name and symbol you want.

We will use the `BASE_PRICE_ID` and `QUOTE_PRICE_ID` to get the price of the tokens from the Pyth oracle. These price feeds should be in the form of `BASE/USD` and `QUOTE/USD`. Above we are using `ETH/USD` and `SOL/USD` price feeds.

We can assume our ERC20 tokens to be any coin that has a price feed on Pyth.

For example, if we need a pair for `ETH/SOL`, we can use the following price ids:

Check [Pyth Price Feed Ids](https://pyth.network/developers/price-feed-ids) for the complete list of supported feeds.

If you wish to deploy on the Ethereum Sepolia testnet for `ETH/SOL` pair, you can use the following values:

After setting up the environment, you can deploy the contract by running the following command:

```bash
forge script scripts/OracleDeployment.s.sol --rpc-url $RPC_URL --broadcast
```

This script will deploy 2 ERC20 tokens, the OracleSwap contract, and initialize the pool with the Pyth price feed.
It also transfers some of the tokens to the pool for testing purposes.

After deploying the contract, you will see the address of the deployed contract in the output.
You can use this address to interact with the contract.

### Create ABI

If you change the contract, you will need to create a new ABI.
The frontend uses this ABI to create transactions.
You can overwrite the existing ABI by running the following command:

```
forge inspect OracleSwap abi > ../app/src/abi/OracleSwapAbi.json
```

## Frontend Application

By default, the frontend is configured to use the already deployed version of the oracle AMM
at address [`0x15F9ccA28688F5E6Cbc8B00A8f33e8cE73eD7B02`](https://mumbai.polygonscan.com/address/0x15F9ccA28688F5E6Cbc8B00A8f33e8cE73eD7B02) on Polygon Mumbai.
This means you can start playing with the application without going through the steps above (Remember to switch your wallet to Mumbai and claim funds from a faucet to pay for the gas).

### Build

From the `app/` directory, run the following commands to install dependencies and build the frontend:

```
npm i
npm run build
```

### Run

After building, you can start the frontend by navigating to the `app/` directory and running:

`npm run start`

Then navigate your browser to `localhost:3000`.

## デプロイした記録

環境変数はセットしておくこと！

```bash
yarn deploy
```

```bash
== Logs ==
  Base Token deployed at address:  0xa9322C8424580E0b38F3E90FdDC73e009609fB4b
  Quote Token deployed at address:  0xD41E1A91876c237521522DbD5ef2985e6afE1AD9
  OracleSwap contract deployed at address:  0x5B907Bd1b59760169a0946bD0A9044fF3E15c3e9

## Setting up 1 EVM.

==========================

Chain 11155420

Estimated gas price: 0.001000502 gwei

Estimated total gas used for script: 3659164

Estimated amount required: 0.000003661000900328 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x9fd757bfb8151ca4879df975817e5c6fd20ae10b4d11875cb88f98a00ab9e9b5
Block: 18681775
Paid: 0.000000051457912695 ETH (51445 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x1c2ace4b1983451bff4cd57cc97d274b3895867bc24185aea88587ad54a622c4
Block: 18681775
Paid: 0.000000252805438242 ETH (252742 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xb0c87dfc52e1d5bd1c513a95a6834cfcff58bc776c1a3d999deb31662cd27a58
Contract Address: 0xa9322C8424580E0b38F3E90FdDC73e009609fB4b
Block: 18681775
Paid: 0.000000773191022247 ETH (772997 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xd67692236b023570f0e31e7049e7766c44ce62852e9c17774819dd5cabde606b
Block: 18681775
Paid: 0.000000051457912695 ETH (51445 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x3f3863d6d75e93d13f12fb001036bc8d905be15974c679a7be09b46e44a27d93
Contract Address: 0x5B907Bd1b59760169a0946bD0A9044fF3E15c3e9
Block: 18681775
Paid: 0.00000090514713492 ETH (904920 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xcb8d466454b90cc838f81eb981e1182a530f71610fa68426aa2ccfe485e17d7c
Contract Address: 0xD41E1A91876c237521522DbD5ef2985e6afE1AD9
Block: 18681775
Paid: 0.000000773167016223 ETH (772973 gas * 0.001000251 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000002807226437022 ETH (2806522 gas * avg 0.001000251 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/harukikondo/git/PythNetworkSample/oracle_swap/contract/broadcast/OracleDeployment.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/harukikondo/git/PythNetworkSample/oracle_swap/contract/cache/OracleDeployment.s.sol/11155420/run-latest.json

✨  Done in 24.95s.
```

## ABI をアウトプット

```bash
forge inspect OracleSwap abi > ../app/src/abi/OracleSwapAbi.json
```
