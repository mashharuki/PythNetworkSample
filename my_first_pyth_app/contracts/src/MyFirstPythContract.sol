// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
 
import { console2 } from "forge-std/Test.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
 
/**
  * @title MyFirstPythContract
  * @author 
  * @notice 
  */
contract MyFirstPythContract {
  IPyth pyth;
  bytes32 ethUsdPriceId;

  // Error raised if the payment is not sufficient
  error InsufficientFee();
  
  /**
   * コンストラクター
   */
  constructor(address _pyth, bytes32 _ethUsdPriceId) {
    pyth = IPyth(_pyth);
    ethUsdPriceId = _ethUsdPriceId;
  }

  /**
   * NFTをミントする
   */
  function mint() public payable {
    // Get the price of ETH/USDå
    PythStructs.Price memory price = pyth.getPriceNoOlderThan(
      ethUsdPriceId,
      60
    );
 
    uint ethPrice18Decimals = (uint(uint64(price.price)) * (10 ** 18)) /
      (10 ** uint8(uint32(-1 * price.expo)));
    uint oneDollarInWei = ((10 ** 18) * (10 ** 18)) / ethPrice18Decimals;
 
    console2.log("required payment in wei");
    console2.log(oneDollarInWei);
 
    if (msg.value >= oneDollarInWei) {
      // User paid enough money.
      // TODO: mint the NFT here
    } else {
      // ネイティブトークンが足りない場合にはエラーとする。
      revert InsufficientFee();
    }
  }

  /**
   * 価格を最新化してNFTをミントするメソッド
   */
  function updateAndMint(bytes[] calldata pythPriceUpdate) external payable {
    // get the update fee
    uint updateFee = pyth.getUpdateFee(pythPriceUpdate);
    pyth.updatePriceFeeds{ value: updateFee }(pythPriceUpdate);
    // NFTをミントする。
    mint();
  }
}
 