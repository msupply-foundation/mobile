/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text, TextInput } from 'react-native';

import { BACKGROUND_COLOR, APP_FONT_FAMILY, DARKER_GREY } from '../globalStyles';

import { FlexRow } from './FlexRow';

export const TextEditor = ({
  label,
  labelStyle,
  containerStyle,
  textInputStyle,
  size,
  ...textInputProps
}) => {
  const isSmall = size === 'small';
  const sizeAdjustment = { width: isSmall ? 190 : 350 };
  const internalTextInput = [textInputStyle, sizeAdjustment];
  return (
    <FlexRow flex={0} alignItems="center" style={{ ...containerStyle }}>
      {!!isSmall && <Text style={labelStyle}>{label}</Text>}
      <TextInput {...textInputProps} selectTextOnFocus style={internalTextInput} />
    </FlexRow>
  );
};

TextEditor.defaultProps = {
  containerStyle: { minWidth: 190 },
  textInputStyle: {
    fontSize: 14,
    color: DARKER_GREY,

    fontFamily: APP_FONT_FAMILY,
    backgroundColor: BACKGROUND_COLOR,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    textAlign: 'right',
    marginRight: 10,
    width: 90,
  },
  size: 'small',
  label: '',
};

TextEditor.propTypes = {
  label: PropTypes.string,
  labelStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  size: PropTypes.oneOf(['small', 'large']),
  textInputStyle: PropTypes.object,
};
