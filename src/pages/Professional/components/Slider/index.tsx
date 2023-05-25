import React, { useState } from 'react';
import styled from 'styled-components';



const SliderContainer = styled.div`
  position: relative;
  width: 80%;
  `


const SliderMarkers = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-direction: row;
`

const SliderMarker = styled.div`
  position: relative;
  font-size: 14px;
  text-align: center;
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

  return (
    <SliderContainer>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="slider"
      />
      {/* <SliderMarkers>
        {markers.map((marker, index) => (
          <SliderMarker
            key={index}
            style={{ left: `${((marker - min) / (max - min)) * 100}%` }}
          >
            {marker}
          </SliderMarker>
        ))}
      </SliderMarkers> */}
    </SliderContainer>
  );
};

export default DecimalSlider;