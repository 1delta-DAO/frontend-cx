import React, { useState } from 'react';
import styled from 'styled-components';
import { useTransition, animated } from '@react-spring/web';
import { PreparedAssetData } from 'hooks/asset/useAssetData';
import { SupportedAssets } from 'types/1delta';
import { AnimatedTokenPositionIcon } from 'pages/1delta/components/TokenDetail';
import { formatSmallGeneralValue } from 'utils/tableUtils/format';
import { ThemedText } from 'theme';


const TableContainer = styled.div`
  width: 100%;
  height: 100%;
  max-height: 600px;
  border-radius: 20px;
  overflow-y: scroll;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;


const TableHeader = styled.thead`
  background-color:${({ theme }) => theme.deprecated_bg0};
`;

const TableBody = styled.tbody``;

const HeaderRow = styled.tr`
cursor: pointer;
background:${({ theme }) => theme.deprecated_bg0};
`;

const HeaderItem = styled.th`
padding: 0.1rem;
padding-left: 0.5rem;
height: 25px;
`

const TableRow = styled.tr`
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.deprecated_bg2};
  border-top: 1px solid ${({ theme }) => theme.deprecated_bg2};
`;

const TableData = styled.td`
  height: 20px;
  padding: 0.1rem;

`;

const TableDataLeverage = styled.td`
  height: 20px;
  padding: 0.1rem;
  text-align: center;

`;


const TableDataAssetIcon = styled.td`
  height: 20px;
  width: 60px;
  padding: 0.1rem;

`;

const ExpandableRow = styled(animated.tr)`
  background-color: ${({ theme }) => theme.deprecated_bg1};
  height: 50px;
`;

const ExpandableCell = styled.td`
  padding: 0.1rem;

`;

const ExpandableCellContainerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ExpandableContent = styled.div`
  padding: 0.1rem;
`;

const TextRow = styled.div`
  width: 80%; 
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const HeaderText = styled(ThemedText.DeprecatedMediumHeader)`
  color: ${({ theme }) => theme.textPrimary};
  text-align: left;
  font-size: 16px;
  font-weight: 400;
`


interface Props {
  assetData: PreparedAssetData[];
  onAssetSelect: (asset: SupportedAssets) => void
}

const ExpandableTable: React.FC<Props> = ({ assetData, onAssetSelect }) => {
  const [expandedRow, setExpandedRow] = useState<SupportedAssets | null>(null);

  const transition = useTransition(expandedRow, {
    config: { duration: 200 },
    from: { opacity: 0, height: 0 },
    enter: { opacity: 1, height: 'auto' },
    leave: { opacity: 0, height: 0 },
  });

  const handleClick = (id: SupportedAssets) => {
    if (expandedRow === id) {
      setExpandedRow(null)
    } else {
      setExpandedRow(id);
      onAssetSelect(id)
    }
  };

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <HeaderRow>
            <HeaderItem>
              <HeaderText>
                Asset
              </HeaderText>
            </HeaderItem>
            <HeaderItem>
              <HeaderText>
                APR
              </HeaderText>
            </HeaderItem>
            <HeaderItem>
              <HeaderText>
                Leverage
              </HeaderText>
            </HeaderItem>
          </HeaderRow>
        </TableHeader>
        <TableBody>
          {assetData.map((row) => (
            <React.Fragment key={row.assetId}>
              <TableRow onClick={() => handleClick(row.assetId)}>
                <TableDataAssetIcon>
                  <AnimatedTokenPositionIcon asset={row.assetId} isMobile={false} />
                </TableDataAssetIcon>
                <TableData>{`${row.apr.toFixed(2)}%`}</TableData>
                <TableDataLeverage>{(1 / (1 - row.collateralFactor)).toFixed(2)}x</TableDataLeverage>
              </TableRow>
              {transition((style, item) =>
                item === row.assetId ? (
                  <ExpandableRow style={style}>
                    <ExpandableCell colSpan={3}>
                      <ExpandableCellContainerInner>
                        <TextRow>
                          <ExpandableContent>Deposits:</ExpandableContent>
                          <ExpandableContent>{formatSmallGeneralValue(row.userBalance)}</ExpandableContent>
                        </TextRow>
                        <TextRow>
                          <ExpandableContent>Variable Debt:</ExpandableContent>
                          <ExpandableContent>{formatSmallGeneralValue(row.userBorrow)}</ExpandableContent>
                        </TextRow>
                        {row.hasStable && <TextRow>
                          <ExpandableContent>Stable Debt:</ExpandableContent>
                          <ExpandableContent>{formatSmallGeneralValue(row.userBorrowStable)}</ExpandableContent>
                        </TextRow>}
                      </ExpandableCellContainerInner>
                    </ExpandableCell>
                  </ExpandableRow>
                ) : null,
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer >
  );
};

export default ExpandableTable