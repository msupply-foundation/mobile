/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import PropTypes from 'prop-types';

import { FormLabel } from './FormLabel';
import { FlexView } from '../FlexView';
import { Slider } from '../Slider';

/**
 * Form input for a slider and smaller text input to enter numbers.
 * The maximum and minimum values will put a range on the input for both
 * slider and text input where the callback will only be triggered
 * when values are valid. When sliding, the callback is only triggered
 * at the end of a slide, regardless of the value changing, or not.
 *
 * @prop {String} label         Label for this form input
 * @prop {Bool}   isRequired    Indicator whether this input is required for the form.
 * @prop {Bool}   isDisabled    Indicator whether this input is disabled for the form.
 * @prop {Number} minimumValue  The upper bound number of the slider.
 * @prop {Number} maximumValue  The lower bound number of the slider.
 * @prop {Number} step          The increment step for the slider.
 * @prop {Number} value         The current value of the input.
 * @prop {Func}   onValueChange Callback for value changes. For sliding- will be called on press up.
 */
export const FormSlider = React.forwardRef(
  (
    { label, isRequired, minimumValue, maximumValue, step, value, onValueChange, isDisabled },
    ref
  ) => (
    <FlexView flex={1}>
      <FormLabel value={label} isRequired={isRequired} />
      <Slider
        isDisabled={isDisabled}
        ref={ref}
        onEndEditing={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
      />
    </FlexView>
  )
);

FormSlider.defaultProps = {
  isRequired: false,
  minimumValue: 0,
  maximumValue: 100,
  isDisabled: false,
};

FormSlider.propTypes = {
  label: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onValueChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};
