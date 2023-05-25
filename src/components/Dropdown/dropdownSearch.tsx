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
  selectedOption: SupportedAssets | undefined;
  options: SupportedAssets[];
  onSelect: (option: SupportedAssets) => void;
  placeholder: string
}

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  border-radius: 10px;
`;


const DropdownInput = styled.input`
  width: 80px;
  font-size: 16px;
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

const RowAsset = styled.div`
  padding: 1px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  &:hover {
    cursor: pointer;
  }
`


interface AssetRowProps {
  asset: SupportedAssets
  onSelect: (a: SupportedAssets) => any

}

const AssetText = styled.span`
  margin-right: 5px;
`

const Image = styled.img`
  width: 25px;
  height: 25px;
`

const AssetRow = ({ asset, onSelect }: AssetRowProps): JSX.Element => {

  return <RowAsset onClick={() => onSelect(asset)}>
    <Image src={TOKEN_SVGS[asset]} key={String(asset)} />
    <AssetText>
      {String(asset)}
    </AssetText>
  </RowAsset>
}

const SearchDropdown: React.FC<DropdownProps> = ({ selectedOption, options, onSelect, placeholder }) => {
  const [showAll, setShowAll] = useState(false)
  const [inputValue, setInputValue] = useState(String(selectedOption));
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    setFilteredOptions(options) // if the list updates reset the options
    setInputValue(String(selectedOption))
  }, [options])


  useEffect(() => {
    setInputValue(String(selectedOption))
  }, [onSelect])

  const [close, setClose] = useState(true);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setInputValue(inputValue);
    setFilteredOptions(filteredOptions);
    setClose(false)
  };

  const handleOptionSelect = (option: SupportedAssets) => {
    setInputValue(option);
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
      <Row>
        <Image src={TOKEN_SVGS[selectedOption ?? placeholder]} key={String(selectedOption)} />
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
              <AssetRow onSelect={() => handleOptionSelect(option)} asset={option} key={option} />
            ))}
          </>

          : <>
            {options.map((option) => (
              <AssetRow onSelect={() => handleOptionSelect(option)} asset={option} key={option} />
            ))
            }
          </>)}
      </DropdownList>}
    </DropdownWrapper>
  );
};

export default SearchDropdown;