/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { APP_FONT_FAMILY, SUSSOL_ORANGE, BACKGROUND_COLOR, GREY } from '../globalStyles';
import { DARKER_GREY } from '../globalStyles/colors';

export const ResultRow = React.memo(
  ({ data, renderLeftText, renderRightText, onPress, isSelected, showCheckIcon }) => {
    const rowPressed = useCallback(() => onPress(data.item), [data.item]);

    return (
      <TouchableOpacity
        style={[localStyles.resultRow, isSelected && localStyles.selected]}
        onPress={rowPressed}
      >
        {showCheckIcon &&
          (isSelected ? (
            <Icon name="md-checkbox" style={localStyles.checkIcon} />
          ) : (
            <Icon name="md-square-outline" style={[localStyles.checkIcon, { color: GREY }]} />
          ))}
        <Text
          style={[
            localStyles.text,
            localStyles.itemText,
            isSelected && localStyles.selectedText,
            {
              flex: 5,
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            },
          ]}
        >
          {renderLeftText ? renderLeftText(data.item) : data.item.toString()}
        </Text>
        {!!renderRightText && (
          <Text
            style={[
              localStyles.text,
              localStyles.itemText,
              isSelected && localStyles.selectedText,
              {
                justifyContent: 'flex-end',
                textAlign: 'right',
              },
            ]}
          >
            {renderRightText(data.item)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

ResultRow.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  onPress: PropTypes.func,
  isSelected: PropTypes.bool,
  showCheckIcon: PropTypes.bool,
};

ResultRow.defaultProps = {
  renderLeftText: null,
  renderRightText: null,
  onPress: null,
  isSelected: false,
  showCheckIcon: false,
};

const localStyles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
  itemText: {
    flex: 2,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    color: DARKER_GREY,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: BACKGROUND_COLOR,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  selectedText: { color: 'white' },
  selected: {
    backgroundColor: SUSSOL_ORANGE,
    borderColor: 'white',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  checkIcon: {
    fontSize: 28,
    color: 'white',
    padding: 10,
    marginRight: 0,
  },
});

export default ResultRow;
