# チュートリアルまとめ

## 概要

このチュートリアルでは、Pyth のリアルタイム価格データを使用して、1 ドル相当の ETH で NFT をミントする方法を紹介します。Solidity のコントラクトを使って Pyth の ETH/USD の価格を取得し、その価格を基に NFT をミントするために必要な ETH の量を計算します。

## 学べる内容

- Pyth の価格データを Solidity コントラクトで取得
- ステールデータを防ぐために価格を更新
- OP-sepolia テストネットにデプロイ
- `pyth-evm-js`を使って価格を更新し取得する方法

## チュートリアルの流れ

- **パート 1**: Pyth のオラクルから価格を取得し、コントラクトを作成
- **パート 2**: アプリをデプロイ
