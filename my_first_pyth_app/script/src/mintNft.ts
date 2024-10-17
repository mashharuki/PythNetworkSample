import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { createWalletClient, getContract, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";
 
export const abi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_pyth",
        type: "address",
        internalType: "address",
      },
      {
        name: "_ethUsdPriceId",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mint",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "updateAndMint",
    inputs: [
      {
        name: "pythPriceUpdate",
        type: "bytes[]",
        internalType: "bytes[]",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "error",
    name: "InsufficientFee",
    inputs: [],
  },
] as const;

/**
 * サンプルスクリプト
 */
async function run() {
  const account = privateKeyToAccount(process.env["PRIVATE_KEY"] as any);
  const client = createWalletClient({
    account,
    chain: optimismSepolia,
    transport: http(),
  });
  // コントラクト用のインスタンスを生成
  const contract = getContract({
    address: process.env["DEPLOYMENT_ADDRESS"] as any,
    abi: abi,
    client,
  });
 
  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  );
  const priceIds = [process.env["ETH_USD_ID"] as string];
  // プライスフィードの更新データを取得
  const priceFeedUpdateData = await connection.getPriceFeedsUpdateData(
    priceIds
  );
  console.log("Retrieved Pyth price update:");
  console.log(priceFeedUpdateData);
  
  // コントラクトの updateAndMint 関数を呼び出す
  const hash = await contract.write.updateAndMint(
    [priceFeedUpdateData as any],
    { value: parseEther("0.0005") }
  );
  console.log("Transaction hash:");
  console.log(hash);
}
 
run();