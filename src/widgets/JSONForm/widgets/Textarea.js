import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, StyleSheet } from 'react-native';
import { DARKER_GREY, LIGHT_GREY } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY } from '../../../globalStyles/fonts';
import { useJSONFormOptions } from '../JSONFormContext';

export const Textarea = ({
  autofocus,
  disabled,
  placeholder,
  value,
  onChange,
  numberOfLines,
  onBlur,
  id,
}) => {
  const { focusController } = useJSONFormOptions();
  const ref = focusController.useRegisteredRef();
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
      onChangeText={onChange}
      editable={!disabled}
      blurOnSubmit={false}
      autoFocus={autofocus}
      multiline={true}
      numberOfLines={numberOfLines}
      onEndEditing={handleBlur}
    />
  );
};

const styles = StyleSheet.create({
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

Textarea.propTypes = {
  autofocus: PropTypes.bool,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  numberOfLines: PropTypes.number,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

Textarea.defaultProps = {
  autofocus: false,
  disabled: false,
  placeholder: '',
  value: '',
  numberOfLines: 5,
};
