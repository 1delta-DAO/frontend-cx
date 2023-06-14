import React from 'react'
import { MouseoverTooltip } from "components/Tooltip";
import styled from 'styled-components/macro'
import { HelpCircle } from "react-feather";

const HelpCircleIconRaw = styled(HelpCircle)`
  width: 20px;
  height: 20px;
  justify-self: center;
  align-self: center;
  margin-left: 5px;
  color: ${({ theme }) => theme.backgroundOutline};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 18px;
  height: 18px;
`};
`

export default function HelpCircleIcon(text: string): React.ReactNode {
  return (
    <MouseoverTooltip text={text}>
      <HelpCircleIconRaw alignmentBaseline="middle" />
    </MouseoverTooltip>
  )
}