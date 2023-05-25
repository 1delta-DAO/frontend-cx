import styled, { css, useTheme } from 'styled-components/macro'

export const ArrowContainer = styled.div`
  display: inline-block;
`
export const ArrowDownWrapper = styled.div`
  margin-top: -80%;
  margin-left: 24%;
`
export const ArrowUpWrapper = styled.div`
  margin-left: 56%;
  margin-top: -18%;
`

export const InputWrapper = styled.div<{ redesignFlag: boolean }>`
  width: 100%;
  visibility: ${({ redesignFlag }) => !redesignFlag && 'none'};
  ${({ redesignFlag }) =>
    redesignFlag &&
    css`
      background-color: ${({ theme }) => theme.backgroundModule};
      border-radius: 12px;
      padding: 16px;
      color: ${({ theme }) => theme.textSecondary};
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
    `}
`

export const InputWrapperCompound = styled.div<{ redesignFlag: boolean }>`
  width: 100%;
  visibility: ${({ redesignFlag }) => !redesignFlag && 'none'};
  ${({ redesignFlag }) =>
    redesignFlag &&
    css`
      background-color: ${({ theme }) => theme.backgroundModule};
      border-radius: 12px;
      justify-content: center;
      align-items: center;
      padding: 16px;
      color: ${({ theme }) => theme.textSecondary};
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
    `}
`
