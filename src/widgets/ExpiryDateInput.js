/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { View, TextInput } from 'react-native';

import Cell from './DataTable/Cell';

import { useExpiryDateMask } from '../hooks/useExpiryDateMask';

import { dataTableStyles } from '../globalStyles/index';
import { parseExpiryDate, formatExpiryDate } from '../utilities';

import { getAdjustedStyle } from './DataTable/utilities';
import RefContext from './DataTable/RefContext';
import { useDebounce } from '../hooks';

/**
 * Renders an expiry date cell, managing its own state and not submitting
 * a date to be committed to the underlying model until a valid date has
 * been submitted.
 *
 * Similar to EditableCell, this component renders a Cell when disabled,
 * a Text wrapped in a TouchableComponent when un-focused and a TextInput
 * when focused - A workaround for react-native crashes when large numbers
 * of TextInput components are rendered.
 *
 * @param {string|number} value The value to render in cell
 * @param {string|number} rowKey Unique key associated to row cell is in
 * @param {string|number} columnKey Unique key associated to column cell is in
 * @param {bool} isDisabled If `true` will render a plain Cell element with no interaction
 * @param {Number}  width Optional flex property to inject into styles.
 * @param {Bool}  isLastCell Indicator if this cell is the last in a row.
 * @param {Func} onEndEditing Callback for onEndEditing event.
 * @param {String}  placeholder String to display when the cell is empty.
 * @param {String} underlineColor    Underline color of TextInput on Android.
 */

const { expiryBatchView, expiryBatchText, expiryBatchPlaceholderText } = dataTableStyles;

export const ExpiryDateInput = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    isDisabled,
    placeholderColor,
    onEndEditing,
    isLastCell,
    width,
    debug,
    placeholder,
    rowIndex,
    underlineColor,
    onFocus,
    onBlur,
  }) => {
    // eslint-disable-next-line no-console
    if (debug) console.log(`- ExpiryTextInputCell: ${value}`);

    const { focusNextCell, getRefIndex, getCellRef, adjustToTop } = React.useContext(RefContext);

    const refIndex = getRefIndex(rowIndex, columnKey);

    // Customhook managing the editing of an expiry date to stay valid.
    const [expiryDate, setExpiryDate, finaliseExpiryDate] = useExpiryDateMask(
      formatExpiryDate(value)
    );

    // Scrolls the parent scroll view such that this row is near the top of the data table,
    // which should ensure it is above the keyboard - without it, if the row is in a position
    // which will be behind the keyboard once it appears, the keyboard will show then disappear
    // jankily. Also calls the isFocus callback with { rowKey, columnKey, value }
    const internalOnFocus = () => {
      if (onFocus) onFocus({ rowKey, columnKey, value });
      adjustToTop(rowIndex);
    };

    // Debounce onEndEditing so that when it is called on the two events: EndEditing/Blur
    // and onSubmit the callback is not triggered twice, causing two renders.
    const internalOnEndEditing = useDebounce(
      newExpiryDate => {
        onEndEditing(newExpiryDate, rowKey, columnKey);
      },
      200,
      false
    );

    // Helpers controlling the submitting of the expiry date. Losing focus/submitting
    // Handed similarly, but losing focus will not auto focus the next cell. Changes
    // to the underlying model are not committed until a valid date is entered.
    const finishEditingExpiryDate = () => {
      finaliseExpiryDate();
      internalOnEndEditing(parseExpiryDate(expiryDate));
    };

    const onSubmit = () => {
      finishEditingExpiryDate();
      focusNextCell(refIndex);
    };

    const usingPlaceholder = placeholder && !expiryDate;

    const textStyle = usingPlaceholder ? expiryBatchPlaceholderText : expiryBatchText;

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={expiryBatchView}
          textStyle={textStyle}
          value={usingPlaceholder ? 'N/A' : expiryDate}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(expiryBatchView, width, isLastCell);

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          ref={getCellRef(refIndex)}
          placeholder={placeholder}
          style={textStyle}
          value={expiryDate}
          placeholderTextColor={placeholderColor}
          onChangeText={setExpiryDate}
          onSubmitEditing={onSubmit}
          onEndEditing={finishEditingExpiryDate}
          underlineColorAndroid={underlineColor}
          keyboardType="numeric"
          blurOnSubmit={false}
          onFocus={internalOnFocus}
          onBlur={onBlur}
        />
      </View>
    );
  }
);

ExpiryDateInput.propTypes = {
  value: PropTypes.instanceOf(Date),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDisabled: PropTypes.bool,
  onEndEditing: PropTypes.func.isRequired,
  width: PropTypes.number,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
  rowIndex: PropTypes.number.isRequired,
  placeholderColor: PropTypes.string,
  underlineColor: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

ExpiryDateInput.defaultProps = {
  value: '',
  isDisabled: false,
  isLastCell: false,
  width: 0,
  debug: false,
  placeholder: 'mm/yyyy',
  placeholderColor: '#CDCDCD',
  underlineColor: '#CDCDCD',
  onFocus: null,
  onBlur: null,
};

export default ExpiryDateInput;
