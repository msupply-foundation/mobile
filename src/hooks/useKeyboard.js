import { useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboard = () => {
  const keyboard = useRef({ height: 0, duration: 0, visible: false }).current;

  const callback = (event, visible) => {
    keyboard.height = event.endCoordinates.height;
    keyboard.duration = event.duration;
    keyboard.visible = visible;
  };

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', event => callback(event, true)),
      Keyboard.addListener('keyboardDidHide', event => callback(event, false)),
    ];

    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  return keyboard;
};
