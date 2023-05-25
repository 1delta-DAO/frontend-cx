import { Currency, CurrencyAmount, Token } from "@uniswap/sdk-core";
import { ONE_18, ZERO_BN } from "constants/1delta";
import { ethers } from "ethers";
import { useMemo } from "react";
import { a } from "react-spring";
import { LendingProtocol } from "state/1delta/actions";
import {
  AaveInterestMode,
  Asset,
  Field,
  MappedCurrencyAmounts,
  MarginTradeType,
  OneDeltaTradeType,
  PositionSides,
  SupportedAssets
} from "types/1delta";


/**
 * Determines which reference balances to use for maximum values and validation
 * @param chainId the chainId
 * @param protocol the lender
 * @param tradeType money market / collateral % debt swap / margin trade
 * @param asset0 first asset / asset collateral for margin trade
 * @param asset1 second asset / asset borrow for margin trade
 * @param token0 corresponding token for asset0
 * @param token1 corresponding token for asset1
 * @param selectedBorrowInterestMode0 for aave the borrow mode for asset0, NONE otherwise
 * @param selectedBorrowInterestMode1 for aave the borrow mode for asset1, NONE otherwise
 * @param marginTradeType margin trade type - only relevant for trade type MT
 * @param userBalance in case the amounts for money market interactions are fetched, thisis the ref user balance
 * @returns [currencyAmounts, borrow0, borrow1]
 */
export const useCurrencyAmounts = (
  chainId: number,
  account: string | undefined,
  protocol: LendingProtocol,
  marginTradeType: MarginTradeType,
  asset0: Asset,
  asset1: Asset,
  token0: Currency,
  token1: Currency,
  selectedBorrowInterestMode0: AaveInterestMode,
  selectedBorrowInterestMode1: AaveInterestMode,
  userBalance: CurrencyAmount<Currency> | undefined = undefined,
  baseAsset = SupportedAssets.USDC,
  switchOpen = false
) => {
  return useMemo(() => {
    switch (protocol) {
      case LendingProtocol.AAVE: {
        switch (marginTradeType) {
          case MarginTradeType.Open: {
            const [assetIn, assetOut, currencyIn, currencyOut] = switchOpen
              ? [asset1, asset0, token1, token0]
              : [asset0, asset1, token0, token1]
            let _borrowedDebtType: AaveInterestMode

            // we see which debt the user owns and assign it if there is any of a specific type
            // if the input type  has not type (NONE), it shall be editable by the user
            const stableDebtBorrowBalance = ethers.BigNumber.from(
              assetIn?.aaveData[chainId].userData?.currentStableDebt ?? '0'
            )
            const variableBorrowBalance = ethers.BigNumber.from(
              assetIn?.aaveData[chainId].userData?.currentVariableDebt ?? '0'
            )

            const borrowBalance =
              (selectedBorrowInterestMode0 === AaveInterestMode.STABLE
                ? stableDebtBorrowBalance.toString()
                : variableBorrowBalance.toString()) ?? '0'

            if (assetIn?.aaveData[chainId].reserveData?.stableBorrowRateEnabled && stableDebtBorrowBalance.gt(0))
              _borrowedDebtType = AaveInterestMode.STABLE
            if (variableBorrowBalance.gt(0)) _borrowedDebtType = AaveInterestMode.VARIABLE
            try {
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(currencyIn, borrowBalance),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                  currencyOut,
                  assetOut?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
                ),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: null,
                [Field.OUTPUT]: null
              }
            }
          }
          case MarginTradeType.Trim: {
            const assetIn = asset0
            const assetOut = asset1
            let _borrowedDebtType: AaveInterestMode
            // for trimming, we swap from the collateral to repay a borrow: ccyIn is on the collateral side
            const [currencyIn, currencyOut] = [token0, token1]

            // we see which debt the user owns and assign it if there is any of a specific type
            // if the input type  has not type (NONE), it shall be editable by the user
            const stableDebtBorrowBalance = ethers.BigNumber.from(
              assetOut?.aaveData[chainId].userData?.currentStableDebt ?? '0'
            )
            const variableBorrowBalance = ethers.BigNumber.from(
              assetOut?.aaveData[chainId].userData?.currentVariableDebt ?? '0'
            )


            const borrowBalance =
              (selectedBorrowInterestMode1 === AaveInterestMode.STABLE
                ? stableDebtBorrowBalance.toString()
                : variableBorrowBalance.toString()) ?? '0'
            try {
              // assign debt balances
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(
                  currencyIn,
                  assetIn?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
                ),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                  currencyOut,
                  borrowBalance
                ),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: undefined,
                [Field.OUTPUT]: undefined
              }
            }
          }


          case MarginTradeType.Collateral: {
            // get ccys
            const [currencyIn, currencyOut] =
              String(asset0.id) === token0.symbol ? [token0, token1] : [token1, token0]

            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                currencyIn,
                asset0?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
              ),
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                currencyOut,
                asset1?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
              ),
            }
          }
          case MarginTradeType.Debt: {
            // get ccys
            const [currencyIn, currencyOut] =
              String(asset0.id) === token0.symbol ? [token0, token1] : [token1, token0]

            const sourceBorrowInterestMode = selectedBorrowInterestMode0
            const targetBorrowInterestMode = selectedBorrowInterestMode1
            // we see which debt the user owns and assign it if there is any of a specific type
            // if the input type  has not type (NONE), it shall be editable by the user
            const stableDebtIn = ethers.BigNumber.from(asset0?.aaveData[chainId].userData?.currentStableDebt ?? '0')
            const variableDebtIn = ethers.BigNumber.from(asset0?.aaveData[chainId].userData?.currentVariableDebt ?? '0')

            const stableDebtOut = ethers.BigNumber.from(asset1?.aaveData[chainId].userData?.currentStableDebt ?? '0')
            const variableDebtOut = ethers.BigNumber.from(asset1?.aaveData[chainId].userData?.currentVariableDebt ?? '0')

            // assign debt balances
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                currencyIn,
                (sourceBorrowInterestMode === AaveInterestMode.STABLE ? stableDebtIn : variableDebtIn).toString()
              ),
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                currencyOut,
                (targetBorrowInterestMode === AaveInterestMode.STABLE ? stableDebtOut : variableDebtOut).toString()
              ),
            }
          }
          case MarginTradeType.Borrow: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined
            // the input is the borrowed amount, the output the received amount
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                token0,
                (selectedBorrowInterestMode0 === AaveInterestMode.STABLE
                  ? asset0?.aaveData[chainId].userData?.currentStableDebt
                  : asset0?.aaveData[chainId].userData?.currentVariableDebt) ?? '0'
              ),
              [Field.OUTPUT]: selectedCurrencyAmount,
            }
          }

          case MarginTradeType.Supply: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            // the input is the user-selected currency and amount
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
              ),
            }
          }

          case MarginTradeType.Withdraw: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            // the input is the deposited currency amount
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.aaveData[chainId].userData?.currentATokenBalance ?? '0'
              ),
              [Field.OUTPUT]: selectedCurrencyAmount,
            }
          }

          case MarginTradeType.Repay: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            // input is user token amount, output is debt to be repaid
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                token0,
                (selectedBorrowInterestMode0 === AaveInterestMode.STABLE
                  ? asset0?.aaveData[chainId].userData?.currentStableDebt
                  : asset0?.aaveData[chainId].userData?.currentVariableDebt) ?? '0'
              ),
            }
          }
        }
      }
      // compound V3 does not have debt swaps
      case LendingProtocol.COMPOUNDV3: {
        switch (marginTradeType) {
          case MarginTradeType.Open: {
            const [assetIn, assetOut, currencyIn, currencyOut] = switchOpen
              ? [asset1, asset0, token1, token0]
              : [asset0, asset1, token0, token1]

            const borrowBalance = assetIn?.compoundV3Data[chainId][baseAsset].userData?.borrowBalance ?? '0'
            const userDeposit = assetOut?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0'

            try {
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(currencyIn, borrowBalance),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(currencyOut, userDeposit),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: null,
                [Field.OUTPUT]: null
              }
            }

          }
          case MarginTradeType.Trim: {
            const assetIn = asset0
            const assetOut = asset1
            // for trimming, we swap from the collateral to repay a borrow: ccyIn is on the collateral side
            const [currencyIn, currencyOut] = [token0, token1]
            const borrowBalance = assetOut?.compoundV3Data[chainId][baseAsset].userData?.borrowBalance ?? '0'
            const userDeposit = assetIn?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0'

            try {
              // assign debt balances
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(
                  currencyIn,
                  userDeposit
                ),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                  currencyOut,
                  borrowBalance
                ),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: undefined,
                [Field.OUTPUT]: undefined
              }
            }
          }
          case MarginTradeType.Collateral: {
            const assetIn = asset0
            const assetOut = asset1
            // get ccys
            const [currencyIn, currencyOut] =
              String(asset0.id) === token0.symbol ? [token0, token1] : [token1, token0]

            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                currencyIn,
                assetIn?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0'
              ),
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                currencyOut,
                assetOut?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0'
              ),
            }
          }

          case MarginTradeType.Borrow: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined
            // the input is the borrowed amount, the output the received amount
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.compoundV3Data[chainId][baseAsset]?.userData?.borrowBalance ?? '0'
              ),
              [Field.OUTPUT]: selectedCurrencyAmount,
            }
          }

          case MarginTradeType.Supply: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined
            // the input is the user-selected currency and amount
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.compoundV3Data[chainId][baseAsset]?.userData?.supplyBalance ?? '0'
              ),
            }
          }

          case MarginTradeType.Withdraw: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            // the input is the deposited currency amount
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.compoundV3Data[chainId][baseAsset]?.userData?.balance ?? '0'
              ),
              [Field.OUTPUT]: selectedCurrencyAmount,
            }
          }

          case MarginTradeType.Repay: {
            const selectedCurrencyAmount = account
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            // input is user token amount, output is debt to be repaid
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                token0,
                asset0?.compoundV3Data[chainId][baseAsset]?.userData?.borrowBalance ?? '0'
              ),
            }
          }
          default:
            return {
              [Field.INPUT]: undefined,
              [Field.OUTPUT]: undefined
            }
        }

      }

      // compound V2 -> account has to be the 1delta abstract account
      // wallet does not mtter as the input is directly a wallet balance that has a currency attached to it
      case LendingProtocol.COMPOUND: {
        switch (marginTradeType) {
          case MarginTradeType.Open: {
            const [assetIn, assetOut, currencyIn, currencyOut] = switchOpen
              ? [asset1, asset0, token1, token0]
              : [asset0, asset1, token0, token1]
            console.log(assetIn, assetOut, account)
            const cTokenBal = ethers.BigNumber.from(
              assetOut?.compoundData[chainId].userData[account ?? '']?.balanceOf ?? '0'
            )
            console.log(cTokenBal)
            const underlyingDeposited = cTokenBal
              .mul(assetOut?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
              .div(ONE_18)
            try {
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(
                  currencyIn,
                  assetIn?.compoundData[chainId].userData[account ?? '']?.borrowBalanceCurrent ?? '0'
                ),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(currencyOut, underlyingDeposited.toString() ?? '0'),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: undefined,
                [Field.OUTPUT]: undefined,
              }
            }
          }
          case MarginTradeType.Trim: {
            const assetIn = asset0
            const assetOut = asset1
            // for trimming, we swap from the collateral to repay a borrow: ccyIn is on the collateral side
            const [currencyIn, currencyOut] = [token0, token1]
            const cTokenBal = ethers.BigNumber.from(
              assetIn?.compoundData[chainId].userData[account ?? '']?.balanceOf ?? '0'
            )
            const underlyingDeposited = cTokenBal
              .mul(assetIn?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
              .div(ONE_18)
            try {
              // assign debt balances
              return {
                [Field.INPUT]: CurrencyAmount.fromRawAmount(currencyIn, underlyingDeposited.toString()),
                [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
                  currencyOut,
                  assetOut?.compoundData[chainId].userData[account ?? '']?.borrowBalanceCurrent ?? '0'
                ),
              }
            } catch (error) {
              console.log(error)
              return {
                [Field.INPUT]: undefined,
                [Field.OUTPUT]: undefined,
              }
            }
          }

          case MarginTradeType.Collateral: {
            const assetIn = asset0
            const assetOut = asset1
            // get ccys
            const [currencyIn, currencyOut] = [token0, token1]
            // the input is the deposited currency amount
            const cTokenInBal = ethers.BigNumber.from(
              assetIn?.compoundData[chainId].userData[account ?? '']?.balanceOf ?? '0'
            )
            const underlyingInDeposited = cTokenInBal
              .mul(assetIn?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
              .div(ONE_18)
            const cTokenOutBal = ethers.BigNumber.from(
              assetOut?.compoundData[chainId].userData[account ?? '']?.balanceOf ?? '0'
            )
            const underlyingOutDeposited = cTokenOutBal
              .mul(assetOut?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
              .div(ONE_18)

            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(currencyIn, underlyingInDeposited.toString()),
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(currencyOut, underlyingOutDeposited.toString()),
            }
          }
          case MarginTradeType.Debt: {
            const assetIn = asset0
            const assetOut = asset1
            const [currencyIn, currencyOut] = [token0, token1]
            // we see which debt the user owns and assign it if there is any of a specific type
            // if the input type  has not type (NONE), it shall be editable by the user
            const debtIn = ethers.BigNumber.from(
              assetIn?.compoundData[chainId].userData[account ?? '']?.borrowBalanceCurrent ?? '0'
            )

            const debtOut = ethers.BigNumber.from(
              assetOut?.compoundData[chainId].userData[account ?? '']?.borrowBalanceCurrent ?? '0'
            )

            // assign debt balances
            return {
              [Field.INPUT]: CurrencyAmount.fromRawAmount(currencyIn, debtIn.toString()),
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(currencyOut, debtOut.toString()),
            }
          }
          case MarginTradeType.Borrow: {
            const selectedCurrencyAmount = Boolean(userBalance)
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            let borrowBalance = '0'
            if (account) {
              borrowBalance = asset0?.compoundData[chainId].userData[account]?.borrowBalanceCurrent
            }
            // the input is the borrowed amount, the output the received amount
            return {
              [Field.OUTPUT]: selectedCurrencyAmount,
              [Field.INPUT]: CurrencyAmount.fromRawAmount(token0, borrowBalance),
            } as MappedCurrencyAmounts
          }

          case MarginTradeType.Supply: {
            const selectedCurrencyAmount = Boolean(userBalance)
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            let underlyingDeposited = ZERO_BN
            if (account) {
              const cTokenBal = ethers.BigNumber.from(
                asset0?.compoundData[chainId].userData[account]?.balanceOf ?? '0'
              )
              underlyingDeposited = cTokenBal
                .mul(asset0?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
                .div(ONE_18)
            }
            // the input is the user-selected currency and amount
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(token0, underlyingDeposited.toString()),
            } as MappedCurrencyAmounts

          }

          case MarginTradeType.Withdraw: {
            const selectedCurrencyAmount = Boolean(userBalance)
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            let underlyingDeposited = ZERO_BN
            if (account) {
              const cTokenBal = ethers.BigNumber.from(
                asset0?.compoundData[chainId].userData[account]?.balanceOf ?? '0'
              )
              underlyingDeposited = cTokenBal
                .mul(asset0?.compoundData[chainId].reserveData.exchangeRateCurrent ?? '0')
                .div(ONE_18)
            }

            // the input is the deposited currency amount
            return {
              [Field.OUTPUT]: selectedCurrencyAmount,
              [Field.INPUT]: CurrencyAmount.fromRawAmount(token0, underlyingDeposited.toString()),
            } as MappedCurrencyAmounts
          }

          case MarginTradeType.Repay: {
            const selectedCurrencyAmount = Boolean(userBalance)
              ? userBalance
              : token1
                ? CurrencyAmount.fromRawAmount(token1, '0')
                : undefined

            let borrowBalance = '0'
            if (account) {
              borrowBalance = asset0?.compoundData[chainId].userData[account]?.borrowBalanceCurrent
            }

            // input is user token amount, output is debt to be repaid
            return {
              [Field.INPUT]: selectedCurrencyAmount,
              [Field.OUTPUT]: CurrencyAmount.fromRawAmount(token0, borrowBalance),
            } as MappedCurrencyAmounts
          }
        }
      }

      default:
        return {
          [Field.INPUT]: undefined,
          [Field.OUTPUT]: undefined
        }
    }
  }
    , [
      account,
      asset0,
      asset1,
      token0,
      token1,
      protocol,
      marginTradeType,
      selectedBorrowInterestMode0,
      selectedBorrowInterestMode1,
      chainId,
    ])
}



interface BalanceText {
  textTop: string
  textBottom: string
  plusTop: boolean
  plusBottom: boolean
  hasSwitchTop: boolean
  hasSwitchBottom: boolean
}

const defaultText = {
  textTop: '',
  textBottom: '',
  plusTop: true,
  plusBottom: true,
  hasSwitchTop: false,
  hasSwitchBottom: false
}

export const useBalanceText = (
  protocol: LendingProtocol,
  tradeType: OneDeltaTradeType,
  marginTradeType: MarginTradeType,
  interestRateTop: AaveInterestMode,
  interestRateBottom: AaveInterestMode
): BalanceText => {

  switch (marginTradeType) {
    case MarginTradeType.Open: {

      return {
        textTop: protocol === LendingProtocol.AAVE ? (interestRateTop === AaveInterestMode.STABLE
          ? 'Your stable position'
          : 'Your variable short position') : 'Your position',
        textBottom: 'Your long position',
        plusTop: false,
        plusBottom: true,
        hasSwitchTop: true,
        hasSwitchBottom: false
      }
    }
    case MarginTradeType.Trim: {

      return {
        textTop: 'Your long position',
        textBottom: protocol === LendingProtocol.AAVE ? (interestRateTop === AaveInterestMode.STABLE
          ? 'Your stable short position'
          : 'Your variable short position') : 'Your position',
        plusTop: true,
        plusBottom: false,
        hasSwitchTop: false,
        hasSwitchBottom: true
      }
    }


    case MarginTradeType.Collateral: {
      return {
        textTop: ' Your long position',
        textBottom: 'Your long position',
        plusTop: true,
        plusBottom: true,
        hasSwitchTop: false,
        hasSwitchBottom: false
      }
    }
    case MarginTradeType.Debt: {
      return {
        textTop: interestRateTop === AaveInterestMode.STABLE
          ? 'Your stable position'
          : interestRateTop === AaveInterestMode.VARIABLE
            ? 'Your variable position'
            : ' No position of any kind',
        textBottom: interestRateBottom === AaveInterestMode.STABLE
          ? 'Your stable position'
          : interestRateBottom === AaveInterestMode.VARIABLE
            ? 'Your variable position'
            : ' No position of any kind',
        plusTop: false,
        plusBottom: false,
        hasSwitchTop: true,
        hasSwitchBottom: true
      }
    }
    default:
      return defaultText
  }
}