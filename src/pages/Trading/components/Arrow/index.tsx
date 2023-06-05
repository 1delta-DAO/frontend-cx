import { default as arrowUp } from 'assets/svg/arrow-up-dotted.svg'
import React from "react";
import styled from "styled-components";

const Image = styled.img<{ size: number, isUp: boolean }>`
  width:  ${({ size }) => size}px;
  height:  ${({ size }) => size}px;
  transform: rotate(${({ isUp }) => isUp ? 0 : 180}deg);
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
