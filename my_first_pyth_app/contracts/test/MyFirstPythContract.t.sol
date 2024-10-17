// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
 
import { Test, console2 } from "forge-std/Test.sol";
import { MyFirstPythContract } from "../src/MyFirstPythContract.sol";
import { MockPyth } from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
 
 /**
  * MyFirstPythContract用のTestCode
  */
contract MyFirstPythContractTest is Test {
  MockPyth public pyth;
  bytes32 ETH_PRICE_FEED_ID = bytes32(uint256(0x1));
  MyFirstPythContract public app;
 
  uint256 ETH_TO_WEI = 10 ** 18;
  
  /**
   * セットアップメソッド
   */
  function setUp() public {
    pyth = new MockPyth(60, 1);
    app = new MyFirstPythContract(address(pyth), ETH_PRICE_FEED_ID);
  }
  
  /**
   * ETHの価格を更新するメソッド
   */
  function createEthUpdate(
    int64 ethPrice
  ) private view returns (bytes[] memory) {
    bytes[] memory updateData = new bytes[](1);
    // updateデータ
    updateData[0] = pyth.createPriceFeedUpdateData(
      ETH_PRICE_FEED_ID,
      ethPrice * 100000, // price
      10 * 100000, // confidence
      -5, // exponent
      ethPrice * 100000, // emaPrice
      10 * 100000, // emaConfidence
      uint64(block.timestamp), // publishTime
      uint64(block.timestamp) // prevPublishTime
    );
 
    return updateData;
  }
  
  /**
   * ETHを更新するメソッド
   */
  function setEthPrice(int64 ethPrice) private {
    // create ETH price update
    bytes[] memory updateData = createEthUpdate(ethPrice);
    // get update fee
    uint value = pyth.getUpdateFee(updateData);
    vm.deal(address(this), value);
    pyth.updatePriceFeeds{ value: value }(updateData);
  }
  
  /**
   * mintメソッドのテスト(成功パターン)
   */
  function testMint() public {
    // ETHの価格を100に設定
    setEthPrice(100);
 
    vm.deal(address(this), ETH_TO_WEI);
    // mintメソッドを実行
    app.mint{ value: ETH_TO_WEI / 100 }();
  }
  
  /**
   * mintメソッドのテスト(失敗パターン)
   */
  function testMintRevert() public {
    // ETHの価格を99に設定
    setEthPrice(99);
 
    vm.deal(address(this), ETH_TO_WEI);
    vm.expectRevert();
    // mintメソッドを実行
    app.mint{ value: ETH_TO_WEI / 100 }();
  }

  /**
   * mintメソッドのテスト(価格が古い場合)
   */
  function testMintStalePrice() public {
    setEthPrice(100);
 
    skip(120);
 
    vm.deal(address(this), ETH_TO_WEI);
    // Add this line
    vm.expectRevert();
    app.mint{ value: ETH_TO_WEI / 100 }();
  }

  /**
   * 価格を最新化してNFTをミントするメソッドのテスト
   */
  function testUpdateAndMint() public {
    // ETHの価格を100に設定
    bytes[] memory updateData = createEthUpdate(100);
 
    vm.deal(address(this), ETH_TO_WEI);
    // 最新化させてNFTをミントする
    app.updateAndMint{ value: ETH_TO_WEI / 100 }(updateData);
  }
}
 