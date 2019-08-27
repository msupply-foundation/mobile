/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';

import { View } from 'react-native';

/**
 * Renders a row of children as outputted by renderCells render prop
 *
 * @param {object} rowData Data to pass to renderCells callback
 * @param {string|number} rowKey Unique key associated to row
 * @param {object} rowState State to pass to renderCells callBack
 * @param {func} renderCells renderProp callBack for rendering cells based on rowData and rowState
 *                          `(rowKey, columnKey) => {...}`
 * @param {object} viewStyle Style object for the wrapping View component
 */
// let renderCount = 0;
// let totalTime = 0;
const Row = React.memo(({ rowData, rowState, rowKey, renderCells, style, debug }) => {
  // const start = Date.now();
  // useLayoutEffect(() => {
  //   if (renderCount === 200) {
  //     console.log('===========================================');
  //     console.log(`${renderCount} row avg time: ${totalTime / renderCount}ms`);
  //     console.log('===========================================');
  //     renderCount += 1;
  //   } else {
  //     totalTime += Date.now() - start;
  //     renderCount += 1;
  //   }
  // }, []);
  if (debug) {
    console.log('=================================');
    console.log(`Row: ${rowKey}`);
  }
  return <View style={style}>{renderCells(rowData, rowState, rowKey)}</View>;
});

Row.propTypes = {
  rowData: PropTypes.any.isRequired,
  rowState: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  renderCells: PropTypes.func.isRequired,
  style: PropTypes.object,
  debug: PropTypes.bool,
};

Row.defaultProps = {
  rowState: null,
  style: {},
  debug: false,
};

export default Row;
