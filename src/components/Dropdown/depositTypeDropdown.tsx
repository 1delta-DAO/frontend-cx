
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
  border-radius: 10px;
  width: 180px;
  z-index: 99999999;
`;


const DropdownBg = styled.div`
  position: absolute;  
  display: none;
  border-radius: 10px;
  position: absolute;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  padding: 12px 16px;
  cursor: pointer;
  background: ${({ theme }) => theme.deprecated_bg6};
  backdrop-filter: blur(10px);
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 160px;
  min-width: 160px;
`};
`;

const DropdownButton = styled.button`
  background-color: ${({ theme }) => theme.deprecated_bg3};
  color: white;
  border-radius: 4px;
  font-size: 16px;
  border: none;
  cursor: pointer;
`;

const DropdownContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  border-radius: 10px;
  position: absolute;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: ${Z_INDEX.modal}
  padding: 12px 16px;
  cursor: pointer;

  backdrop-filter: blur(10px);
  ${DropdownContainer}:hover & {
    display: block;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 100px;
  min-width: 100px;
`};
`;

const DropdownItem = styled.a`
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  min-width: 160px;
  display: block;
  color: ${({ theme }) => theme.textSecondary};
  &:hover {background-color: #ddd;}
  z-index: ${Z_INDEX.modal}
`;

interface DepositTypeSelectionProps {
  selectedOption: DepositMode
  onSelect: (option: DepositMode) => void
}

const DepositTypeDropdown = ({ selectedOption, onSelect }: DepositTypeSelectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContainer>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        {selectedOption}
      </DropdownButton>
      <DropdownContent isOpen={isOpen}>
        <DropdownBg />
        {Object.values(DepositMode).filter(x => x !== selectedOption).map(option => (
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
