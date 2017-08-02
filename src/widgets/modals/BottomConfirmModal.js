/* @flow weak */

/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Button } from 'react-native-ui-components';
import { BottomModal } from './BottomModal';
import globalStyles, { SUSSOL_ORANGE } from '../../globalStyles';
import { modalStrings } from '../../localization';

export function BottomConfirmModal(props) {
  const { onCancel, onConfirm, questionText, confirmText, cancelText, ...modalProps } = props;
  return (
    <BottomModal {...modalProps}>
      <Text style={[globalStyles.text, localStyles.questionText]}>
        {questionText}
      </Text>
      <Button
        style={[globalStyles.button, localStyles.cancelButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={cancelText}
        onPress={onCancel}
      />
      <Button
        style={[globalStyles.button, localStyles.deleteButton]}
        textStyle={[globalStyles.buttonText, localStyles.buttonText]}
        text={confirmText}
        onPress={onConfirm}
      />
    </BottomModal>
   );
}

BottomConfirmModal.propTypes = {
  style: View.propTypes.style,
  isOpen: PropTypes.bool.isRequired,
  questionText: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
};
BottomConfirmModal.defaultProps = {
  style: {},
  cancelText: modalStrings.cancel,
  confirmText: modalStrings.confirm,
};

const localStyles = StyleSheet.create({
  questionText: {
    color: 'white',
    fontSize: 22,
    paddingRight: 10,
  },
  buttonText: {
    color: 'white',
  },
  cancelButton: {
    borderColor: 'white',
  },
  deleteButton: {
    borderColor: 'white',
    backgroundColor: SUSSOL_ORANGE,
  },
});
