/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';

import { CircleButton } from './CircleButton';
import { CalendarIcon, ClockIcon } from './icons';

import { useDatePicker } from '../hooks/useDatePicker';
import { IconButton } from './IconButton';
import { DARK_GREY } from '../globalStyles/index';

/**
 * Shows an Icon that is pressable and opens a date picker. Handle result with
 * callback "onDateChanged".
 *
 * @prop {Node} initialValue  Initial date value to display in picker
 * @prop {Func} onDateChanged Callback to handle output of selected date.
 *                            Should take one parameter, a timestamp.
 * @prop {Func} maximumDate Maximum date selectable.
 * @prop {Func} minimumDate Minimum date selectable.
 * @prop {Boolean} isCircle Should the Icon have a Circle background rendered.
 */

export const DatePickerButton = ({
  initialValue,
  label,
  labelStyle,
  onDateChanged,
  maximumDate,
  minimumDate,
  isCircle,
  isDisabled,
  mode,
}) => {
  const [datePickerIsOpen, openDatePicker, datePickerCallback] = useDatePicker(onDateChanged);
  const button = isCircle ? (
    <CircleButton
      isDisabled={isDisabled}
      IconComponent={mode === 'time' ? ClockIcon : CalendarIcon}
      onPress={openDatePicker}
    />
  ) : (
    <IconButton
      isDisabled={isDisabled}
      Icon={<CalendarIcon color={DARK_GREY} />}
      label={label}
      labelStyle={labelStyle}
      onPress={openDatePicker}
    />
  );

  return (
    <>
      {button}
      {!!datePickerIsOpen && (
        <DateTimePicker
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={datePickerCallback}
          mode={mode}
          display="spinner"
          value={initialValue}
        />
      )}
    </>
  );
};

DatePickerButton.defaultProps = {
  label: null,
  labelStyle: {},
  minimumDate: undefined,
  maximumDate: undefined,
  isCircle: true,
  isDisabled: false,
  mode: 'date',
};

DatePickerButton.propTypes = {
  initialValue: PropTypes.instanceOf(Date).isRequired,
  onDateChanged: PropTypes.func.isRequired,
  maximumDate: PropTypes.instanceOf(Date),
  minimumDate: PropTypes.instanceOf(Date),
  isCircle: PropTypes.bool,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  labelStyle: PropTypes.object,
  mode: PropTypes.string,
};
