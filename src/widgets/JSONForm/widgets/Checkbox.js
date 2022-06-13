/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { SUSSOL_ORANGE, WARMER_GREY } from '../../../globalStyles/colors';
import { ToggleBar } from '../../index';
import { APP_FONT_FAMILY } from '../../../globalStyles';

export const Checkbox = ({
  options: { enumOptions },
  value,
  onChange,
  disabled,
  readonly,
  onBlur,
  id,
}) => {
  const handleChange = toggleValue => {
    onChange(toggleValue);
    onBlur(id, value);
  };
  const toggles = enumOptions.map(({ label, value: enumValue }) => ({
    text: label,
    isOn: enumValue === value,
    onPress: () => handleChange(enumValue),
  }));

  return (
    <ToggleBar
      isDisabled={disabled || readonly}
      textOffDisabledStyle={styles.textOffDisabledStyle}
      toggleOnStyle={styles.toggleOnStyle}
      toggleOffStyle={styles.toggleOffStyle}
      toggleOnDisabledStyle={styles.toggleOnDisabledStyle}
      toggleOffDisabledStyle={styles.toggleOffDisabledStyle}
      toggles={toggles}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: { borderWidth: 0, width: 150 },
  textOffDisabledStyle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: WARMER_GREY,
  },
  toggleOnStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SUSSOL_ORANGE,
    borderRadius: 20,
    margin: 5,
  },
  toggleOffStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderColor: SUSSOL_ORANGE,
    borderWidth: 1,
    margin: 5,
  },
  toggleOnDisabledStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARMER_GREY,
    borderRadius: 20,
    margin: 5,
  },
  toggleOffDisabledStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: WARMER_GREY,
    borderRadius: 20,
    borderWidth: 1,
    margin: 5,
  },
});

Checkbox.propTypes = {
  options: PropTypes.object.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  readonly: PropTypes.bool.isRequired,
};
