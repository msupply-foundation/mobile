/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import { FlexRow } from '../FlexRow';

import { SUSSOL_ORANGE, APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../globalStyles';

export const FormLabel = ({ isRequired, value, textStyle, isRequiredStyle }) => (
  <FlexRow flex={1} alignItems="center">
    <Text style={[localStyles.textStyle, textStyle]}>{value}</Text>
    {(!!isRequired && <Text style={isRequiredStyle}>*</Text>) || null}
  </FlexRow>
);

const localStyles = StyleSheet.create({
  textStyle: {
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
  isRequiredStyle: { fontSize: 12, color: SUSSOL_ORANGE, fontFamily: APP_FONT_FAMILY },
});

FormLabel.defaultProps = {
  textStyle: localStyles.textStyle,
  isRequiredStyle: localStyles.isRequiredStyle,
  isRequired: false,
};

FormLabel.propTypes = {
  value: PropTypes.string.isRequired,
  isRequired: PropTypes.bool,
  textStyle: PropTypes.object,
  isRequiredStyle: PropTypes.object,
};
