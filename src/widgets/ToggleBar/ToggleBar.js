/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { StyleSheet, Text, TouchableOpacity, ViewPropTypes, View } from 'react-native';
import globalStyles, { WARMER_GREY, SUSSOL_ORANGE, APP_FONT_FAMILY } from '../../globalStyles';

/**
 * Renders a bar of multiple toggling buttons, defined by the array 'toggles' passed in.
 * State in the parent should control the isOn of each toggle.
 * @param   {object}          props             Properties passed where component was created.
 * @prop    {StyleSheet}      style             Style of the containing View.
 * @prop    {StyleSheet}      toggleOffStyle    Style of the TouchableOpacities when not isOn.
 * @prop    {StyleSheet}      toggleOnStyle     Style of the TouchableOpacities when isOn.
 * @prop    {StyleSheet}      textOffStyle      Style of the Text when not isOn.
 * @prop    {StyleSheet}      textOnStyle       Style of the Text when  isOn.
 * @prop    {array<object>}   toggles           Array of objects representing each button in the
 *                                              toggle bar, in order left to right, top to bottom.
 * @return  {React.Component}                   Returns a View containing the toggle
 *                                              buttons (TouchableOpacity).
 *
 * toggles array format: [{
                          text: 'string',
                          onPress: 'func',
                          isOn: 'boolean',
                        }]
 *
 */

export const ToggleBarComponent = props => {
  const {
    style,
    toggleOffStyle,
    toggleOnStyle,
    textOffStyle,
    textOffDisabledStyle,
    textOnStyle,
    toggles,
    isDisabled,
    toggleOnDisabledStyle,
    toggleOffDisabledStyle,
    ...containerProps
  } = props;

  const renderToggles = buttons => {
    if (buttons.length === 0) return [];
    const renderOutput = [];

    const defaultOnStyle = isDisabled ? toggleOnDisabledStyle : toggleOnStyle;
    const defaultOffStyle = isDisabled ? toggleOffDisabledStyle : toggleOffStyle;
    const defaultOffTextStyle = isDisabled ? textOffDisabledStyle : textOffStyle;

    buttons.forEach((button, i) => {
      const currentTextStyle = button.isOn ? textOnStyle : defaultOffTextStyle;
      const currentToggleStyle = button.isOn ? defaultOnStyle : defaultOffStyle;
      const Container = isDisabled ? View : TouchableOpacity;

      renderOutput.push(
        <Container
          // TODO: use key which is not index.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={currentToggleStyle}
          onPress={button.onPress}
        >
          <Text style={currentTextStyle}>{button.text}</Text>
        </Container>
      );
    });

    return renderOutput;
  };

  return (
    <View style={[localStyles.container, style]} {...containerProps}>
      {renderToggles(toggles)}
    </View>
  );
};

export const ToggleBar = React.memo(ToggleBarComponent);

export default ToggleBar;

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    height: 45,
    borderWidth: 1,
    borderColor: SUSSOL_ORANGE,
    marginHorizontal: 5,
    borderRadius: 4,
  },
  toggleOffStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 142,
  },
  toggleOnStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 142,
    backgroundColor: SUSSOL_ORANGE,
  },
  toggleOnDisabledStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARMER_GREY,
    width: 142,
  },
  toggleOffDisabledStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: WARMER_GREY,
    width: 142,
  },
  textOffDisabledStyle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: WARMER_GREY,
  },
});

ToggleBarComponent.propTypes = {
  style: ViewPropTypes.style,
  // eslint-disable-next-line react/require-default-props, react/forbid-prop-types
  toggles: PropTypes.array,
  toggleOffStyle: ViewPropTypes.style,
  toggleOnStyle: ViewPropTypes.style,
  textOffStyle: Text.propTypes.style,
  textOnStyle: Text.propTypes.style,
  isDisabled: PropTypes.bool,
  textOffDisabledStyle: Text.propTypes.style,
  toggleOnDisabledStyle: PropTypes.object,
  toggleOffDisabledStyle: PropTypes.object,
};

ToggleBarComponent.defaultProps = {
  style: globalStyles.toggleBar,
  toggleOffStyle: localStyles.toggleOffStyle,
  toggleOnStyle: localStyles.toggleOnStyle,
  textOffStyle: globalStyles.toggleText,
  textOnStyle: globalStyles.toggleTextSelected,
  isDisabled: false,
  textOffDisabledStyle: localStyles.textOffDisabledStyle,
  toggleOnDisabledStyle: localStyles.toggleOnDisabledStyle,
  toggleOffDisabledStyle: localStyles.toggleOffDisabledStyle,
};
