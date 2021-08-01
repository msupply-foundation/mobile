/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Text, View, TouchableOpacity } from 'react-native';

import { SyncIcon } from './SyncIcon';

import { syncStrings } from '../localization';
import { formatDate } from '../utilities';
import globalStyles from '../globalStyles';
import { openSyncModal } from '../actions/SyncActions';

const mapStateToProps = state => {
  const { sync } = state;
  return sync;
};

const mapDispatchToProps = dispatch => {
  const onOpenSyncModal = () => dispatch(openSyncModal());
  return { onOpenSyncModal };
};

export const SyncStateComponent = ({
  lastSyncTime,
  isSyncing,
  errorMessage,
  showText,
  onOpenSyncModal,
}) => {
  const syncMessage = isSyncing ? syncStrings.sync_in_progress : syncStrings.sync_enabled;
  const formattedDate = formatDate(new Date(lastSyncTime), 'dots');
  const errorText = `${syncStrings.sync_error}. ${syncStrings.last_sync} ${formattedDate}`;
  const hasError = !!errorMessage?.length;

  const Container = showText ? TouchableOpacity : View;

  return (
    <Container onPress={onOpenSyncModal} style={globalStyles.navBarRightContainer}>
      {!!showText && (
        <Text style={globalStyles.navBarText}>{hasError ? errorText : syncMessage}</Text>
      )}
      <SyncIcon isActive={!hasError} />
    </Container>
  );
};

SyncStateComponent.defaultProps = {
  showText: true,
  onOpenSyncModal: null,
};

SyncStateComponent.propTypes = {
  lastSyncTime: PropTypes.number.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  showText: PropTypes.bool,
  onOpenSyncModal: PropTypes.func,
};

export const SyncState = connect(mapStateToProps, mapDispatchToProps)(SyncStateComponent);
