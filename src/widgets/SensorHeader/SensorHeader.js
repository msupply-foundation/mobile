import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { StyleSheet } from 'react-native';
import { TextWithIcon } from '../Typography/index';
import { BatteryIcon, CogIcon } from '../icons';
import { APP_FONT_FAMILY, BLACK, DARKER_GREY, MISTY_CHARCOAL } from '../../globalStyles/index';
import { IconButton } from '../IconButton';
import { selectSensorState } from '../../selectors/Entities/sensor';
import { gotoEditSensorPage } from '../../navigation/actions';
import { LastSensorDownload } from './LastSensorDownload';
import { BlinkSensorButton } from './BlinkSensorButton';
import { FlexRow } from '../FlexRow';
import { ExportTemperatureDataButton } from './ExportTemperatureDataButton';
import { SensorIsInDangerCircle } from './SensorIsInDangerCircle';
import { formatBatteryLevel } from '../../utilities/formatters';

export const SensorHeaderComponent = ({
  batteryLevel,
  name,
  macAddress,
  editSensor,
  showCog,
  showTitle,
  sensorID,
}) => (
  <>
    <FlexRow flex={1} alignItems="center">
      {showTitle && (
        <TextWithIcon
          left
          text={name}
          size="ms"
          textStyle={localStyles.paperTitleText}
          containerStyle={{}}
          Icon={<SensorIsInDangerCircle id={sensorID} />}
        >
          {name}
        </TextWithIcon>
      )}
    </FlexRow>

    <LastSensorDownload id={sensorID} />
    <TextWithIcon
      containerStyle={localStyles.headerTextWithIcon}
      size="s"
      Icon={<BatteryIcon color={MISTY_CHARCOAL} />}
    >
      {formatBatteryLevel(batteryLevel)}
    </TextWithIcon>

    <ExportTemperatureDataButton macAddress={macAddress} />
    <BlinkSensorButton macAddress={macAddress} />
    {showCog && (
      <IconButton
        Icon={<CogIcon color={BLACK} />}
        onPress={editSensor}
        containerStyle={{ width: 50, justifyContent: 'center' }}
      />
    )}
  </>
);

SensorHeaderComponent.defaultProps = {
  macAddress: 'AA:BB:CC:DD:EE:FF',
  batteryLevel: 99,
  name: '',
  showCog: false,
  showTitle: false,
  sensorID: '',
};

SensorHeaderComponent.propTypes = {
  name: PropTypes.string,
  macAddress: PropTypes.string,
  batteryLevel: PropTypes.number,
  editSensor: PropTypes.func.isRequired,
  showCog: PropTypes.bool,
  showTitle: PropTypes.bool,
  sensorID: PropTypes.string,
};

const localStyles = StyleSheet.create({
  paperTitleText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
  },
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
  },
});

const stateToProps = (state, props) => {
  const { sensor } = props;
  const { id: sensorID, macAddress } = sensor ?? {};

  const { byId = {} } = selectSensorState(state) ?? {};
  const sensorState = byId[sensorID];
  const { batteryLevel, name } = sensorState ?? {};

  return { batteryLevel, name, macAddress, sensorID };
};

const dispatchToProps = (dispatch, props) => {
  const { sensor } = props;

  const editSensor = () => dispatch(gotoEditSensorPage(sensor));

  return { editSensor };
};

export const SensorHeader = connect(stateToProps, dispatchToProps)(SensorHeaderComponent);
