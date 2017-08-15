/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';
import { Button, ProgressBar } from '../widgets';
import { formatPlural, formatDate } from '../utilities';
import { syncStrings } from '../localization';
import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../globalStyles';
import {
    PROGRESS_LOADING,
} from './constants';

const getStatusMessage = (progress, total, isSyncing, errorMessage) => {
  let message;

  if (errorMessage !== '') {
    message = errorMessage;
  } else if (!isSyncing) {
    message = 'Sync Complete.';
  } else if (progress >= total) {
    message = 'All records updated.';
  } else if (progress === PROGRESS_LOADING) {
    message = 'Loading change count...';
  } else {
    message = `${progress} of ${formatPlural('@count record', '@count records', total)} updated`;
  }

  return message;
};

const getSyncDateLabel = (syncTime) => {
  if (syncTime > 0) {
    return formatDate(new Date(syncTime), 'H:mm, MMMM D, YYYY');
  }
  return '-';
};

export function SyncModal({ isOpen, onClose, onPressManualSync, state }) {
  const {
    progress,
    total,
    isSyncing,
    lastSyncTime,
    errorMessage,
  } = state;
  return (
    <Modal
      isOpen={isOpen}
      style={[globalStyles.modal, localStyles.modal]}
      backdropPressToClose={false}
      backdropOpacity={1}
      swipeToClose={false}
      position="top"
    >
      <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
        <Icon name="md-close" style={localStyles.closeIcon} />
      </TouchableOpacity>
      <View style={localStyles.contentContainer} >
        <View style={localStyles.row}>
          <Text style={localStyles.progressDescription}>
            {getStatusMessage(progress, total, isSyncing, errorMessage)}
          </Text>
          <View style={localStyles.progressBarContainer} >
            <ProgressBar total={total} progress={progress} isComplete={!isSyncing} />
          </View>
        </View>
        <View style={localStyles.row}>
          <Text style={localStyles.lastSyncText}>
            Last successful sync
          </Text>
          <Text style={localStyles.lastSyncText}>
            {getSyncDateLabel(lastSyncTime)}
          </Text>
        </View>
        <View style={localStyles.row}>
          <Button
            style={[globalStyles.button, localStyles.button]}
            textStyle={[globalStyles.authFormButtonText, localStyles.buttonText]}
            text={syncStrings.manual_sync}
            onPress={onPressManualSync}
            disabledColor={WARM_GREY}
            isDisabled={isSyncing}
          />
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  modal: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: DARK_GREY,
    opacity: 0.88,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
  },
  button: {
    width: 200,
    backgroundColor: SUSSOL_ORANGE,
    borderWidth: 0,
    alignSelf: 'center',
  },
  progressDescription: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    width: Dimensions.get('window').width / 3,
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  lastSyncText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  syncIconRow: {
    flexDirection: 'row',
  },
  exchangeIcon: {
    opacity: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  closeIcon: {
    fontSize: 36,
    color: 'white',
  },
});

SyncModal.propTypes = {
  state: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onPressManualSync: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

SyncModal.defaultProps = {
  progress: 0,
  total: 0,
  errorMessage: '',
  lastSyncDate: undefined,
  isSyncing: false,
};
