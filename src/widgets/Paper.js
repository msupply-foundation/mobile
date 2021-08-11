/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';

import { WHITE, DARKER_GREY, BACKGROUND_COLOR, APP_FONT_FAMILY } from '../globalStyles';

export const Paper = ({
  width,
  height,
  paddingHorizontal,
  Header,
  headerText,
  style,
  headerContainerStyle,
  contentContainerStyle,
  children,
}) => {
  let internalContainerStyle = [localStyles.container, style];

  if (width) internalContainerStyle = [localStyles.container, { width }];
  if (height) internalContainerStyle = [internalContainerStyle, localStyles.container, { height }];

  const InternalHeader =
    Header || (!!headerText && <Text style={localStyles.headerText}>{headerText}</Text>);

  const internalHeaderContainerStyle = InternalHeader && [
    localStyles.headerContainer,
    { paddingHorizontal },
    headerText && { alignItems: 'center' },
    headerContainerStyle,
  ];

  return (
    <View style={internalContainerStyle}>
      {InternalHeader && <View style={internalHeaderContainerStyle}>{InternalHeader}</View>}
      <View style={[localStyles.contentContainer, { paddingHorizontal }, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    margin: 5, // Need some margin to accomodate shadow (elevation prop)
    marginVertical: 15,
    elevation: 2,
    borderRadius: 4,
    backgroundColor: WHITE,
  },
  contentContainer: {
    flex: 0,
  },
  headerContainer: {
    flex: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: BACKGROUND_COLOR,
  },
  headerText: {
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    fontSize: 14,
  },
});

Paper.defaultProps = {
  width: null,
  height: null,
  paddingHorizontal: 10,
  style: {},
  headerContainerStyle: {},
  contentContainerStyle: {},
  Header: null,
  headerText: null,
  children: null,
};

Paper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  paddingHorizontal: PropTypes.number,
  style: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  Header: PropTypes.node,
  headerText: PropTypes.string,
  headerContainerStyle: PropTypes.object,
  children: PropTypes.node,
};
