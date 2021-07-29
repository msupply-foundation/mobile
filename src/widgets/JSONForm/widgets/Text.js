import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';
import { DARKER_GREY, LIGHT_GREY } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY } from '../../../globalStyles/fonts';
import { useJSONFormOptions } from '../JSONFormContext';

export const Text = ({ autofocus, disabled, placeholder, value, onChange, onBlur, id }) => {
  const { focusController } = useJSONFormOptions();
  const ref = focusController.useRegisteredRef();
  const handleChange = text => onChange(text || undefined);
  const handleBlur = event => onBlur(id, event.nativeEvent.text);

  return (
    <TextInput
      ref={ref}
      style={styles.textInputStyle}
      value={value}
      placeholderTextColor={LIGHT_GREY}
      underlineColorAndroid={DARKER_GREY}
      placeholder={placeholder}
      selectTextOnFocus
      returnKeyType="next"
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={handleChange}
      onSubmitEditing={() => focusController.next(ref)}
      editable={!disabled}
      blurOnSubmit={false}
      autoFocus={autofocus}
      onEndEditing={handleBlur}
    />
  );
};

const styles = StyleSheet.create({
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

Text.propTypes = {
  autofocus: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

Text.defaultProps = {
  autofocus: false,
  disabled: false,
  placeholder: '',
  value: '',
};
