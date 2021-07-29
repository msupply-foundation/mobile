/* eslint-disable no-console */
import React from 'react';
import { TextInput } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';

import { DatePickerButton } from '../../DatePickerButton';
import { FlexRow } from '../../FlexRow';
import { useJSONFormOptions } from '../JSONFormContext';
import { DARKER_GREY, LIGHT_GREY } from '../../../globalStyles/colors';

const regex = new RegExp('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$');

export const TimePicker = ({ disabled, value, onChange, placeholder, readonly, onBlur, id }) => {
  const { focusController } = useJSONFormOptions();
  const ref = focusController.useRegisteredRef();
  const initialValue = regex.test(value) ? moment(value, 'hh:mm').toDate() : new Date();
  const handleChange = dateString => {
    onChange(dateString);
    onBlur(id, dateString);
  };

  return (
    <FlexRow>
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor={LIGHT_GREY}
        underlineColorAndroid={DARKER_GREY}
        placeholder={placeholder}
        editable={!(readonly || disabled)}
        value={value}
        ref={ref}
        onSubmitEditing={() => focusController.next(ref)}
        onChangeText={handleChange}
        returnKeyType="next"
        autoCapitalize="none"
        keyboardType="numeric"
        autoCorrect={false}
      />
      <DatePickerButton
        mode="time"
        isDisabled={readonly || disabled}
        initialValue={initialValue}
        onDateChanged={date => {
          handleChange(moment(date).format('HH:mm'));
        }}
      />
    </FlexRow>
  );
};

TimePicker.defaultProps = {
  value: '',
};

TimePicker.propTypes = {
  disabled: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  readonly: PropTypes.bool.isRequired,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};
