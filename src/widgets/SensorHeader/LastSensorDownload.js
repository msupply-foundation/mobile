import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';

import { useIntervalReRender } from '../../hooks';
import { TextWithIcon } from '../Typography/index';
import { MILLISECONDS } from '../../utilities/index';
import { formatDate, formatLogDelay } from '../../utilities/formatters';
import { WifiIcon, WifiOffIcon } from '../icons';
import { MISTY_CHARCOAL } from '../../globalStyles/index';
import {
  selectIsDownloading,
  selectLastDownloadFailed,
  selectLastDownloadStatus,
  selectLastDownloadTime,
} from '../../selectors/Bluetooth/sensorDownload';
import { vaccineStrings } from '../../localization';
import { selectSensorById } from '../../selectors/Entities/sensor';

const formatErrorMessage = status => vaccineStrings[status] ?? '';

const getText = (isPaused, isDelayed, logDelay, lastDownloadTime, lastDownloadStatus) => {
  if (lastDownloadStatus && lastDownloadStatus !== 'OK') {
    return formatErrorMessage(lastDownloadStatus);
  }

  if (isPaused) {
    return vaccineStrings.is_paused;
  }
  if (isDelayed) {
    return formatLogDelay(logDelay);
  }
  return formatDate(lastDownloadTime);
};

export const LastSensorDownloadComponent = ({
  isDownloading,
  isPaused,
  lastDownloadFailed,
  lastDownloadTime,
  logDelay,
  lastDownloadStatus,
}) => {
  useIntervalReRender(MILLISECONDS.TEN_SECONDS);

  const timeNow = new Date().getTime();
  const isDelayed = logDelay > timeNow;

  const wifiRef = useRef();

  useEffect(() => {
    if (isDownloading) wifiRef?.current.flash(MILLISECONDS.ONE_SECOND);
    else wifiRef?.current?.stopAnimation();
  }, [isDownloading, wifiRef]);

  return (
    <Animatable.View
      ref={wifiRef}
      animation="flash"
      easing="ease-out"
      iterationCount="infinite"
      style={{ justifyContent: 'center' }}
    >
      <TextWithIcon
        containerStyle={{ paddingHorizontal: 8 }}
        margin={0}
        size="s"
        Icon={
          lastDownloadFailed || isDelayed || isPaused ? (
            <WifiOffIcon size={20} color={MISTY_CHARCOAL} />
          ) : (
            <WifiIcon size={20} color={MISTY_CHARCOAL} />
          )
        }
      >
        {getText(isPaused, isDelayed, logDelay, lastDownloadTime, lastDownloadStatus)}
      </TextWithIcon>
    </Animatable.View>
  );
};

LastSensorDownloadComponent.defaultProps = {
  lastDownloadTime: null,
  logDelay: 0,
  lastDownloadStatus: '',
};

LastSensorDownloadComponent.propTypes = {
  isDownloading: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  lastDownloadFailed: PropTypes.bool.isRequired,
  lastDownloadTime: PropTypes.instanceOf(Date),
  logDelay: PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(Date)]),
  lastDownloadStatus: PropTypes.string,
};

const stateToProps = (state, props) => {
  const { id } = props;

  const sensor = selectSensorById(state, id);
  const { isPaused = false, logDelay, macAddress } = sensor;

  const lastDownloadTime = selectLastDownloadTime(state, macAddress);
  const lastDownloadFailed = selectLastDownloadFailed(state, macAddress);
  const isDownloading = selectIsDownloading(state, macAddress);
  const lastDownloadStatus = selectLastDownloadStatus(state, macAddress);

  return {
    lastDownloadTime,
    lastDownloadFailed,
    lastDownloadStatus,
    isDownloading,
    logDelay,
    isPaused,
  };
};

export const LastSensorDownload = connect(stateToProps)(LastSensorDownloadComponent);
