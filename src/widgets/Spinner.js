/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Animated, StyleSheet } from 'react-native';

export const Spinner = props => {
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progressAnimation, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => {
      animation.stop();
      progressAnimation.setValue(0);
    };
  }, []);

  const { color } = props;

  const interpolatedRotateAnimation = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View
      style={[
        localStyles.square,
        {
          backgroundColor: color,
          transform: [{ rotate: interpolatedRotateAnimation }],
        },
      ]}
    />
  );
};

export default Spinner;

Spinner.propTypes = {
  color: PropTypes.string,
};

Spinner.defaultProps = {
  color: '#B7B7B7',
};

const localStyles = StyleSheet.create({
  square: {
    width: 40,
    height: 40,
  },
});
