
import { MouseoverTooltip } from 'components/Tooltip';
import React, { FC, useState } from 'react';
import { HelpCircle } from 'react-feather';
import styled from 'styled-components';
import { Z_INDEX } from 'theme/zIndex';


export enum DepositMode {
  DIRECT = 'Direct',
  TO_COLLATERAL = 'Swap to collateral',
  TO_USDC = 'Swap to USDC'
}

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 120px;
  z-index: 1;
`;

const DropdownButton = styled.button<{ isOpen: boolean }>`
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};;
  background: none;
  color: ${({ theme }) => theme.textSecondary};
  height: 25px;
  border-radius: 4px;
  font-size: 12px;
  width: 140px;
  font-weight: 200;
  cursor: pointer;
  :hover & {
    display: block;
    border-bottom: none;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
  ${({ isOpen }) => isOpen ? `
  border-bottom: none;
  border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  ` : ''}
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};
  background-color: #060707;
  position: absolute;
  color: ${({ theme }) => theme.textSecondary};
  border-radius: 4px;
  width: 140px;
  font-size: 12px;
  font-weight: 200;
  cursor: pointer;
  backdrop-filter: blur(10px);
  z-index: ${Z_INDEX.modal};
  backdrop-filter: blur(10px);
  overflow-x: hidden;
  overflow-y: hidden;
  :hover & {
    display: block;
    border-top: none;
  }
  ${({ isOpen }) => isOpen ? `
  border-top: none;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  ` : ''}
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 100px;
  min-width: 100px;
`};
`;

const DropdownItem = styled.div`
  width: 140px;
  height: 20px;
  margin-left: 10px;
  display: block;
  color: ${({ theme }) => theme.textSecondary};
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
  font-size: 12px;
  font-weight: 200;
    border-top: none;
  &:first-child{
  margin-top: 5px;
  }
  &:last-child {
    border-bottom: none;
  }
  z-index: ${Z_INDEX.modal}
`;

interface DepositTypeSelectionProps {
  selectedOption: DepositMode
  options: DepositMode[]
  onSelect: (option: DepositMode) => void
}

const HelpCircleIconRaw = styled(HelpCircle)`
  justify-self: center;
  align-self: center;
  height: 15px;
  width: 15px;
  margin-top: 3px;
  margin-left: 5px;
  color: ${({ theme }) => theme.backgroundOutline};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 18px;
  height: 18px;
`};
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;  
`

const Text = styled.div`
  margin :1px;
  display: flex;
  justify-content:center;
  align-items: center;  

`

interface HelpCicleProps {
  text: string
}

const HelpCircleIcon = ({ text }: HelpCicleProps) => {
  return (
    <MouseoverTooltip text={text} >
      <HelpCircleIconRaw alignmentBaseline="middle" />
    </MouseoverTooltip>
  )
}

const dropdownDisabled = true

const DepositTypeDropdown = ({ selectedOption, onSelect, options }: DepositTypeSelectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContainer>
      <DropdownButton onClick={() => options.length > 1 && !dropdownDisabled && setIsOpen(!isOpen)} isOpen={isOpen}>
        <Row>
          <Text>
            {selectedOption}
          </Text>
          <HelpCircleIcon text={selectedOption === DepositMode.DIRECT ? 'Supplies your pay currency directly' : 'Converts your pay currency to the collateral currency'} />
        </Row>
      </DropdownButton>
      <DropdownContent isOpen={isOpen}>
        {options.filter(x => x !== selectedOption).map(option => (
          <DropdownItem key={option} onClick={() => {
            onSelect(option);
            setIsOpen(false);
          }}>
            {option}
          </DropdownItem>
        ))}
      </DropdownContent>
    </DropdownContainer>
  );
};

export default DepositTypeDropdown;
