/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { getCurrentRouteName } from '../navigation';

function mapStateToProps({ navigation }) {
  return {
    currentRouteName: getCurrentRouteName(navigation),
  };
}

export const PageContainer = connect(
  mapStateToProps,
)(Page);

function Page(props) {
  const SpecificPage = props.page;
  return <SpecificPage {...extractPropsForPage(props)} />;
}

Page.propTypes = {
  page: PropTypes.any,
};

function extractPropsForPage(props) {
  const { currentRouteName, screenProps, navigation, ...restOfProps } = props;
  const { navigate, goBack, state } = navigation;
  const { params, routeName: thisPageRouteName, ...restOfNavigationState } = state;
  const isCurrentRoute = thisPageRouteName === currentRouteName;
  const navigateTo = (routeName, title, otherParams, type = 'push') => {
    Keyboard.dismiss(); // Dismiss keyboard before navigating to a different scene
    const push = () => navigate(routeName, { title, ...otherParams });
    const navigationFunctions = {
      push,
      replace: () => {
        goBack();
        push();
      },
      goBack,
    };
    const navigationFunction = navigationFunctions[type] || push;
    navigationFunction();
  };
  return {
    topRoute: isCurrentRoute,
    ...screenProps,
    ...params,
    ...restOfNavigationState,
    navigateTo,
    ...restOfProps,
  };
}
