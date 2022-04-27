/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { generalStrings } from '../../localization';
import { VACCINE_CONSTANTS } from '../../utilities/modules/vaccines';
import { useOptimisticUpdating } from '../../hooks/index';

const keepInRange = (num, min, max) => {
  const temp = Math.min(num, max);
  return Math.max(temp, min);
};

export const DurationEditor = ({
  value,
  onChange,
  label,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
  maxValue,
  minValue,
  containerStyle,
}) => {
  const formatter = val => String(keepInRange(val, minValue, maxValue));
  const adjustValue = (toUpdate, addend) => keepInRange(toUpdate + addend, minValue, maxValue);

  const [textInputRef, newValue, newOnChange] = useOptimisticUpdating(
    value,
    onChange,
    adjustValue,
    formatter
  );

  return (
    <View style={containerStyle}>
      <Incrementor
        onIncrement={() => newOnChange(stepAmount)}
        onDecrement={() => newOnChange(-stepAmount)}
        label={label}
        Content={
          <TextInputWithAffix
            ref={textInputRef}
            editable={false}
            SuffixComponent={
              <Text allowFontScaling={false} style={suffixTextStyle}>
                {generalStrings.minutes}
              </Text>
            }
            style={textInputStyle}
            value={newValue}
          />
        }
      />
    </View>
  );
};

DurationEditor.defaultProps = {
  label: generalStrings.duration,
  textInputStyle: {
    color: DARKER_GREY,
    width: 40,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },
  suffixTextStyle: { color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, fontSize: 12, width: 50 },
  containerStyle: {},
  stepAmount: 1,
  value: 0,
  maxValue: VACCINE_CONSTANTS.MAX_LOGGING_INTERVAL_MINUTES, // 10
  minValue: VACCINE_CONSTANTS.MIN_LOGGING_INTERVAL_MINUTES, // 1
};

DurationEditor.propTypes = {
  maxValue: PropTypes.number,
  minValue: PropTypes.number,
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};
