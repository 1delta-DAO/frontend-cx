import { useMemo } from "react"
import { Field, MarginTradeType } from "types/1delta"


export const useOrganizeFieldsMoneyMarket = (poolInteraction: MarginTradeType):
  [Field.OUTPUT, Field.INPUT] | [Field.INPUT, Field.OUTPUT] => {

  return useMemo(() => {
    if (poolInteraction === MarginTradeType.Borrow) return [Field.OUTPUT, Field.INPUT]

    if (poolInteraction === MarginTradeType.Supply) return [Field.INPUT, Field.OUTPUT]

    if (poolInteraction === MarginTradeType.Withdraw) return [Field.OUTPUT, Field.INPUT]

    // last case is repay
    return [Field.INPUT, Field.OUTPUT]
  }, [poolInteraction])

}