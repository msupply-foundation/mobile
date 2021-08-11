/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';

import { FlexColumn } from '../FlexColumn';
import { FlexRow } from '../FlexRow';

import { APP_FONT_FAMILY, SUSSOL_ORANGE, DARKER_GREY } from '../../globalStyles';
import { CalendarIcon } from '../icons';
import { CircleButton } from '../CircleButton';
import { FormLabel } from './FormLabel';
import { FormInvalidMessage } from './FormInvalidMessage';
import { DATE_FORMAT } from '../../utilities/constants';

/**
 * Form input for entering dates. Renders a TextInput as well as a button, opening a
 * native Date picker.
 *
 * @prop {Date}   value                    A date or moment - The initial date.
 * @prop {Bool}   isRequired               Indicator whether this date is required.
 * @prop {Bool}   isDisabled               Indicator whether this input is disabled.
 * @prop {Func}   onValidate               Callback to validate the input.
 * @prop {Func}   onChangeDate             Callback for date changes[called only with a valid date].
 * @prop {Func}   onSubmit                 Callback after submitting a date from text.
 * @prop {String} label                    Label for the input
 * @prop {String} placeholder              Placeholder text for the text input.
 * @prop {String} placeholderTextColor     Color of the placeholder text.
 * @prop {String} underlineColorAndroid    Underline color of the text input.
 * @prop {String} invalidMessage           Message to the user when the current input is invalid.
 * @prop {Object} textInputStyle           Style object to override the underlying text input.
 */
export const FormDateInput = React.forwardRef(
  (
    {
      value,
      isRequired,
      onValidate,
      onChangeDate,
      label,
      invalidMessage,
      textInputStyle,
      placeholder,
      placeholderTextColor,
      underlineColorAndroid,
      onSubmit,
      isDisabled,
      autoFocus,
    },
    ref
  ) => {
    let initialValue = moment(value);
    if (onValidate(value)) {
      initialValue = moment(value);
    } else if (typeof value === 'number' && onValidate(value)) {
      initialValue = moment(new Date(), DATE_FORMAT.DD_MM_YYYY);
    }

    const [inputState, setInputState] = React.useState({
      isValid: true,
      inputValue: initialValue.isValid() ? moment(initialValue).format(DATE_FORMAT.DD_MM_YYYY) : '',
      pickerSeedValue: initialValue.isValid() ? initialValue.toDate() : new Date(),
      datePickerOpen: false,
    });

    const { inputValue, isValid, pickerSeedValue, datePickerOpen } = inputState;

    const onUpdate = (newValue, validity = true, pickerVisibility = false) => {
      const newDate = moment(newValue, DATE_FORMAT.DD_MM_YYYY);
      const newValidity = onValidate(newValue);
      const updatedIsValid = validity && newValidity;

      const updatedDate = newValue && updatedIsValid ? newDate.toDate() : null;
      // if invalid, return the raw value to allow the caller to validate correctly
      const returnValue = updatedDate || newValue;

      const updatedState = {
        isValid: updatedIsValid,
        inputValue: newValue,
        datePickerOpen: pickerVisibility,
        pickerSeedValue: updatedDate,
      };

      setInputState(updatedState);
      onChangeDate(returnValue);
    };

    // When changing the value of the input, check the new validity and set the new input.
    // Do not restrict input, but provide feedback to the user.
    const onChangeTextCallback = React.useCallback(
      newValue => {
        const newValueIsValid = onValidate ? onValidate(newValue) : true;
        onUpdate(newValue, newValueIsValid);
      },
      [onValidate]
    );

    const onChangeDates = ({ nativeEvent }) => {
      const { timestamp } = nativeEvent;
      if (!timestamp) {
        setInputState(state => ({ ...state, datePickerOpen: false }));
      } else {
        const newDate = moment(new Date(timestamp)).format(DATE_FORMAT.DD_MM_YYYY);
        onUpdate(newDate, true);
      }
    };

    const openDatePicker = () => setInputState(state => ({ ...state, datePickerOpen: true }));

    const onSubmitEditing = React.useCallback(
      event => {
        /* eslint-disable no-unused-expressions */
        onSubmit?.(event.nativeEvent.text);
        onUpdate?.(event.nativeEvent.text);
      },
      [onUpdate, onSubmit]
    );

    return (
      <FlexRow flex={1}>
        <FlexColumn flex={1}>
          <FormLabel value={label} isRequired={isRequired} />
          <FlexRow flex={1}>
            <TextInput
              ref={ref}
              style={textInputStyle}
              value={inputValue}
              placeholderTextColor={placeholderTextColor}
              underlineColorAndroid={underlineColorAndroid}
              placeholder={placeholder}
              selectTextOnFocus
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChangeTextCallback}
              onSubmitEditing={onSubmitEditing}
              editable={!isDisabled}
              autoFocus={autoFocus}
            />
            <CircleButton
              IconComponent={CalendarIcon}
              onPress={openDatePicker}
              isDisabled={isDisabled}
            />
          </FlexRow>

          {!!datePickerOpen && (
            <DateTimePicker
              onChange={onChangeDates}
              mode="date"
              display="spinner"
              value={pickerSeedValue ?? new Date()}
              maximumDate={new Date()}
            />
          )}
          <FormInvalidMessage isValid={isValid} message={invalidMessage} />
        </FlexColumn>
      </FlexRow>
    );
  }
);

const localStyles = StyleSheet.create({
  labelStyle: { marginTop: 15, fontSize: 16, fontFamily: APP_FONT_FAMILY },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

FormDateInput.defaultProps = {
  placeholder: '',
  placeholderTextColor: SUSSOL_ORANGE,
  underlineColorAndroid: DARKER_GREY,
  textInputStyle: localStyles.textInputStyle,
  isRequired: false,
  onValidate: null,
  invalidMessage: '',
  onSubmit: null,
  isDisabled: false,
  autoFocus: false,
};

FormDateInput.propTypes = {
  textInputStyle: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]).isRequired,
  isRequired: PropTypes.bool,
  onValidate: PropTypes.func,
  onChangeDate: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  invalidMessage: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  underlineColorAndroid: PropTypes.string,
  onSubmit: PropTypes.func,
  isDisabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
};
