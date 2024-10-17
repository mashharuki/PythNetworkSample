## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

## チュートリアルを動かすときに設定が必要な環境変数は

.env を確認すること

## デプロイコマンド

```bash
forge create src/MyFirstPythContract.sol:MyFirstPythContract \
--private-key $PRIVATE_KEY \
--rpc-url $RPC_URL \
--constructor-args $PYTH_OP_SEPOLIA_ADDRESS $ETH_USD_ID
```

デプロイした記録

```bash
Deployer: 0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072
Deployed to: 0xB2775012891Ad9b63E389BDE502Faa950346aE9c
Transaction hash: 0x39d779211e94cf6f21c5dd4685429ada941a2bfc7bbb0dbf68791b63f3e84b66
```

ブロックエクスプローラーで確認

[0x39d779211e94cf6f21c5dd4685429ada941a2bfc7bbb0dbf68791b63f3e84b66](https://optimism-sepolia.blockscout.com/tx/0x39d779211e94cf6f21c5dd4685429ada941a2bfc7bbb0dbf68791b63f3e84b66)

## ETH/USD の最新の値を取得する

```bash
curl -s "https://hermes.pyth.network/v2/updates/price/latest?&ids[]=$ETH_USD_ID" | jq -r ".binary.data[0]" > price_update.txt
```

## 為替レートを最新化してミントメソッドを呼び出す。

```bash
cast send \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL \
  -j \
  --value 0.0005ether \
  $DEPLOYMENT_ADDRESS \
  "updateAndMint(bytes[])" \
  [0x`cat price_update.txt`]
```
