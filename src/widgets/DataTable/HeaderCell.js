/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, View, TouchableOpacityPropTypes } from 'react-native';

import { getAdjustedStyle } from './utilities';
import { debounce } from '../../utilities';
/**
 * Simple component to be used in conjunction with HeaderRow component.
 *
 * Renders a title and if passed, a sorting icon.
 *
 * @param {String} title                 Text to display in the cell
 * @param {String} columnKey             The key for the column the cell heads.
 * @param {Func}   onPressAction         Action for dispatching on press
 * @param {Func}   dispatch              Dispatcher to backing reducer
 * @param {Node}   SortAscComponent      Component displayed when sorting is ascending.
 * @param {Node}   SortDescComponent     Component displayed when sorting is descending.
 * @param {Node}   SortNeutralComponent  Component displayed when no sorting is applied.
 * @param {Object} containerStyle        Style object for the wrapping Touchable or View.
 * @param {Object} textStyle             Style object for the inner Text component.
 * @param {Number} width                 Optional flex property to inject into styles.
 * @param {Bool}   isLastCell            Indicator for if this cell is the last
 *                                       in a row. Removing the borderRight if true.
 */
const HeaderCell = React.memo(
  ({
    title,
    columnKey,
    sortDirection,
    SortAscComponent,
    SortDescComponent,
    SortNeutralComponent,
    onPress,
    sortable,
    containerStyle,
    textStyle,
    width,
    isLastCell,
    ...otherProps
  }) => {
    const onPressCell = React.useCallback(
      debounce(() => onPress(columnKey), 300, true),
      [columnKey, onPress]
    );

    const Icon = () => {
      switch (sortDirection) {
        case 'ASC': {
          return SortAscComponent;
        }
        case 'DESC': {
          return SortDescComponent;
        }
        default: {
          return SortNeutralComponent;
        }
      }
    };

    const Container = onPress ? TouchableOpacity : View;

    const internalContainerStyle = getAdjustedStyle(containerStyle, width, isLastCell);

    return (
      <Container style={internalContainerStyle} onPress={onPressCell} {...otherProps}>
        <Text style={textStyle}>{title}</Text>
        {!!sortable && <Icon />}
      </Container>
    );
  }
);

HeaderCell.defaultProps = {
  dispatch: null,
  onPressAction: null,
  sortDirection: null,
  containerStyle: {},
  textStyle: {},
  sortable: false,
  width: 0,
  isLastCell: false,
  SortAscComponent: null,
  SortDescComponent: null,
  SortNeutralComponent: null,
  columnKey: '',
};

HeaderCell.propTypes = {
  ...TouchableOpacityPropTypes,
  title: PropTypes.string.isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPressAction: PropTypes.func,
  dispatch: PropTypes.func,
  sortDirection: PropTypes.oneOf(['ASC', 'DESC']),
  SortAscComponent: PropTypes.node,
  SortDescComponent: PropTypes.node,
  SortNeutralComponent: PropTypes.node,
  containerStyle: PropTypes.object,
  textStyle: PropTypes.object,
  width: PropTypes.number,
  sortable: PropTypes.bool,
  isLastCell: PropTypes.bool,
};

export default HeaderCell;
