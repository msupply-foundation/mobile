import React, { useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useKeyboard } from '../hooks';

export const KeyboardSpacing = React.memo(() => {
  const { height, duration } = useKeyboard();
  const animatedValue = useRef(new Animated.Value(0)).current;

  Animated.timing(animatedValue, {
    toValue: height,
    duration,
    easing: Easing.linear,
    useNativeDriver: false,
  }).start();

  return <Animated.View style={{ height: animatedValue }} />;
});
