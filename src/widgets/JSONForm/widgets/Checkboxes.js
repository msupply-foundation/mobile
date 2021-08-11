/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import PropTypes from 'prop-types';
import CheckBox from '@react-native-community/checkbox';

import { APP_FONT_FAMILY } from '../../../globalStyles/fonts';
import { SUSSOL_ORANGE } from '../../../globalStyles/colors';
import { FlexColumn, FlexRow, FlexView } from '../../index';

const selectValue = (value, selected, all) => {
  const at = all.indexOf(value);
  const updated = selected.slice(0, at).concat(value, selected.slice(at));

  // As inserting values at predefined index positions doesn't work with empty
  // arrays, we need to reorder the updated selection to match the initial order
  return updated.sort((a, b) => all.indexOf(a) > all.indexOf(b));
};

const deselectValue = (value, selected) => selected.filter(v => v !== value);

export const Checkboxes = ({
  disabled,
  onChange,
  options,
  readonly,
  value: checkboxesValue,
  onBlur,
  id,
}) => {
  const { enumOptions, enumDisabled } = options;

  const _onChange = option => checked => {
    const all = enumOptions.map(({ value }) => value);
    const newValue = checked
      ? onChange(selectValue(option.value, checkboxesValue, all))
      : onChange(deselectValue(option.value, checkboxesValue));
    onBlur(id, newValue);
  };

  const checkboxes = enumOptions.map(option => {
    const itemDisabled = enumDisabled && enumDisabled.indexOf(option.value) !== -1;
    const checked = checkboxesValue.indexOf(option.value) !== -1;

    return (
      <FlexRow key={`checkbox_row_${option.value}`}>
        <FlexColumn>
          <CheckBox
            value={checked}
            disabled={disabled || itemDisabled || readonly}
            onValueChange={_onChange(option)}
            tintColors={{ true: SUSSOL_ORANGE }}
          />
        </FlexColumn>
        <FlexColumn>
          <Text style={styles.label} onPress={() => _onChange(option)(!checked)}>
            {option.label}
          </Text>
        </FlexColumn>
      </FlexRow>
    );
  });

  return <FlexView style={styles.root}>{checkboxes}</FlexView>;
};

const styles = StyleSheet.create({
  root: { paddingLeft: 10, paddingTop: 10 },
  row: { flex: 0, flexDirection: 'row' },
  label: { fontFamily: APP_FONT_FAMILY, marginLeft: 10, marginTop: 7 },
});

Checkboxes.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.shape({
    enumOptions: PropTypes.arrayOf(PropTypes.any),
    enumDisabled: PropTypes.bool,
    inline: PropTypes.bool,
  }),
  readonly: PropTypes.bool,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

Checkboxes.defaultProps = {
  disabled: false,
  options: undefined,
  readonly: false,
  value: '',
};
