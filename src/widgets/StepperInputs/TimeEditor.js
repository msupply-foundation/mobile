/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Pressable } from 'react-native';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { useOptimisticUpdating, useDatePicker } from '../../hooks';
import { generalStrings } from '../../localization';

export const TimeEditor = ({ label, time, onPress, textInputStyle, stepAmount, stepUnit }) => {
  const adjustValue = (currentValue, addend) => moment(currentValue).add(addend, stepUnit).toDate();
  const formatter = currentValue => moment(currentValue).format('hh:mm a');

  const wrappedTimePicker = timestamp => onPress(new Date(timestamp));

  const [timePickerIsOpen, openTimePicker, onPickTime] = useDatePicker(wrappedTimePicker);

  const [textInputRef, newValue, newOnChange] = useOptimisticUpdating(
    time,
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
          <Pressable onPress={openTimePicker}>
            <TextInput
              ref={textInputRef}
              editable={false}
              style={{ ...textInputStyle, width: 90, textAlign: 'right' }}
              value={newValue}
            />
          </Pressable>
        }
      />
      {!!timePickerIsOpen && (
        <DateTimePicker value={time} mode="time" display="spinner" onChange={onPickTime} />
      )}
    </>
  );
};

TimeEditor.defaultProps = {
  label: generalStrings.time,
  textInputStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 90 },
  stepAmount: 1,
  stepUnit: 'minutes',
  time: new Date(),
};

TimeEditor.propTypes = {
  label: PropTypes.string,
  time: PropTypes.object,
  onPress: PropTypes.func.isRequired,
  textInputStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  stepUnit: PropTypes.string,
};
