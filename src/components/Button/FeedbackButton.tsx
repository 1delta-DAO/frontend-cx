import React from 'react'
import styled from 'styled-components/macro'
import { Z_INDEX } from 'theme/zIndex'
import { default as feedbackSvg } from '../../assets/svg/feedback.svg'


const PopoverButton = styled.button`
background-color: transparent;
  opacity: 0.9;
  position: fixed;
  width: 40px;
  height: 40px;
  bottom: 10px;
  left: 10px;
  border-radius: 100%;
  border: 0rem solid;
  z-index: ${Z_INDEX.modal}
`

const FeedbackIcon = styled.img`
   width: 30px;
   height: 100%;
   filter: invert( ${({ theme }) => theme.darkMode ? 100 : 0}%);
   :hover{
    opacity: 0.8;
    transform: scale(1.05);
    cursor: pointer; 
   }
`

export default function FeedbackButton() {
  return (<PopoverButton
    data-tally-open="wbZRJg" data-tally-layout="modal" data-tally-emoji-animation="wave">
    <FeedbackIcon src={feedbackSvg} />
  </PopoverButton>)
} 