/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';

import { SUSSOL_ORANGE, LIGHT_GREY } from '../globalStyles/index';
import { Circle } from './Circle';

const SIZE_VALUES = {
  small: 15,
  medium: 22,
  large: 30,
};

const ICON_SIZE_VALUES = {
  small: 8,
  medium: 13,
  large: 17,
};

/**
 * Simple component rendering a button with a circular border radius
 * with an icon centered.
 *
 * @prop {Node} IconComponent An icon component to render in the center of the circle.
 * @prop {Func} onPress       OnPress callback.
 */
export const CircleButton = ({
  IconComponent,
  onPress,
  onPressIn,
  onPressOut,
  isDisabled,
  size,
}) => {
  const Container = isDisabled ? View : TouchableOpacity;

  const backgroundColor = isDisabled ? LIGHT_GREY : SUSSOL_ORANGE;

  return (
    <Container onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Circle size={SIZE_VALUES[size]} backgroundColor={backgroundColor} elevate>
        <IconComponent size={ICON_SIZE_VALUES[size]} />
      </Circle>
    </Container>
  );
};

CircleButton.defaultProps = {
  onPress: null,
  onPressIn: null,
  onPressOut: null,
  isDisabled: false,
  size: 'large',
};

CircleButton.propTypes = {
  IconComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  isDisabled: PropTypes.bool,
  size: PropTypes.string,
};
