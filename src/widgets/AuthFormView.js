import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import globalStyles from '../globalStyles';

import { useKeyboardIsOpen } from '../hooks/useKeyboardIsOpen';

export const AuthFormView = props => {
  const { children } = props;
  const keyboardIsOpen = useKeyboardIsOpen();
  const marginTop = keyboardIsOpen ? 0 : 80;
  return <View style={[globalStyles.authFormContainer, { marginTop }]}>{children}</View>;
};

AuthFormView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
