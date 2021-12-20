/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';

import TouchableCell from './TouchableCell';

/**
 * Renders a cell with an icon, supports touchable interaction and disabling
 *
 * @param {string|number} rowKey  Unique key associated to row cell is in
 * @param {string|number} columnKey Unique key associated to column cell is in
 * @param {bool} isDisabled `true` will render disabled icons passed in
 * @param {bool} isChecked  `true` will render CheckedComponent rather than UncheckedComponent
 * @param {React.element} CheckedComponent  Component to render when cell is checked
 * @param {React.element} UncheckedComponent  Component to render when cell is checked
 * @param {React.element} DisabledCheckedComponent  Component to render when cell is
 *                                                  checked and disabled
 * @param {React.element} DisabledUncheckedComponent  Component to render when cell is
 *                                                    checked and disabled
 * @param {func} onCheck Callback when this cell is checked.
 * @param {func} onUncheck Callback when this cell is unchecked.
 * @param {Object} containerStyle Style object for the containing Touchable component
 */

const CheckableCell = React.memo(
  ({
    rowKey,
    columnKey,
    isChecked,
    isDisabled,
    CheckedComponent,
    UncheckedComponent,
    DisabledCheckedComponent,
    DisabledUncheckedComponent,
    onCheck,
    onUncheck,
    containerStyle,
    width,
    isLastCell,
    debug,
  }) => {
    // eslint-disable-next-line no-console
    if (debug) console.log(`- CheckableCell: ${rowKey},${columnKey}`);

    const onPressAction = isChecked ? onUncheck : onCheck;

    const renderCheck = isChecked
      ? (isDisabled && DisabledCheckedComponent) || CheckedComponent
      : (isDisabled && DisabledUncheckedComponent) || UncheckedComponent;

    return (
      <TouchableCell
        renderChildren={renderCheck}
        rowKey={rowKey}
        columnKey={columnKey}
        onPress={onPressAction}
        containerStyle={containerStyle}
        width={width}
        isLastCell={isLastCell}
        isDisabled={isDisabled}
      />
    );
  }
);

const defaultStyles = StyleSheet.create({
  containerStyle: {},
});

CheckableCell.propTypes = {
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isChecked: PropTypes.bool,
  isDisabled: PropTypes.bool,
  CheckedComponent: PropTypes.func.isRequired,
  UncheckedComponent: PropTypes.func.isRequired,
  DisabledCheckedComponent: PropTypes.func,
  DisabledUncheckedComponent: PropTypes.func,
  onCheck: PropTypes.func.isRequired,
  onUncheck: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  width: PropTypes.number,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
};

CheckableCell.defaultProps = {
  isChecked: false,
  DisabledCheckedComponent: null,
  DisabledUncheckedComponent: null,
  isDisabled: false,
  containerStyle: defaultStyles.containerStyle,
  width: 0,
  isLastCell: false,
  debug: false,
};

export default CheckableCell;
