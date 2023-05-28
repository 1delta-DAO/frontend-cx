import { default as arrowUp } from 'assets/svg/arrow-up-dotted.svg'
import React from "react";
import styled from "styled-components";

const Image = styled.img<{ size: number, isUp: boolean }>`
  width:  ${({ size }) => size}px;
  height:  ${({ size }) => size}px;
  transform: rotate(${({ isUp }) => isUp ? 0 : 180}deg);
  filter: ${({ theme }) => theme.darkMode ? 'invert(45%) sepia(75%) saturate(680%) hue-rotate(190deg) brightness(96%) contrast(106%);' :
    'invert(20%) sepia(51%) saturate(4056%) hue-rotate(313deg) brightness(91%) contrast(101%);'}
`

interface ArrowProps {
  size: number
  isUp: boolean
}


export const ArrowDotted: React.FC<ArrowProps> = ({ size, isUp }: ArrowProps) => {
  return (
    <Image src={arrowUp} size={size} isUp={isUp} />
  );
};
