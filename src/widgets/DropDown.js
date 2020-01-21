/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'react-native';

import globalStyles, { SUSSOL_ORANGE } from '../globalStyles';

/**
 * A single selection dropdown menu implemented as a simple light-weight wrapper over the
 * native Picker component.
 *
 * @param {Array.<string>} values A list of values to render in the dropdown selection.
 * @param {string} selectedValue The currently selected value.
 * @param {Func} onValueChange On selection callback handler.
 * @param {object} style Optional additional component styling.
 */
export const DropDown = React.memo(({ values, selectedValue, onValueChange, style }) => {
  const Items = values.map(value => (
    <Picker.Item key={value} label={value} value={value} color={SUSSOL_ORANGE} />
  ));
  return (
    <Picker
      selectedValue={selectedValue}
      mode="dropdown"
      onValueChange={onValueChange}
      style={{
        ...globalStyles.picker,
        ...globalStyles.pickerText,
        ...style,
      }}
    >
      {Items}
    </Picker>
  );
});

export default DropDown;

DropDown.defaultProps = {
  style: {},
};

DropDown.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  values: PropTypes.array.isRequired,
  selectedValue: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};
