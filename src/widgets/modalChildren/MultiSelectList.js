/* eslint-disable react/require-default-props */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { FlatList, StyleSheet, View } from 'react-native';
import globalStyles, { APP_FONT_FAMILY, SUSSOL_ORANGE } from '../../globalStyles';
import { generalStrings, buttonStrings } from '../../localization';
import { ResultRow, OnePressButton, SearchBar } from '..';
import { WHITE } from '../../globalStyles/colors';

const keyExtractor = item => item.id || item.name;

export const MultiSelectList = ({
  options,
  sortByString,
  queryString,
  queryStringSecondary,
  primaryFilterProperty,
  secondaryFilterProperty,
  renderLeftText,
  renderRightText,
  showCheckIcon,
  placeholderText,
  onConfirmSelections,
}) => {
  const [queryText, setQueryText] = useState('');
  const [selected, setSelected] = useState([]);

  const onDoneSelected = useCallback(() => onConfirmSelections(selected), [selected]);
  const onSelect = useCallback(
    item =>
      setSelected(prevState =>
        prevState.indexOf(item.id) === -1
          ? [...prevState, item.id]
          : prevState.filter(selectedItem => selectedItem !== item.id)
      ),
    []
  );

  const filterResultData = () => {
    const data = options.filtered(queryString, queryText);
    const secondaryFiltered = queryStringSecondary
      ? data.filtered(queryStringSecondary, queryText)
      : data;
    const sortedData = secondaryFiltered.sorted(sortByString);
    return sortedData;
  };

  const filterArrayData = () => {
    const containsFilterString = string => string?.toLowerCase().includes(queryText);

    return options.filter(
      optionItem =>
        containsFilterString(optionItem[primaryFilterProperty]) ||
        containsFilterString(optionItem[secondaryFilterProperty])
    );
  };

  const getData = () => {
    if (options && options.filtered && queryString) return filterResultData(options);
    if (Array.isArray(options) && primaryFilterProperty) return filterArrayData(options);
    return [];
  };

  const data = getData();

  const renderItem = useCallback(
    row => (
      <ResultRow
        data={row}
        onPress={onSelect}
        isSelected={selected.indexOf(row.item.id) >= 0}
        renderLeftText={renderLeftText}
        renderRightText={renderRightText}
        showCheckIcon={showCheckIcon}
      />
    ),
    [data, onSelect, renderLeftText, renderRightText, showCheckIcon]
  );

  return (
    <View style={localStyles.container}>
      <SearchBar
        onChangeText={setQueryText}
        value={queryText}
        color={WHITE}
        placeholder={placeholderText}
      />
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        style={localStyles.resultList}
        extraData={selected}
      />
      <View style={localStyles.buttonContainer}>
        <OnePressButton
          style={localStyles.confirmButton}
          textStyle={[globalStyles.buttonText, localStyles.confirmButtonText]}
          text={buttonStrings.done}
          onPress={onDoneSelected}
        />
      </View>
    </View>
  );
};

MultiSelectList.propTypes = {
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortByString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  primaryFilterProperty: PropTypes.string,
  secondaryFilterProperty: PropTypes.string,
  onConfirmSelections: PropTypes.func,
  showCheckIcon: PropTypes.bool,
};

MultiSelectList.defaultProps = {
  placeholderText: generalStrings.start_typing_to_search,
  showCheckIcon: true,
};

const localStyles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: { alignItems: 'flex-end' },
  resultList: { marginHorizontal: 5, backgroundColor: 'white' },
  confirmButton: { ...globalStyles.button, backgroundColor: SUSSOL_ORANGE, height: 50 },
  confirmButtonText: { color: 'white', fontSize: 20, fontFamily: APP_FONT_FAMILY, paddingTop: 5 },
});
