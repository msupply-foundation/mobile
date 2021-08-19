/* eslint-disable react/forbid-prop-types */

import React, { useReducer } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';

import { FlexColumn } from '../FlexColumn';
import { FlexRow } from '../FlexRow';
import { generalStrings } from '../../localization';
import { APP_FONT_FAMILY, SUSSOL_ORANGE, DARKER_GREY } from '../../globalStyles';
import { CalendarIcon } from '../icons';
import { CircleButton } from '../CircleButton';
import { FormLabel } from './FormLabel';
import { FormInvalidMessage } from './FormInvalidMessage';
import { DATE_FORMAT } from '../../utilities/constants';

const calculateAge = dob => (!dob ? '' : `${Math.floor(moment().diff(dob, 'years', true))}`);

const Action = {
  toggleDatePicker: 'toggleDatePicker',
  pickDate: 'pickDate',
  typedDate: 'typedDate',
  typedAge: 'typedAge',
};

// The internal state of the component has three different values for the various
// inputs: age, date and picker. Just storing a single value and formatting into the
// correct type doesn't work well, as at any point the date could be in an invalid state.
const initialState = (seedDate, isValid) => ({
  isValid, // If the date is a valid date
  datePickerOpen: false,
  pickerValue: seedDate?.toDate() || new Date(),
  ageValue: calculateAge(seedDate),
  textInputValue: seedDate ? seedDate.format(DATE_FORMAT.DD_MM_YYYY) : '',
});

const reducer = (state, action) => {
  const { type } = action;

  switch (type) {
    case Action.toggleDatePicker: {
      const { datePickerOpen } = state;
      return { ...state, datePickerOpen: !datePickerOpen };
    }
    case Action.pickDate: {
      const { payload } = action;
      const { isValid, date } = payload;

      if (isValid) {
        const asMoment = moment(date);
        const ageValue = calculateAge(asMoment);
        const textInputValue = asMoment.format(DATE_FORMAT.DD_MM_YYYY);
        const pickerValue = asMoment.toDate();

        return { ...state, isValid, ageValue, textInputValue, pickerValue };
      }

      return state;
    }
    case Action.typedDate: {
      const { payload } = action;
      const { isValid, date } = payload;

      if (isValid) {
        const asMoment = moment(date, DATE_FORMAT.DD_MM_YYYY);
        const ageValue = calculateAge(asMoment);
        const textInputValue = date;
        const pickerValue = asMoment.toDate();

        return { ...state, isValid, ageValue, textInputValue, pickerValue };
      }

      return { ...state, textInputValue: date, isValid, ageValue: generalStrings.not_available };
    }

    case Action.typedAge: {
      const { payload } = action;
      const { isValid, age } = payload;

      if (isValid) {
        const asMoment = moment().subtract(Number(age), 'years');
        const ageValue = age;
        const textInputValue = asMoment.format(DATE_FORMAT.DD_MM_YYYY);
        const pickerValue = asMoment.toDate();

        return { ...state, isValid, ageValue, textInputValue, pickerValue };
      }

      return { ...state, textInputValue: generalStrings.not_available, isValid, ageValue: age };
    }

    default: {
      return state;
    }
  }
};

const useDobInput = (initialValue, onChangeDate, onValidate) => {
  const [state, dispatch] = useReducer(
    reducer,
    initialState(initialValue, onValidate(initialValue))
  );

  // Action dispatchers
  const toggleDatePicker = () => dispatch({ type: Action.toggleDatePicker });

  const pickDate = (date, isValid) =>
    dispatch({ type: Action.pickDate, payload: { date, isValid } });
  const typedDate = (date, isValid) =>
    dispatch({ type: Action.typedDate, payload: { date, isValid } });
  const typedAge = (age, isValid) => dispatch({ type: Action.typedAge, payload: { age, isValid } });

  const onPickDate = event => {
    toggleDatePicker();
    const { type, nativeEvent } = event;
    if (type === 'set') {
      const { timestamp } = nativeEvent;
      const isValid = onValidate(timestamp);
      pickDate(timestamp, isValid);
      onChangeDate(moment(timestamp).toDate());
    }
  };

  const onTypeDate = newDate => {
    const isValid = onValidate(newDate);
    typedDate(newDate, isValid);
    onChangeDate(moment(newDate, DATE_FORMAT.DD_MM_YYYY).toDate());
  };

  const onTypeAge = newAge => {
    const asNumber = Number(newAge);
    const isValid = !Number.isNaN(asNumber) && asNumber < 500;
    typedAge(newAge, isValid);
    onChangeDate(moment().subtract(asNumber, 'years').toDate());
  };

  return [state, { toggleDatePicker, onPickDate, onTypeDate, onTypeAge }];
};

export const FormDOBInput = React.forwardRef(
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
    const [
      { datePickerOpen, isValid, pickerValue, ageValue, textInputValue },
      { toggleDatePicker, onPickDate, onTypeDate, onTypeAge },
    ] = useDobInput(value ? moment(value) : undefined, onChangeDate, onValidate);

    return (
      <>
        <FlexRow flex={1}>
          <FlexColumn flex={6}>
            <FormLabel value={`${label}`} isRequired={isRequired} />
            <FlexRow flex={1}>
              <TextInput
                ref={ref}
                style={textInputStyle}
                value={textInputValue}
                placeholderTextColor={placeholderTextColor}
                underlineColorAndroid={underlineColorAndroid}
                placeholder={placeholder}
                selectTextOnFocus
                returnKeyType="next"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onTypeDate}
                onSubmitEditing={onSubmit}
                editable={!isDisabled}
                autoFocus={autoFocus}
              />
              <CircleButton
                IconComponent={CalendarIcon}
                onPress={toggleDatePicker}
                isDisabled={isDisabled}
              />
            </FlexRow>

            {!!datePickerOpen && (
              <DateTimePicker
                onChange={onPickDate}
                mode="date"
                display="spinner"
                value={pickerValue}
                maximumDate={new Date()}
              />
            )}
          </FlexColumn>

          <FlexColumn flex={1}>
            <FormLabel
              value={`${generalStrings.age}:`}
              isRequired={isRequired}
              textStyle={{ textAlign: 'right', flex: 1 }}
            />
            <TextInput
              style={{ ...textInputStyle, textAlign: 'right' }}
              value={ageValue}
              placeholderTextColor={placeholderTextColor}
              underlineColorAndroid={underlineColorAndroid}
              placeholder={placeholder}
              selectTextOnFocus
              returnKeyType="next"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onTypeAge}
              onSubmitEditing={onSubmit}
              editable={!isDisabled}
              autoFocus={autoFocus}
            />
          </FlexColumn>
        </FlexRow>
        <FormInvalidMessage isValid={isValid} message={invalidMessage} />
      </>
    );
  }
);

const localStyles = StyleSheet.create({
  labelStyle: { marginTop: 15, fontSize: 16, fontFamily: APP_FONT_FAMILY },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
  textInputStyle: { flex: 1, fontFamily: APP_FONT_FAMILY },
});

FormDOBInput.defaultProps = {
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

FormDOBInput.propTypes = {
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
