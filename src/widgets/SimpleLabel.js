/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';

import {
  APP_GENERAL_FONT_SIZE,
  APP_FONT_FAMILY,
  SUSSOL_ORANGE,
  DARKER_GREY,
} from '../globalStyles/index';

/**
 * Simple text label rendering in the form [label] [text] in various
 * sizes.
 *
 * @prop {String} label  The label text
 * @prop {String} text   The text string
 * @prop {String} size   The size of the label: "small", "medium" or "large"
 *
 */
export const SimpleLabel = React.memo(
  ({
    label,
    text,
    size,
    labelAlign,
    textAlign,
    labelBackground,
    textBackground,
    numberOfLines,
    bold,
  }) => {
    // Ensure null is set rather than any other nullish value as null is a node, but "" is not.
    const usingText = text || null;
    const usingLabel = label || null;
    const styles = React.useMemo(() => simpleLabelStyles(size), [size]);
    const { labelStyle, textStyle, containerStyle } = styles;
    return (
      <View style={containerStyle}>
        {!!usingLabel && (
          <Text
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
            style={{
              ...labelStyle,
              textAlign: labelAlign,
              backgroundColor: labelBackground,
              fontWeight: bold ? 'bold' : 'normal',
            }}
          >
            {`${label}  `}
          </Text>
        )}
        {!!usingText && (
          <Text
            numberOfLines={numberOfLines}
            ellipsizeMode="tail"
            style={{
              ...textStyle,
              textAlign,
              backgroundColor: textBackground,
              fontWeight: bold ? 'bold' : 'normal',
            }}
          >
            {text}
          </Text>
        )}
      </View>
    );
  }
);

const FONT_SIZES = {
  small: APP_GENERAL_FONT_SIZE,
  medium: 18,
  large: 20,
};

const simpleLabelStyles = size => ({
  labelStyle: {
    fontFamily: APP_FONT_FAMILY,
    color: SUSSOL_ORANGE,
    fontSize: FONT_SIZES[size],
    fontWeight: 'bold',
    flex: 1,
    flexShrink: 1,
  },
  textStyle: {
    flex: 1,
    flexGrow: 1,
    fontFamily: APP_FONT_FAMILY,
    color: DARKER_GREY,
    fontSize: FONT_SIZES[size],
  },
  containerStyle: { flexDirection: 'row', flex: 1, alignItems: 'center' },
});

SimpleLabel.defaultProps = {
  size: 'small',
  text: '',
  label: '',
  labelAlign: 'left',
  textAlign: 'left',
  numberOfLines: 2,
  labelBackground: 'transparent',
  textBackground: 'transparent',
  bold: false,
};

SimpleLabel.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  label: PropTypes.string,
  labelAlign: PropTypes.string,
  textAlign: PropTypes.string,
  numberOfLines: PropTypes.number,
  labelBackground: PropTypes.string,
  textBackground: PropTypes.string,
  bold: PropTypes.bool,
};
