import { ButtonGray } from 'components/Button';
import { darken } from 'polished';
import React, { useState } from 'react';
import { ChevronDown } from 'react-feather';
import styled from 'styled-components';

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 10px;
`;


const DropdownContent = styled.div`
  display: none;
  border-radius: 10px;
  position: absolute;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
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
  ${DropdownContainer}:hover & {
    display: block;
  }
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  max-width: 100px;
  min-width: 100px;
`};
`;


const CurrencySelect = styled(ButtonGray) <{
  visible: boolean
  selected: boolean
  hideInput?: boolean
  disabled?: boolean
  redesignFlag: boolean
}>`
  align-items: center;
  border: 1px solid red;
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  color: ${({ selected, theme }) => (selected ? theme.deprecated_text1 : theme.deprecated_white)};
  cursor: pointer;
  height: ${({ hideInput, redesignFlag }) => (redesignFlag ? 'unset' : hideInput ? '2.8rem' : '2.4rem')};
  border-radius: 7px;
  outline: none;
  user-select: none;
  border: none;
  font-size: 24px;
  font-weight: 400;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: ${({ selected, redesignFlag }) =>
    redesignFlag ? (selected ? '4px 8px 4px 4px' : '6px 6px 6px 8px') : '0 8px'};
  gap: ${({ redesignFlag }) => (redesignFlag ? '8px' : '0px')};
  justify-content: space-between;
  margin-left: 2px;;
  border: 2px solid;
  border-color: ${({ theme }) => theme.backgroundInteractive};

  &:hover {
    background-color: ${({ selected, theme, redesignFlag }) =>
    redesignFlag
      ? theme.stateOverlayHover
      : selected
        ? darken(0.05, theme.deprecated_primary1)
        : theme.deprecated_bg3};
  }

  &:active {
    background-color: ${({ selected, theme, redesignFlag }) =>
    redesignFlag
      ? theme.stateOverlayPressed
      : selected
        ? darken(0.05, theme.deprecated_primary1)
        : theme.deprecated_bg3};
  }

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  width: 100px;
`};
`



interface DropdownProps {
  label: JSX.Element;
  children: JSX.Element[]
}

const Dropdown: React.FC<DropdownProps> = ({ label, children }) => {
  return (
    <DropdownContainer>
      <CurrencySelect visible selected redesignFlag>{label}<ChevronDown /></CurrencySelect>
      <DropdownBg />
      <DropdownContent>{children}</DropdownContent>
    </DropdownContainer>
  );
};

export default Dropdown;