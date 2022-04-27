/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import { TextInputWithAffix } from '../TextInputs';
import { Incrementor } from './Incrementor';

import { APP_FONT_FAMILY, DARKER_GREY } from '../../globalStyles';
import { vaccineStrings, generalStrings } from '../../localization';
import { FlexColumn } from '../FlexColumn';

import temperature from '../../utilities/temperature';
import { useOptimisticUpdating } from '../../hooks/useOptimisticUpdating';

const keepInRange = (num, min, max) => {
  const temp = Math.min(num, max);
  return Math.max(temp, min);
};

export const TemperatureEditor = ({
  value,
  onChange,
  label,
  textInputStyle,
  suffixTextStyle,
  stepAmount,
  threshold,
  above,
  belowMinimum,
  aboveMaximum,
}) => {
  const minimum = above ? threshold : belowMinimum;
  const maximum = above ? aboveMaximum : threshold;

  const getAdjustedValue = (toUpdate, addend) =>
    keepInRange(temperature(toUpdate + addend).temperature(), minimum, maximum);
  const formatter = updated => keepInRange(updated, minimum, maximum).toFixed(1);

  const [textInputRef, newValue, newOnChange] = useOptimisticUpdating(
    value,
    onChange,
    getAdjustedValue,
    formatter
  );

  return (
    <>
      <Incrementor
        onIncrement={() => newOnChange(stepAmount)}
        onDecrement={() => newOnChange(-stepAmount)}
        label={label}
        Content={
          <TextInputWithAffix
            ref={textInputRef}
            editable={false}
            SuffixComponent={
              <FlexColumn style={{ marginTop: 12 }}>
                <Text allowFontScaling={false} style={suffixTextStyle}>{`${'\u00B0'}Celsius`}</Text>
                <Text style={{ fontSize: 10 }}>
                  {above ? vaccineStrings.and_above : vaccineStrings.and_below}
                </Text>
              </FlexColumn>
            }
            style={textInputStyle}
            value={newValue}
          />
        }
      />
    </>
  );
};

TemperatureEditor.defaultProps = {
  label: generalStrings.temp,
  textInputStyle: {
    fontSize: 14,
    color: DARKER_GREY,
    width: 50,
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },
  suffixTextStyle: { fontSize: 12, color: DARKER_GREY, fontFamily: APP_FONT_FAMILY, width: 50 },
  stepAmount: 0.5,
  above: true,
  belowMinimum: -30,
  aboveMaximum: 999,
  value: 0,
};

TemperatureEditor.propTypes = {
  above: PropTypes.bool,
  threshold: PropTypes.number.isRequired,
  label: PropTypes.string,
  textInputStyle: PropTypes.object,
  suffixTextStyle: PropTypes.object,
  stepAmount: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  belowMinimum: PropTypes.number,
  aboveMaximum: PropTypes.number,
};
