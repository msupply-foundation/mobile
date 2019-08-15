/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet } from 'react-native';

const HeaderRow = React.memo(({ renderCells }) => (
  <View style={defaultStyles.row}>{renderCells()}</View>
));

HeaderRow.propTypes = {
  renderCells: PropTypes.func.isRequired,
};

const defaultStyles = StyleSheet.create({
  row: {
    flex: 1,
    maxHeight: 100,
    flexDirection: 'row',
  },
});

export default HeaderRow;
