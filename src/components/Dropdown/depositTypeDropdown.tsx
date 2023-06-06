
import React, { FC, useState } from 'react';
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
  z-index: 99999999;
`;


const DropdownBg = styled.div`
  position: absolute;  
  display: none;
  border-radius: 10px;
  position: absolute;
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ theme }) => theme.deprecated_bg2};
  backdrop-filter: blur(10px);
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 120px;
  min-width: 120px;
`};
`;

const DropdownButton = styled.button<{ isOpen: boolean }>`
  border: 1px solid ${({ theme }) => theme.deprecated_bg3};;
  background: none;
  color: ${({ theme }) => theme.textSecondary};
  height: 20px;
  border-radius: 4px;
  font-size: 12px;
  width: 120px;
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
  height: 20px;
  border-radius: 4px;
  width: 120px;
  font-size: 12px;
  font-weight: 200;
  cursor: pointer;
  backdrop-filter: blur(10px);
  z-index: ${Z_INDEX.modal};
  backdrop-filter: blur(10px);
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
  width: 120px;
  padding: 4px;
  display: block;
  color: ${({ theme }) => theme.textSecondary};
  border-top-right-radius: 0px;
  border-top-left-radius: 0px;
    border-top: none;
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

const DepositTypeDropdown = ({ selectedOption, onSelect, options }: DepositTypeSelectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContainer>
      <DropdownButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        {selectedOption}
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
