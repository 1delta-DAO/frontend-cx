import { TOKEN_SVGS } from "constants/1delta";
import { useOutsideAlerter } from "hooks/useOutsideClick";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Z_INDEX } from "theme/zIndex";
import { SupportedAssets } from "types/1delta";

export interface SearchOption {
  label: any;
}

interface DropdownProps {
  selectedOption: [SupportedAssets, SupportedAssets] | undefined;
  options: [SupportedAssets, SupportedAssets][];
  onSelect: (option: [SupportedAssets, SupportedAssets]) => void;
  placeholder: string
}

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1;
`;


const DropdownInput = styled.input`
  width: 100px;
  font-size: 14px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.deprecated_text1};
`;

const DropdownList = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  padding: 0;
  opacity: 0.9;
  margin: 0;
  background: ${({ theme }) => theme.deprecated_bg6};
  backdrop-filter: blur(10px);
  border-top: none;
  border-radius: 5px;
  z-index: ${Z_INDEX.modal};
`;


const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const RowPair = styled.div`
  padding: 1px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  &:hover {
    cursor: pointer;
  }
`


interface PairRowProps {
  asset: [SupportedAssets, SupportedAssets]
  onSelect: (a: [SupportedAssets, SupportedAssets]) => any

}

const AssetText = styled.span`
  margin-right: 5px;
  font-size: 15px;
`

const Image = styled.img`
  width: 25px;
  height: 25px;
`

const ImageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-right: 5px;
  width: 50px;
  height: 25px;
`

const PairRow = ({ asset, onSelect }: PairRowProps): JSX.Element => {

  return <RowPair onClick={() => onSelect(asset)}>
    <ImageContainer>
      <Image src={TOKEN_SVGS[asset[0]]} key={String(asset[0])} />
      <Image src={TOKEN_SVGS[asset[1]]} key={String(asset[1])} style={{ marginLeft: '-10px' }} />
    </ImageContainer>
    <AssetText>
      {String(asset[0]) + "/" + String(asset[1])}
    </AssetText>
  </RowPair>
}

const parsePairString = (pair: [SupportedAssets, SupportedAssets] | undefined) => {
  if (!pair) return "-"
  return String(pair[0]) + "/" + String(pair[1])
}

export const PairSearchDropdown: React.FC<DropdownProps> = ({ selectedOption, options, onSelect, placeholder }) => {
  const [showAll, setShowAll] = useState(false)
  const [inputValue, setInputValue] = useState(parsePairString(selectedOption));
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setFilteredOptions(options) // if the list updates reset the options
    setInputValue(parsePairString(selectedOption))
  }, [options])


  useEffect(() => {
    setInputValue(parsePairString(selectedOption))
  }, [onSelect, selectedOption])

  const [close, setClose] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const filteredOptions = options.filter((option) =>
      parsePairString(option).toLowerCase().includes(inputValue.toLowerCase())
    );
    setInputValue(inputValue);
    setFilteredOptions(filteredOptions);
    setClose(false)
  };

  const handleOptionSelect = (option: [SupportedAssets, SupportedAssets]) => {
    setInputValue(parsePairString(option));
    onSelect(option);
    setClose(true)
  };

  const ref = useRef(null)
  useOutsideAlerter(ref, () => {
    setClose(true)
    setShowAll(false)
  })

  const ref2 = useRef(null)
  useOutsideAlerter(ref2, () => {
    setClose(true)
    setShowAll(false)
  })


  return (
    <DropdownWrapper ref={ref} onClick={() => setShowAll(!showAll)}>
      <Row key={String(selectedOption)}>
        <Image src={TOKEN_SVGS[selectedOption?.[0] ?? placeholder]} style={{ width: '25px' }} />
        <Image src={TOKEN_SVGS[selectedOption?.[1] ?? placeholder]} style={{ marginLeft: '-10px', width: '25px' }} />
        <DropdownInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </Row>
      {/* <DropdownListBg /> */}
      {(showAll || !close) && <DropdownList ref={ref2}>
        {(inputValue ?
          <>
            {filteredOptions.map((option) => (
              <PairRow onSelect={() => handleOptionSelect(option)} asset={option} key={String(option[0] + option[1])} />
            ))}
          </>

          : <>
            {options.map((option) => (
              <PairRow onSelect={() => handleOptionSelect(option)} asset={option} key={String(option[0] + option[1])} />
            ))
            }
          </>)}
      </DropdownList>}
    </DropdownWrapper>
  );
};


const SingleDropdownList = styled(DropdownList)`
  width: 110px;
`;


const SingleDropdownWrapper = styled(DropdownWrapper)`
  width: 50px;
`


interface SingleDropdownProps extends DropdownProps {
  isLong: boolean
}

export const SingleSearchDropdown: React.FC<SingleDropdownProps> = ({ isLong, selectedOption, options, onSelect, placeholder }) => {
  const [showAll, setShowAll] = useState(false)

  const [inputValue, setInputValue] = useState(selectedOption?.[isLong ? 0 : 1] ?? 'ASSET');

  const optionsAvailable = options.map(o => o[isLong ? 0 : 1]).filter(a => a !== SupportedAssets.USDC && a !== SupportedAssets.ETH).filter(onlyUnique)
  const [filteredOptions, setFilteredOptions] = useState(optionsAvailable);

  useEffect(() => {
    setFilteredOptions(optionsAvailable) // if the list updates reset the options
    setInputValue(selectedOption?.[isLong ? 0 : 1] ?? 'ASSET')
  }, [options, isLong, selectedOption])


  useEffect(() => {
    setInputValue(selectedOption?.[isLong ? 0 : 1] ?? 'ASSET')
  }, [onSelect, selectedOption, isLong])

  const [close, setClose] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const filteredOptions = optionsAvailable.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setInputValue(inputValue);
    setFilteredOptions(filteredOptions);
    setClose(false)
  };

  const handleOptionSelect = (option: [SupportedAssets, SupportedAssets]) => {
    setInputValue(parsePairString(option));
    onSelect(option);
    setClose(true)
  };

  const ref = useRef(null)
  useOutsideAlerter(ref, () => {
    setClose(true)
    setShowAll(false)
  })

  const ref2 = useRef(null)
  useOutsideAlerter(ref2, () => {
    setClose(true)
    setShowAll(false)
  })


  return (
    <SingleDropdownWrapper ref={ref} onClick={() => setShowAll(!showAll)}>
      <Row key={String(selectedOption)}>
        <Image src={TOKEN_SVGS[selectedOption?.[isLong ? 0 : 1] ?? placeholder]} style={{ width: '25px' }} />
        <DropdownInput
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </Row>
      {(showAll || !close) && <SingleDropdownList ref={ref2}>
        {(inputValue ?
          <>
            {filteredOptions.map((option) => (
              <AssetRow
                onSelect={() => handleOptionSelect(singleAssetToPair(option, isLong))}
                asset={singleAssetToPair(option, isLong)}
                key={String(option[0] + option[1])}
                isLong={isLong}
              />
            ))}
          </>

          : <>
            {optionsAvailable.map((option) => (
              <AssetRow
                onSelect={() => handleOptionSelect(singleAssetToPair(option, isLong))}
                asset={singleAssetToPair(option, isLong)}
                key={String(option[0] + option[1])}
                isLong={isLong}
              />
            ))
            }
          </>)}
      </SingleDropdownList>}
    </SingleDropdownWrapper>
  );
};

function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}
const singleAssetToPair = (asset: SupportedAssets, isLong): [SupportedAssets, SupportedAssets] => {
  return isLong ? [asset, SupportedAssets.USDC] : [SupportedAssets.USDC, asset]
}


interface AssetRowProps extends PairRowProps {
  isLong: boolean

}


const AssetRow = ({ isLong, asset, onSelect }: AssetRowProps): JSX.Element => {
  const relAsset = asset[isLong ? 0 : 1]
  return <RowPair onClick={() => onSelect(asset)}>
    <Image src={TOKEN_SVGS[relAsset]} key={String(relAsset)} style={{ marginRight: '10px' }} />
    <AssetText>
      {relAsset}
    </AssetText>
  </RowPair >
}