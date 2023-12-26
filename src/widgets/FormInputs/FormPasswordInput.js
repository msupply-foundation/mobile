/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';

import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';
import { authStrings } from '../../localization';
import { IconButton } from '../IconButton';
import { EyeIcon, EyeSlashIcon } from '../icons';

export const FormPasswordInput = forwardRef(
  (
    {
      isEditable,
      onChangeText,
      onSubmitEditing,
      placeholder,
      placeholderTextColor,
      returnKeyType,
      style,
      underlineColorAndroid,
      value,
    },
    ref
  ) => {
    const [isHidden, setIsHidden] = React.useState(true);
    return (
      <>
        <TextInput
          ref={ref}
          autoCompleteType="password"
          editable={isEditable}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          returnKeyType={returnKeyType}
          style={style}
          underlineColorAndroid={underlineColorAndroid}
          value={value}
          secureTextEntry={isHidden}
          selectTextOnFocus
        />
        <IconButton
          containerStyle={{ marginRight: 60 }}
          onPress={() => setIsHidden(!isHidden)}
          Icon={isHidden ? <EyeIcon /> : <EyeSlashIcon />}
        />
      </>
    );
  }
);

FormPasswordInput.defaultProps = {
  isEditable: true,
  placeholder: authStrings.password,
  placeholderTextColor: SUSSOL_ORANGE,
  returnKeyType: 'done',
  style: globalStyles.authFormTextInputStyle,
  underlineColorAndroid: SUSSOL_ORANGE,
  value: '',
};

FormPasswordInput.propTypes = {
  isEditable: PropTypes.bool,
  onChangeText: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  returnKeyType: PropTypes.string,
  style: PropTypes.object,
  underlineColorAndroid: PropTypes.string,
  value: PropTypes.string,
};
