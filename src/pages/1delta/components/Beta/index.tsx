import styled from "styled-components"

const FlagBox = styled.div`
  width: 25px;
  height: 7px;
  background: ${({ theme }) => theme.deprecated_bg3};
  font-size: 6px;
  opacity: 0.6;
  letter-spacing: 0.1rem;
  border-radius: 5px;
  text-align: center;
  text-justify: center;
  color: ${({ theme }) => theme.textPrimary};
  vertical-align: middle;
  padding: 0.01rem;
`

export const BetaBanner = () => {
  return (
    <FlagBox>
      BETA
    </FlagBox>
  )
}

export const BetaContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  justify-content: flex-end;
  margin-top: 35px;
  margin-left: 30px;
`