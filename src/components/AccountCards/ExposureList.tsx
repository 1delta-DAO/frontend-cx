import { TOKEN_SVGS } from "constants/1delta"
import { useAssetIds } from "state/1delta/hooks"
import styled from "styled-components"



const Col = styled.div`
  width: 50%;
  display: flex;
  flex-direction:column;
  justify-content: space-between;
`


const Row = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: space-between;
  min-height: 50px;
  margin-bottom: 10px;
`


const BaseText = styled.div`
color: ${({ theme }) => theme.textTertiary};
font-size: 12px;
font-weight: 700;
height: 12px;
letter-spacing: 0.1rem;
margin-top: 2px;
margin-right: 15px;
width: 100%;
`

const HeaderLeft = styled(BaseText)`
  text-align: left;

`

const HeaderRight = styled(BaseText)`
  text-align: right;
`


const IconContainerLeft = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: flex-start;
  margin-left: 20px;
`

const IconContainerRight = styled.div`
  display: flex;
  flex-direction:row;
  justify-content: flex-end;
  margin-right: 20px;
`

const Image = styled.img`
width: 25px;
height: 25px;
`

interface ExposureListProps {

  chainId: number
}

export const ExposureList = ({ chainId }: ExposureListProps) => {

  const assets = useAssetIds(chainId)
  return <>
    <Row>
      {assets.assetsLong.length > 0 &&
        <Col>
          <HeaderLeft>
            Long Positions
          </HeaderLeft>
          <IconContainerLeft>
            {assets.assetsLong.map((a, i) =>
              <Image src={TOKEN_SVGS[a]} key={String(a)} style={{ marginLeft: `-${5}px` }} />)
            }
          </IconContainerLeft>
        </Col>}
      {/* <SeparatorLine isColumn={false} /> */}
      {assets.assetsShort.length > 0 && <Col>
        <HeaderRight>
          Short Positions
        </HeaderRight>
        <IconContainerRight>
          {assets.assetsShort.map((a, i) =>
            <Image src={TOKEN_SVGS[a]} key={String(a)} style={{ marginLeft: `-${5}px` }} />
          )}
        </IconContainerRight>
      </Col>}
    </Row></>

}