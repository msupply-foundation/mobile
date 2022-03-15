/* eslint-disable react/forbid-prop-types */
import React from 'react';

import PropTypes from 'prop-types';
import { vaccineStrings } from '../../localization';
import { ColdBreachIcon, HotBreachIcon } from '../../widgets';
import { EditorRow } from '../../widgets/EditorRow';
import { DurationEditor, TemperatureEditor } from '../../widgets/StepperInputs';
import { MILLISECONDS } from '../../utilities/constants';

import { COLD_BREACH_BLUE, DANGER_RED } from '../../globalStyles';

export const TYPE_TO_LABEL = {
  HOT_CONSECUTIVE: vaccineStrings.hot_consecutive,
  HOT_CUMULATIVE: vaccineStrings.hot_cumulative,
  COLD_CONSECUTIVE: vaccineStrings.cold_consecutive,
  COLD_CUMULATIVE: vaccineStrings.cold_cumulative,
};

export const BreachConfigRow = React.memo(
  ({
    type,
    duration,
    maximumTemperature,
    minimumTemperature,
    threshold,
    updateDuration,
    updateTemperature,
    containerStyle,
  }) => {
    const isHotBreach = type.includes('HOT');
    const Icon = isHotBreach ? HotBreachIcon : ColdBreachIcon;
    const color = isHotBreach ? DANGER_RED : COLD_BREACH_BLUE;
    const durationInMinutes = duration / MILLISECONDS.ONE_MINUTE;

    return (
      <EditorRow
        containerStyle={containerStyle}
        Icon={<Icon color={color} size={20} />}
        label={TYPE_TO_LABEL[type]}
      >
        <DurationEditor
          value={durationInMinutes}
          onChange={value => updateDuration(type, value)}
          maxValue={999}
        />
        <TemperatureEditor
          above={isHotBreach}
          value={isHotBreach ? minimumTemperature : maximumTemperature}
          onChange={value => updateTemperature(type, value)}
          threshold={threshold}
        />
      </EditorRow>
    );
  }
);
BreachConfigRow.defaultProps = {
  containerStyle: {},
  maximumTemperature: 0,
  minimumTemperature: 0,
  duration: 0,
};
BreachConfigRow.propTypes = {
  threshold: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  duration: PropTypes.number,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  maximumTemperature: PropTypes.number,
  minimumTemperature: PropTypes.number,
};
