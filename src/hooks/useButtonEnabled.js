import { useIsFocused } from '@react-navigation/native';
import React, { useState } from 'react';

export default function useButtonEnabled(defaultValue = true) {
  const [enabled, setEnabled] = useState(defaultValue);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (!isFocused) {
      setEnabled(true);
    }
  }, [isFocused]);

  return { enabled, setEnabled };
}
