import { useMemo } from "react"
import { Field, MappedCurrencies, MappedCurrencyAmounts } from "types/1delta"
import { getWrappedNetworkCurrency } from "utils/1delta/wrappedNetworkCurrency"



export const useCurrencyInfo = (currencyAmounts: MappedCurrencyAmounts, fieldTop: Field, fieldBottom: Field, chainId: number) => {

  const currencies: MappedCurrencies = useMemo(
    () => ({
      [Field.INPUT]: currencyAmounts[Field.INPUT]?.currency,
      [Field.OUTPUT]: currencyAmounts[Field.OUTPUT]?.currency,
    }),
    [currencyAmounts]
  )

  const [inIsETH, outIsETH]: [boolean, boolean] = useMemo(() => {
    return [currencies[Field.INPUT]?.isNative ?? false, currencies[Field.OUTPUT]?.isNative ?? false]
  }, [chainId, currencies])

  const [outsideIsETH, insideIsWETH]: [boolean, boolean] = useMemo(() => {
    return [
      currencies[fieldTop]?.isNative ?? false,
      currencies[fieldBottom]?.equals(getWrappedNetworkCurrency(chainId)) ?? false,
    ]
  }, [chainId, currencies, fieldTop, fieldBottom])


  return {
    currencies,
    inIsETH,
    outIsETH,
    outsideIsETH,
    insideIsWETH
  }

}