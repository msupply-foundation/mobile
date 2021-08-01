/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableHighlight, StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import globalStyles from '../globalStyles/index';

/**
 * Simple component rendering a button with an icon, and option text label on the right side
 *
 * @prop {Node} Icon An icon component (JSX literal).
 * @prop {Func} onPress OnPress callback.
 * @prop {Func} onPressIn onPressIn callback.
 * @prop {Func} onPressOut  onPressOut callback.
 * @prop {Boolean} containerStyle  override default styles.
 * @prop {Boolean} isDisabled  When true, no action on press. Disabled styling too.
 * @prop {String} label Button label text to right of icon
 */
export const IconButton = ({
  Icon,
  onPress,
  onPressIn,
  onPressOut,
  containerStyle,
  isDisabled,
  label,
  labelStyle,
  right,
  hitSlop,
  underlayColor,
}) => {
  const internalLabelStyle = [localStyles.label, globalStyles.authWindowButtonText, labelStyle];
  const buttonContainerStyle = [localStyles.buttonContainer, containerStyle];
  const Container = isDisabled ? View : TouchableHighlight;

  return (
    <Container
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      hitSlop={hitSlop}
      style={buttonContainerStyle}
      underlayColor={underlayColor}
    >
      <>
        {!right && Icon}
        {!!label && <Text style={internalLabelStyle}>{label}</Text>}
        {!!right && Icon}
      </>
    </Container>
  );
};

IconButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
  containerStyle: null,
  isDisabled: false,
  label: null,
  labelStyle: {},
  right: false,
  hitSlop: {},
  underlayColor: 'none',
};

IconButton.propTypes = {
  hitSlop: PropTypes.shape({
    bottom: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number,
    right: PropTypes.number,
  }),
  labelStyle: PropTypes.object,
  Icon: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  containerStyle: PropTypes.object,
  isDisabled: PropTypes.bool,
  label: PropTypes.string,
  right: PropTypes.bool,
  underlayColor: PropTypes.string,
};

const localStyles = StyleSheet.create({
  label: {
    paddingHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
