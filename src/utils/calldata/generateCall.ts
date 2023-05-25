
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { AaveMarginTrader, AaveMoneyMarket, AAVEPoolV3, AaveSweeper, Comet, CometMarginTrader, CometMoneyMarket, CometSweeper, MarginTrader, MoneyMarket, Sweeper } from 'abis/types'
import { WRAPPED_NATIVE_SYMBOL } from 'constants/1delta'
import { Contract } from 'ethers'
import { LendingProtocol } from 'state/1delta/actions'
import { AaveInterestMode, MarginTradeType, PositionSides } from 'types/1delta'
import { ContractCallDataWithOptions, UniswapTrade } from 'utils/Types'
import { createDirectMoneyMarketCalldataAave, createMarginTradeCalldataAave, createMarginTradeCalldataCompound, createMoneyMarketCalldataAave, createSingleSideCalldataAave, createSingleSideCalldataCompound } from '.'
import { createMarginTradeCalldataComet } from './compound-v3/marginTradeMethodCreator'
import { createAccountMoneyMarketCalldataComet, createDirectMoneyMarketCalldataComet } from './compound-v3/moneyMarketMethodCreator'
import { createSingleSideCalldataComet } from './compound-v3/singleSideMethodCreator'
import { createAccountMoneyMarketCalldataCompound, createDirectAccountMoneyMarketCalldata } from './compound/moneyMarketMethodCreator'


export interface TradeConfig {
  trade: UniswapTrade | undefined,
  parsedAmount: CurrencyAmount<Currency> | undefined
  recipient?: string,
  allowedSlippage: Percent,
  marginTraderContract: Contract,
  moneyMarketContract?: Contract | null,
  sourceBorrowInterestMode: AaveInterestMode,
  targetBorrowInterestMode: AaveInterestMode,
  isMaxIn: boolean
  isMaxOut: boolean
  inIsETH: boolean
  outIsETH: boolean
  walletIsETH: boolean
}

const defaultReturn = {
  args: {},
  method: undefined,
  estimate: () => null,
  call: undefined
}

export const generateCalldata = (
  protocol: LendingProtocol,
  marginTradeType: MarginTradeType,
  account: string | undefined,
  tradeConfig: TradeConfig,

): ContractCallDataWithOptions => {

  switch (protocol) {
    case LendingProtocol.AAVE: {
      switch (marginTradeType) {
        case (MarginTradeType.Open): {
          return createMarginTradeCalldataAave(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as AaveMarginTrader & AaveSweeper,
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
            tradeConfig.marginTraderContract as AaveMarginTrader & AaveSweeper,
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
            tradeConfig.marginTraderContract as AaveMarginTrader & AaveSweeper,
            PositionSides.Collateral,
            tradeConfig.sourceBorrowInterestMode,
            tradeConfig.targetBorrowInterestMode,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut,
          )
        }

        case (MarginTradeType.Debt): {
          return createSingleSideCalldataAave(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as AaveMarginTrader & AaveSweeper,
            PositionSides.Borrow,
            tradeConfig.sourceBorrowInterestMode,
            tradeConfig.targetBorrowInterestMode,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut,
          )
        }

        default:
          return defaultReturn
      }
    }

    case LendingProtocol.COMPOUND: {
      switch (marginTradeType) {
        case (MarginTradeType.Open): {
          return createMarginTradeCalldataCompound(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as MarginTrader & Sweeper,
            PositionSides.Borrow,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut
          )
        }

        case (MarginTradeType.Trim):
          return createMarginTradeCalldataCompound(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as MarginTrader & Sweeper,
            PositionSides.Collateral,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut
          )

        case (MarginTradeType.Collateral): {
          return createSingleSideCalldataCompound(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as MarginTrader & Sweeper,
            PositionSides.Collateral,
            account,
            tradeConfig.isMaxIn,
          )
        }

        case (MarginTradeType.Debt): {
          return createSingleSideCalldataCompound(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as MarginTrader & Sweeper,
            PositionSides.Borrow,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut,
          )
        }

        default:
          return defaultReturn
      }
    }

    case LendingProtocol.COMPOUNDV3: {
      switch (marginTradeType) {
        case (MarginTradeType.Open): {
          return createMarginTradeCalldataComet(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as CometMarginTrader & CometSweeper,
            PositionSides.Borrow,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut
          )
        }

        case (MarginTradeType.Trim):
          return createMarginTradeCalldataComet(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as CometMarginTrader & CometSweeper,
            PositionSides.Collateral,
            account,
            tradeConfig.isMaxIn,
            tradeConfig.isMaxOut
          )

        case (MarginTradeType.Collateral): {
          return createSingleSideCalldataComet(
            tradeConfig.trade,
            tradeConfig.allowedSlippage,
            tradeConfig.marginTraderContract as CometMarginTrader & CometSweeper,
            PositionSides.Collateral,
            account,
            tradeConfig.isMaxIn,
          )
        }

        default:
          return defaultReturn
      }
    }
    default:
      return defaultReturn
  }
}


export const generateMoneyMarketCalldata = (
  protocol: LendingProtocol,
  account: string | undefined,
  tradeConfig: TradeConfig,
  marginTradeType: MarginTradeType,
  isDirect: boolean
): ContractCallDataWithOptions => {

  switch (protocol) {
    case LendingProtocol.AAVE: {
      if (isDirect) {
        const amount = tradeConfig.parsedAmount
        const networkSymb = WRAPPED_NATIVE_SYMBOL[amount?.currency.chainId ?? 0]
        const ethFlag = tradeConfig.inIsETH || tradeConfig.outIsETH || amount?.currency.symbol === networkSymb
        return createDirectMoneyMarketCalldataAave(
          (ethFlag ? tradeConfig.marginTraderContract :
            tradeConfig.moneyMarketContract) as AaveMoneyMarket & AAVEPoolV3 & Contract,
          marginTradeType,
          tradeConfig.sourceBorrowInterestMode,
          tradeConfig.parsedAmount,
          account,
          tradeConfig.recipient,
          ethFlag,
          tradeConfig.isMaxIn || tradeConfig.isMaxOut
        )
      }
      else
        return createMoneyMarketCalldataAave(
          tradeConfig.trade,
          tradeConfig.allowedSlippage,
          tradeConfig.marginTraderContract as AaveMoneyMarket & AaveSweeper,
          tradeConfig.sourceBorrowInterestMode,
          marginTradeType,
          tradeConfig.inIsETH,
          account,
          tradeConfig.recipient,
          tradeConfig.isMaxOut
        )
    }

    case LendingProtocol.COMPOUND: {
      if (isDirect) {
        const amount = tradeConfig.parsedAmount
        const networkSymb = WRAPPED_NATIVE_SYMBOL[amount?.currency.chainId ?? 0]
        return createDirectAccountMoneyMarketCalldata(
          tradeConfig.marginTraderContract as MoneyMarket & Sweeper,
          marginTradeType,
          tradeConfig.parsedAmount,
          tradeConfig.inIsETH || tradeConfig.outIsETH || amount?.currency.symbol === networkSymb,
          tradeConfig.walletIsETH,
          account,
          tradeConfig.recipient,
          tradeConfig.isMaxIn || tradeConfig.isMaxOut
        )
      }
      else
        return createAccountMoneyMarketCalldataCompound(
          tradeConfig.trade,
          tradeConfig.allowedSlippage,
          tradeConfig.marginTraderContract as MoneyMarket & Sweeper,
          marginTradeType,
          tradeConfig.inIsETH,
          tradeConfig.outIsETH,
          account,
          tradeConfig.recipient,
          tradeConfig.isMaxIn || tradeConfig.isMaxOut
        )
    }

    case LendingProtocol.COMPOUNDV3: {
      if (isDirect) {
        const amount = tradeConfig.parsedAmount
        const networkSymb = WRAPPED_NATIVE_SYMBOL[amount?.currency.chainId ?? 0]
        const ethFlag = tradeConfig.inIsETH || tradeConfig.outIsETH || amount?.currency.symbol === networkSymb
        return createDirectMoneyMarketCalldataComet(
          (ethFlag ? tradeConfig.marginTraderContract :
            tradeConfig.moneyMarketContract) as Comet & CometMoneyMarket,
          marginTradeType,
          tradeConfig.parsedAmount,
          ethFlag,
          tradeConfig.outIsETH,
          account,
          tradeConfig.recipient,
          tradeConfig.isMaxIn
        )
      }
      else
        return createAccountMoneyMarketCalldataComet(
          tradeConfig.trade,
          tradeConfig.allowedSlippage,
          tradeConfig.marginTraderContract as CometMoneyMarket & CometSweeper,
          marginTradeType,
          tradeConfig.inIsETH,
          tradeConfig.outIsETH,
          account,
          tradeConfig.recipient,
          tradeConfig.isMaxIn
        )

    }
  }
}