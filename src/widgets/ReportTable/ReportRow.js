/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { ReportCell } from './ReportCell';

/**
 * This page receives data for an specific row to render on a Table report
 * *
 * @prop  {boolean}   isHeader    Indicates if the cell row is the table header or not
 * @prop  {array}     rowData     Array containing the row data
 * @prop  {number}    rowIndex    Indicates the index of the corresponding row
 */

export const ReportRow = ({ isHeader, rowData, rowIndex }) => {
  const headerStyle = isHeader ? localStyles.header : null;
  const rowStyle = StyleSheet.flatten([localStyles.container, headerStyle]);
  const cellsToRender = rowData.map((cell, cellIndex) => (
    // eslint-disable-next-line react/no-array-index-key
    <ReportCell key={`${rowIndex}_${cellIndex}`} even={rowIndex % 2 === 0}>
      {cell}
    </ReportCell>
  ));

  return <View style={rowStyle}>{cellsToRender}</View>;
};

const localStyles = StyleSheet.create({
  header: {
    marginBottom: 1,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    height: 50,
  },
});

ReportRow.defaultProps = {
  isHeader: false,
};

ReportRow.propTypes = {
  isHeader: PropTypes.bool,
  rowData: PropTypes.array.isRequired,
  rowIndex: PropTypes.number.isRequired,
};
