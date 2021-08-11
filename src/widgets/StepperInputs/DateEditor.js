/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, TextInput } from 'react-native';
import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Incrementor } from './Incrementor';

import { useOptimisticUpdating, useDatePicker } from '../../hooks';
import { generalStrings } from '../../localization';
import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { DATE_FORMAT } from '../../utilities/constants';

export const DateEditor = ({
  label,
  date,
  onPress,
  textInputStyle,
  stepAmount,
  stepUnit,
  minimumDate,
  maximumDate,
}) => {
  const adjustValue = (toUpdate, addend) => moment(toUpdate).add(addend, stepUnit).toDate();
  const formatter = toFormat => moment(toFormat).format(DATE_FORMAT.DD_MM_YYYY);
  const wrappedDatePicker = timestamp => onPress(new Date(timestamp));

  const [datePickerIsOpen, openDatePicker, onPickDate] = useDatePicker(wrappedDatePicker);
  const [textInputRef, newValue, newOnChange] = useOptimisticUpdating(
    date,
    onPress,
    adjustValue,
    formatter
  );

  return (
    <>
      <Incrementor
        onIncrement={() => newOnChange(stepAmount)}
        onDecrement={() => newOnChange(-stepAmount)}
        label={label}
        Content={
          <Pressable onPress={openDatePicker}>
            <TextInput
              ref={textInputRef}
              editable={false}
              style={textInputStyle}
              value={newValue}
            />
          </Pressable>
        }
      />
      {!!datePickerIsOpen && (
        <DateTimePicker
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          value={date}
          mode="date"
          display="spinner"
          onChange={onPickDate}
        />
      )}
    </>
  );
};

DateEditor.defaultProps = {
  label: generalStrings.date,
  textInputStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 90 },
  stepAmount: 1,
  stepUnit: 'day',
  maximumDate: null,
  minimumDate: null,
  date: new Date(),
};

DateEditor.propTypes = {
  label: PropTypes.string,
  date: PropTypes.object,
  onPress: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  stepUnit: PropTypes.string,
  maximumDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.instanceOf(moment)]),
  minimumDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.instanceOf(moment)]),
};
