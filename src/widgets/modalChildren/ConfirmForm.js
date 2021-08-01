/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Dimensions,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { OnePressButton } from '..';
import { modalStrings } from '../../localization';

import globalStyles, { DARK_GREY } from '../../globalStyles';

export const ConfirmForm = props => {
  const {
    questionText,
    confirmText,
    cancelText,
    style,
    textStyle,
    buttonTextStyle,
    buttonContainerStyle,
    confirmButtonStyle,
    cancelButtonStyle,
    onConfirm,
    onCancel,
    noCancel,
    ...modalProps
  } = props;

  // On opening, dismiss the keyboard to ensure editable cells lose their focus
  // and their values become fixed (so that they save correctly)
  if (modalProps.isOpen) Keyboard.dismiss();

  return (
    <>
      {!noCancel && !!onCancel && (
        <TouchableOpacity onPress={onCancel} style={defaultStyles.closeButton}>
          <Icon name="md-close" style={defaultStyles.closeIcon} />
        </TouchableOpacity>
      )}
      <View style={defaultStyles.contentContainer}>
        <Text style={textStyle}>{questionText}</Text>
        <View style={[defaultStyles.buttonContainer, buttonContainerStyle]}>
          {!noCancel && !!onCancel && (
            <OnePressButton
              style={[globalStyles.button, cancelButtonStyle]}
              textStyle={[globalStyles.buttonText, buttonTextStyle]}
              text={cancelText}
              onPress={onCancel}
            />
          )}
          {!!onConfirm && (
            <OnePressButton
              style={[globalStyles.button, confirmButtonStyle]}
              textStyle={[globalStyles.buttonText, buttonTextStyle]}
              text={confirmText}
              onPress={onConfirm}
            />
          )}
        </View>
      </View>
    </>
  );
};

/* eslint-disable react/require-default-props */
ConfirmForm.propTypes = {
  style: ViewPropTypes.style,
  buttonContainerStyle: ViewPropTypes.style,
  buttonTextStyle: Text.propTypes.style,
  cancelButtonStyle: ViewPropTypes.style,
  cancelText: PropTypes.string,
  confirmButtonStyle: ViewPropTypes.style,
  confirmText: PropTypes.string,
  textStyle: Text.propTypes.style,
  isOpen: PropTypes.bool.isRequired,
  questionText: PropTypes.string,
  noCancel: PropTypes.bool,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

/* eslint-disable react/default-props-match-prop-types */
ConfirmForm.defaultProps = {
  backdropColor: DARK_GREY,
  backdropOpacity: 0.97,
  style: globalStyles.confirmModal,
  textStyle: globalStyles.confirmModalText,
  buttonContainerStyle: globalStyles.confirmModalButtonContainer,
  cancelButtonStyle: globalStyles.confirmModalButton,
  confirmButtonStyle: [globalStyles.confirmModalButton, globalStyles.confirmModalConfirmButton],
  buttonTextStyle: globalStyles.confirmModalButtonText,
  cancelText: modalStrings.cancel,
  confirmText: modalStrings.confirm,
  swipeToClose: false, // negating the default.
  backdropPressToClose: false, // negating the default.
  questionText: '',
};

const defaultStyles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 50,
  },
  contentContainer: {
    paddingTop: Dimensions.get('window').height / 3, // Start the content 33% down the page
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
