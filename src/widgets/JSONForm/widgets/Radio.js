/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

import { APP_FONT_FAMILY } from '../../../globalStyles/fonts';
import { GREY, SUSSOL_ORANGE } from '../../../globalStyles/colors';

export const Radio = ({ options, value, disabled, readonly, onChange, onBlur, id }) => {
  const { enumOptions, enumDisabled } = options;
  const row = options ? options.inline : false;

  const radioButtons = enumOptions.map((option, i) => {
    const itemDisabled = enumDisabled && enumDisabled.indexOf(option.value) !== -1;
    const itemSelected = value === option.value;
    const handleChange = changedValue => {
      onChange(changedValue);
      onBlur(id, changedValue);
    };
    return (
      <RadioButton labelHorizontal={true} key={option.value}>
        <RadioButtonInput
          obj={option}
          index={i}
          isSelected={itemSelected}
          onPress={handleChange}
          buttonInnerColor={SUSSOL_ORANGE}
          buttonOuterColor={itemSelected ? SUSSOL_ORANGE : GREY}
          disabled={disabled || itemDisabled || readonly}
          buttonSize={10}
          buttonOuterSize={20}
          borderWidth={2}
        />
        <RadioButtonLabel
          obj={option}
          index={i}
          labelHorizontal={row}
          onPress={handleChange}
          labelStyle={styles.label}
        />
      </RadioButton>
    );
  });

  return <View style={styles.root}>{radioButtons}</View>;
};

const styles = StyleSheet.create({
  root: { paddingLeft: 10, paddingTop: 10 },
  label: { fontFamily: APP_FONT_FAMILY, marginLeft: 10 },
});

Radio.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
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

Radio.defaultProps = {
  disabled: false,
  value: '',
  options: undefined,
  readonly: false,
};
