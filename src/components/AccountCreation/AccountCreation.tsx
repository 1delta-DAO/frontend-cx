import { ButtonLight } from 'components/Button'
import { PageWrapper } from 'components/swap/styleds'
import { TextInput } from 'components/TextInput'
import React from 'react'
import { ThemedText } from 'theme'
import styled from 'styled-components/macro'
import { ETHEREUM_CHAINS, LOGO_ACCOUNT_SVG } from 'constants/1delta'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import Loader from 'components/Loader'
import Card from 'components/Card'
import { BarChart2, CheckCircle, DollarSign, FileText, Key } from 'react-feather'

const TextInputRow = styled.div<{ redesignFlag?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;
  height: 42px;
  justify-content: center;
  width: 100%;
  background-color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentActionSoft : theme.deprecated_primary5)};
  color: ${({ theme, redesignFlag }) => (redesignFlag ? theme.accentAction : theme.deprecated_primaryText1)};
  font-size: ${({ redesignFlag }) => (redesignFlag ? '20px' : '16px')};
  font-weight: ${({ redesignFlag }) => (redesignFlag ? '600' : '500')};
`

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 30px;
  height: 50px;
  justify-content: flex-start;
  width: 100%;
`

const Col = styled(Card)`
  background: ${({ theme }) => theme.deepShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px
`

const RowWithIcon = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
`

const TextWrapper = styled.div`
  margin-right: 5px;
`

const BaseRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const TextPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 90px;
  height: 60px;
  justify-content: center;
  width: 100%;
  background-color: ${({ theme }) => theme.deprecated_bg1};
`
// border-left: 3px solid ${({ theme }) => theme.deprecated_white};

const Banner = styled.img`
  margin-left: 20px;
  width: 15px;
  height: 15px;
  opacity: 0.6;
`


const EmphasizedText = styled.span`
  color:  ${({ theme }) => theme.textEmphasized};
`


const StyledBarChart2 = styled(BarChart2)`
  stroke:  ${({ theme }) => theme.textEmphasized};
`

const StyledDollarSign = styled(DollarSign)`
  stroke:  ${({ theme }) => theme.textEmphasized};
`

const StyledFileText = styled(FileText)`
  stroke:  ${({ theme }) => theme.textEmphasized};
`

const StyledKey = styled(Key)`
  stroke:  ${({ theme }) => theme.textEmphasized};
`

const StyledCheckCircle = styled(CheckCircle)`
  stroke:  ${({ theme }) => theme.textEmphasized};
`

interface CreationProps {
  accountCreationPending: boolean
  setAccountModalVisible: (t: boolean) => void
  accountCreationHash: string
  showConfirmModal: boolean
  setShowConfirmModal: (t: boolean) => void
  triggerTransaction: boolean
  chainId: number
  isMobile: boolean
  redesignFlag?: boolean
  account: string
  textInput: string
  typeText: (text: string) => void
  handleCreateAccount: () => any
}

const AccountIsCreating = (): React.ReactNode => {
  return (
    <ThemedText.MediumHeader textAlign={'center'} padding="5px" fontSize="14px" width="80%">
      Your Account is being created!
    </ThemedText.MediumHeader>
  )
}

export default function AccountCreation({
  accountCreationPending,
  setAccountModalVisible,
  accountCreationHash,
  showConfirmModal,
  setShowConfirmModal,
  triggerTransaction,
  chainId,
  isMobile,
  redesignFlag,
  textInput,
  typeText,
  handleCreateAccount,
}: CreationProps) {
  const isEthereum = ETHEREUM_CHAINS.includes(chainId)
  return (
    <>
      <PageWrapper redesignFlag={Boolean(redesignFlag)} navBarFlag={false}>
        <TransactionConfirmationModal
          isOpen={showConfirmModal}
          onDismiss={() => {
            setShowConfirmModal(false)
            setAccountModalVisible(false)
          }}
          attemptingTxn={triggerTransaction}
          hash={accountCreationHash}
          content={AccountIsCreating}
          pendingText={'pendingText'}
        />
        <Col>
          <RowWithIcon>
            {/* <BarChart2 style={{ marginRight: '10px' }} /> */}
            <ThemedText.MediumHeader textAlign={'center'} marginBottom="15px" fontSize="16px" width="95%" fontWeight={'bold'}>
              Create a {<EmphasizedText>1delta Account</EmphasizedText>} that allows you to trade on top of the {isEthereum ? 'Compound' : '0VIX'
              } protocol!
            </ThemedText.MediumHeader>
          </RowWithIcon>
          <RowWithIcon>
            <StyledDollarSign />
            <ThemedText.MediumHeader textAlign={'left'} marginBottom="15px" fontSize="14px" width="85%">
              Creation only costs you some minor gas fees
            </ThemedText.MediumHeader>
          </RowWithIcon>
          <RowWithIcon>
            <StyledFileText />
            <ThemedText.MediumHeader textAlign={'left'} marginBottom="15px" fontSize="14px" width="85%">
              Your account is a smart contract that that allows you to execute complex trades on DEXs and lending protocols
            </ThemedText.MediumHeader>
          </RowWithIcon>
          <RowWithIcon>
            <StyledKey />
            <ThemedText.MediumHeader textAlign={'left'} marginBottom="15px" fontSize="14px" width="85%">
              You are the owner and the only one who can control this contract
            </ThemedText.MediumHeader>
          </RowWithIcon>
          <RowWithIcon>
            <StyledCheckCircle />
            <ThemedText.MediumHeader textAlign={'left'} fontSize="14px" width="85%">
              You can create as many accounts as you want
            </ThemedText.MediumHeader>
          </RowWithIcon>
        </Col>
        <TextInputRow redesignFlag={Boolean(redesignFlag)}>
          <Row>
            <Banner src={LOGO_ACCOUNT_SVG} />
            <ThemedText.MediumHeader
              textAlign={'left'}
              fontSize="10px"
              width="100%"
              marginLeft="10px"
              style={{ letterSpacing: '0.1rem' }}
              fontWeight="bold"
            >
              ACCOUNT NAME:
            </ThemedText.MediumHeader>
          </Row>
          <TextPanelContainer>
            <TextInput
              placeholder=""
              className="text"
              value={textInput}
              onUserInput={(x: string) => typeText(x)}
              fontSize="16px"
            />
          </TextPanelContainer>
        </TextInputRow>
        <ButtonLight onClick={handleCreateAccount} marginTop={'10px'} disabled={accountCreationPending}>
          <BaseRow>
            <TextWrapper>{accountCreationPending ? 'Creating' : 'Create'} A New Account</TextWrapper>
            {accountCreationPending && <Loader stroke={'white'} redesignFlag />}
          </BaseRow>
        </ButtonLight>
      </PageWrapper>
    </>
  )
}
