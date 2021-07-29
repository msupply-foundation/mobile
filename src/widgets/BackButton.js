/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { debounce } from '../utilities';

import { getRouteTitle, RootNavigator } from '../navigation';

import { goBack } from '../navigation/actions';

import { BackIcon } from './icons';
import { FlexRow } from './FlexRow';

import { textStyles } from '../globalStyles';

const mapStateToProps = state => {
  const { pages = {} } = state;
  const { currentRoute = '' } = pages;
  const { [currentRoute]: currentPageState = {} } = pages;
  const { pageObject } = currentPageState;
  return { title: getRouteTitle(pageObject, currentRoute) };
};

const mapDispatchToProps = dispatch => {
  const onBack = debounce(() => dispatch(goBack()), 500, true);

  return { onBack };
};

export const BackButtonComponent = ({ title, onBack }) =>
  !!RootNavigator.canGoBack() && (
    <TouchableOpacity onPress={onBack}>
      <FlexRow flex={1} justifyContent="center" alignItems="center">
        <BackIcon />
        <Text style={localStyles.title}>{title}</Text>
      </FlexRow>
    </TouchableOpacity>
  );

BackButtonComponent.propTypes = {
  onBack: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const localStyles = StyleSheet.create({ title: { ...textStyles, marginLeft: 30 } });

export const BackButton = connect(mapStateToProps, mapDispatchToProps)(BackButtonComponent);
