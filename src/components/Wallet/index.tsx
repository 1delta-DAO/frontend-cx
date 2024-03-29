import { default as walletIcon } from 'assets/svg/wallet-icon-3.svg'
import { default as moneyIcon } from 'assets/svg/money-icon.svg'
import { default as borrowIcon } from 'assets/svg/borrow-icon.svg'
import { default as borrowIcon2 } from 'assets/svg/borrow-icon-2.svg'
import { default as switchCircle } from 'assets/svg/switch-circle.svg'
import React from "react";
import styled from "styled-components";

const Image = styled.img<{ size: number }>`
  width:  ${({ size }) => size}px;
  height:  ${({ size }) => size}px;
`

interface WalletProps {
  size: number
}

const WalletIcon: React.FC<WalletProps> = ({ size }: WalletProps) => {
  return (
    <Image src={walletIcon} size={size} />
  );
};

export default WalletIcon;


export const MoneyIcon: React.FC<WalletProps> = ({ size }: WalletProps) => {
  return (
    <Image src={moneyIcon} size={size} />
  );
};


export const BorrowIcon: React.FC<WalletProps> = ({ size }: WalletProps) => {
  return (
    <Image src={borrowIcon} size={size} />
  );
};

export const BorrowIcon2: React.FC<WalletProps> = ({ size }: WalletProps) => {
  return (
    <Image src={borrowIcon2} size={size} />
  );
};


export const SwitchCircle: React.FC<WalletProps> = ({ size }: WalletProps) => {
  return (
    <Image src={switchCircle} size={size} />
  );
};
