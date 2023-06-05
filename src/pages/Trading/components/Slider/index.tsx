import React, { useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash'

const SliderContainer = styled.div`
  position: relative;
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  width: 75%;
  `
const SliderInput = styled.input<{ fillPercent: number }>`
  -webkit-appearance: none;
  --webkit-fill: ${({ fillPercent }) => fillPercent}%;
  width: 100%;
  height: 10px;
  padding: 0px;
  border-radius: 5px;
  background: #1B2126;
  background-color: #1B2126;
  outline: none;
  background-color: #555;
    box-shadow: 0 0 0.1px 1px #555;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #AC90E3;  // Thumb color
    border: 2px solid #1B2126;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    margin-bottom: 5px;
    border-radius: 50%;
    background: #AC90E3;  // Thumb color
    border: 2px solid #1B2126;
    cursor: pointer;
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      #1B1E37 10%,
      #AC90E3 100%
    );
    width: 100% ;
    border-radius: 5px;
    height: 10px;
  }

  &::-moz-range-progress {
    background: linear-gradient(
      to right,
      #1B1E37 10%,
      #AC90E3 100%
    );  // Progress color
    border-radius: 5px;
    height: 10px;
  }

  &::-moz-range-track {
    background: linear-gradient(
      to right,
      #AC90E3 0%,
      #AC90E3 var(--webkit-fill),
      #1B1E37 var(--webkit-fill),
      #1B1E37 100%
    );
    border-radius: 5px;
    height: 10px;
  }

`;

const SliderMarkers = styled.div`
  padding: 3px;
  position: relative;
  width: 95%;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`

const SliderMarker = styled.div`
  position: relative;
  font-size: 10px;
  text-align: center;
  font-weight: 300;
  color: ${({ theme }) => theme.textSecondary};
`

interface DecimalSliderProps {
  min: number;
  max: number;
  step: number;
  markers: number[];
  value: number
  onChange: (value: number) => void;
}

const DecimalSlider: React.FC<DecimalSliderProps> = ({ min, max, step, markers, onChange, value }) => {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  };

  const fillPercent = ((value - min) / (max - min)) * 100;

  const _markers = _.range(min, max, 0.7)

  return (
    <SliderContainer>
      <SliderInput
        fillPercent={fillPercent}
        style={{ width: '95%', fontSize: '12px' }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider"
      />
      <SliderMarkers>
        {_markers.map((marker, index) => (
          <SliderMarker
            key={index}
          >
            {Math.round(marker * 10 + 1) / 10}
          </SliderMarker>
        ))}
      </SliderMarkers>
    </SliderContainer>
  );
};

export default DecimalSlider;