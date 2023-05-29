import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useMountProtectedState } from './useMountProtectedState';

/**
 * Hooks used to return keyboard event details when the keyboard is opened/closed.
 * @returns {object} Keyboard event details object. E.g.
 * `{"height": 350, "duration": 100, "visible": true}`
 */
export const useKeyboard = () => {
  const [keyboard, setKeyboard] = useMountProtectedState({
    height: 0,
    duration: 0,
    visible: false,
  });

  const callback = (event, visible) =>
    setKeyboard({ height: event.endCoordinates.height, duration: event.duration, visible });

  useEffect(() => {
    const subscriptions = [
      Keyboard.addListener('keyboardDidShow', event => callback(event, true)),
      Keyboard.addListener('keyboardDidHide', event => callback(event, false)),
    ];

    return () => subscriptions.forEach(subscription => subscription.remove());
  }, []);

  return keyboard;
};
