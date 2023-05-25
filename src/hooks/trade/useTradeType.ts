import { CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
import { AaveMarginTrader, AaveSweeper } from "abis/types";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { LendingProtocol } from "state/1delta/actions";
import {
  AaveInterestMode,
  Asset,
  Field,
  MappedCurrencyAmounts,
  MarginTradeType,
  OneDeltaTradeType,
  PositionSides
} from "types/1delta";
import { ContractCallDataWithOptions, UniswapTrade } from "utils/Types";
import { createMarginTradeCalldataAave, createSingleSideCalldataAave } from "utils/calldata";


export interface TradeConfig {
  trade: UniswapTrade | undefined,
  allowedSlippage: Percent,
  marginTraderContract: AaveMarginTrader & AaveSweeper,
  sourceBorrowInterestMode: AaveInterestMode,
  targetBorrowInterestMode: AaveInterestMode,
  isMaxIn?: boolean | undefined,
  isMaxOut?: boolean | undefined

}

const defaultReturn = {
  args: {},
  method: undefined,
  estimate: () => null,
  call: undefined
}

export const useTradeCalldata = (
  protocol: LendingProtocol,
  marginTradeType: MarginTradeType,
  account: string | undefined,
  tradeConfig: TradeConfig,

): ContractCallDataWithOptions => {

  return useMemo(() => {
    switch (protocol) {
      case LendingProtocol.AAVE: {
        switch (marginTradeType) {
          case (MarginTradeType.Open): {
            return createMarginTradeCalldataAave(
              tradeConfig.trade,
              tradeConfig.allowedSlippage,
              tradeConfig.marginTraderContract,
              tradeConfig.sourceBorrowInterestMode,
              PositionSides.Borrow,
              account,
              tradeConfig.isMaxIn,
              tradeConfig.isMaxOut
            )
          }

          case (MarginTradeType.Trim):
            return createMarginTradeCalldataAave(
              tradeConfig.trade,
              tradeConfig.allowedSlippage,
              tradeConfig.marginTraderContract,
              tradeConfig.targetBorrowInterestMode,
              PositionSides.Collateral,
              account,
              tradeConfig.isMaxIn,
              tradeConfig.isMaxOut
            )

          case (MarginTradeType.Collateral): {
            return createSingleSideCalldataAave(
              tradeConfig.trade,
              tradeConfig.allowedSlippage,
              tradeConfig.marginTraderContract,
              PositionSides.Collateral,
              tradeConfig.sourceBorrowInterestMode,
              tradeConfig.targetBorrowInterestMode,
              account,
              tradeConfig.isMaxIn,
            )
          }

          case (MarginTradeType.Debt): {
            return createSingleSideCalldataAave(
              tradeConfig.trade,
              tradeConfig.allowedSlippage,
              tradeConfig.marginTraderContract,
              PositionSides.Collateral,
              tradeConfig.sourceBorrowInterestMode,
              tradeConfig.targetBorrowInterestMode,
              account,
              tradeConfig.isMaxIn,
            )
          }

          default:
            return defaultReturn
        }


      }

      case LendingProtocol.COMPOUND: {
        return defaultReturn
      }

      default:
        return defaultReturn
    }

  }, [
    account,
    tradeConfig,
    marginTradeType,
    protocol
  ]
  )


}