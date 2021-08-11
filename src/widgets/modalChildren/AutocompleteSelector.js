/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

// eslint-disable-next-line max-classes-per-file
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FlatList, StyleSheet, View } from 'react-native';

import { complement } from 'set-manipulator';

import { withOnePress } from '../withOnePress';
import { ResultRow } from '../ResultRow';
import { SearchBar } from '../SearchBar';

import { WHITE, APP_FONT_FAMILY } from '../../globalStyles';
import { generalStrings } from '../../localization';

export const AutocompleteSelector = ({
  sortKeyString,
  queryString,
  queryStringSecondary,
  primaryFilterProperty,
  secondaryFilterProperty,
  options,
  onSelect,
  placeholderText,
  renderLeftText,
  renderRightText,
}) => {
  const [queryText, setQueryText] = useState('');

  const onChangeText = React.useCallback(inputValue => setQueryText(inputValue), []);

  /**
   * Filters a realm results object. Creates two realm results A, B
   * by two query strings. And concat A to B - A.
   */
  const filterResultData = () => {
    let data = options.filtered(queryString, queryText).sorted(sortKeyString).slice();

    if (queryStringSecondary) {
      data = data.concat(
        complement(options.filtered(queryStringSecondary, queryText).sorted(sortKeyString), data)
      );
    }

    return data;
  };

  /**
   * Filters an array by two filter properties, and user input query text.
   * Ignores case. Querying a realm result with filtered is more performant,
   * so have two cases for each.
   */
  const filterArrayData = () =>
    options.filter(
      optionItem =>
        optionItem[primaryFilterProperty]?.toLowerCase()?.includes(queryText?.toLowerCase()) ||
        optionItem[secondaryFilterProperty]?.toLowerCase()?.includes(queryText.toLowerCase())
    );

  /**
   * Delegator of filtering process. Check if the object is a realm
   * object (has the filtered member) or if it is an array. Otherwise,
   * return an empty list to display.
   */
  const getData = () => {
    if (options && options.filtered && queryString) return filterResultData(options);
    if (Array.isArray(options) && primaryFilterProperty) return filterArrayData(options);
    return [];
  };

  const renderItem = useCallback(
    item => (
      <ResultRowWithOnePress
        data={item}
        onPress={onSelect}
        renderLeftText={renderLeftText}
        renderRightText={renderRightText}
        showCheckIcon={false}
      />
    ),
    [renderLeftText, renderRightText]
  );

  const keyExtractor = item => item.id || item.name;

  const data = getData();

  const ResultRowWithOnePress = withOnePress(ResultRow);

  return (
    <View style={localStyles.container}>
      <SearchBar
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        color={WHITE}
        onChangeText={onChangeText}
        placeholder={placeholderText}
        placeholderTextColor="white"
        style={[localStyles.text, localStyles.searchBar]}
      />
      {data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
          style={localStyles.resultList}
        />
      )}
    </View>
  );
};

/* eslint-disable react/forbid-prop-types, react/require-default-props */
AutocompleteSelector.propTypes = {
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  queryString: PropTypes.string.isRequired,
  queryStringSecondary: PropTypes.string,
  sortKeyString: PropTypes.string.isRequired,
  placeholderText: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  renderLeftText: PropTypes.func,
  renderRightText: PropTypes.func,
  primaryFilterProperty: PropTypes.string,
  secondaryFilterProperty: PropTypes.string,
};

AutocompleteSelector.defaultProps = {
  placeholderText: generalStrings.start_typing_to_search,
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultList: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderColor: '#b9b9b9',
    borderRadius: 1,
    borderWidth: 1,
  },
  searchBar: {
    flex: 1,
    color: 'white',
  },
  text: {
    fontSize: 20,
    fontFamily: APP_FONT_FAMILY,
  },
});
