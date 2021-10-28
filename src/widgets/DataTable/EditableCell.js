/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, TextInput } from 'react-native';

import Cell from './Cell';
import { dataTableColors } from '../../globalStyles/index';
import { getAdjustedStyle } from './utilities';

/**
 * Renders a cell that on press or focus contains a TextInput for
 * editing values.
 *
 * @param {string|number} value The value to render in cell
 * @param {string|number} rowKey Unique key associated to row cell is in
 * @param {string|number} columnKey Unique key associated to column cell is in
 * @param {bool} disabled If `true` will render a plain Cell element with no interaction
 * @param {bool} isFocused If `false` will TouchableOpacity that dispatches a focusAction
 *                         when pressed. When `true` will render a TextInput with focus
 * @param {func} editAction Action creator for handling editing of this cell.
 *                          `(newValue, rowKey, columnKey) => {...}`
 * @param {func} focusAction Action creator for handling focusing of this cell.
 *                          `(rowKey, columnKey) => {...}`
 * @param {func} focusNextAction Action creator for handling focusing of this cell.
 *                          `(rowKey, columnKey) => {...}`
 * @param {func}  dispatch Reducer dispatch callback for handling actions
 * @param {Object}  touchableStyle Style object for the wrapping Touchable component
 * @param {Object}  viewStyle Style object for the wrapping View component
 * @param {Object}  textStyle Style object for the inner Text component
 * @param {Number}  width Optional flex property to inject into styles.
 * @param {Bool}  isLastCell Indicator for if this cell is the last
 *                                   in a row. Removing the borderRight if true.
 */
const EditableCell = React.memo(
  ({
    value,
    rowKey,
    columnKey,
    isDisabled,
    isFocused,
    editAction,
    focusAction,
    focusNextAction,
    dispatch,
    touchableStyle,
    viewStyle,
    textInputStyle,
    textStyle,
    textViewStyle,
    isLastCell,
    width,
    debug,
    keyboardType,
    placeholder,
    placeholderColor,
    cellTextStyle,
  }) => {
    // eslint-disable-next-line no-console
    if (debug) console.log(`- EditableCell: ${value}`);
    const usingPlaceholder = placeholder && !value;
    const onEdit = newValue => dispatch(editAction(newValue, rowKey, columnKey));
    const focusCell = () => dispatch(focusAction(rowKey, columnKey));
    const focusNextCell = () => dispatch(focusNextAction(rowKey, columnKey));

    // Render a plain Cell if disabled.
    if (isDisabled) {
      return (
        <Cell
          key={columnKey}
          viewStyle={viewStyle}
          textStyle={cellTextStyle}
          value={value}
          width={width}
          isLastCell={isLastCell}
        />
      );
    }

    const internalViewStyle = getAdjustedStyle(viewStyle, width, isLastCell);

    // Too many TextInputs causes React Native to crash, so only
    // truly mount the TextInput when the Cell is focused.
    // Use TouchableWithoutFeedback because we want the appearance and
    // feedback to resemble a TextInput regardless of focus.
    if (!isFocused) {
      const text = usingPlaceholder ? placeholder : value;
      const internalTextStyle = getAdjustedStyle(textStyle, width);
      const unfocusedTextStyle = usingPlaceholder
        ? { ...internalTextStyle, color: placeholderColor }
        : internalTextStyle;
      return (
        <TouchableWithoutFeedback style={touchableStyle} onPress={focusCell}>
          <View style={internalViewStyle}>
            <View style={textViewStyle}>
              <Text ellipsizeMode="tail" numberOfLines={1} style={unfocusedTextStyle}>
                {text}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }

    const internalTextStyle = getAdjustedStyle(textInputStyle, width);
    const focusedTextStyle = usingPlaceholder
      ? { ...internalTextStyle, color: placeholderColor }
      : { ...internalTextStyle };

    // Render a Cell with a textInput.
    return (
      <View style={internalViewStyle}>
        <TextInput
          placeholder={placeholder}
          style={focusedTextStyle}
          value={usingPlaceholder ? '' : String(value)}
          onChangeText={onEdit}
          autoFocus={isFocused}
          onSubmitEditing={focusNextCell}
          underlineColorAndroid={dataTableColors.editableCellUnderline}
          keyboardType={keyboardType}
          selectTextOnFocus
        />
      </View>
    );
  }
);

EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  columnKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDisabled: PropTypes.bool,
  isFocused: PropTypes.bool,
  editAction: PropTypes.func.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusNextAction: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  touchableStyle: PropTypes.object,
  cellTextStyle: PropTypes.object,
  viewStyle: PropTypes.object,
  textStyle: PropTypes.object,
  width: PropTypes.number,
  textInputStyle: PropTypes.object,
  textViewStyle: PropTypes.object,
  isLastCell: PropTypes.bool,
  debug: PropTypes.bool,
  placeholder: PropTypes.string,
  placeholderColor: PropTypes.string,
  keyboardType: PropTypes.oneOf([
    'default',
    'number-pad',
    'decimal-pad',
    'numeric',
    'email-address',
    'phone-pad',
  ]),
};

EditableCell.defaultProps = {
  value: '',
  isDisabled: false,
  isFocused: false,
  touchableStyle: {},
  viewStyle: {},
  textStyle: {},
  cellTextStyle: {},
  textInputStyle: {},
  textViewStyle: {},
  isLastCell: false,
  width: 0,
  debug: false,
  keyboardType: 'numeric',
  placeholder: '',
  placeholderColor: '#CDCDCD',
};

export default EditableCell;
