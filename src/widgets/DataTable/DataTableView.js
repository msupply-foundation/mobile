/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FlatList, StyleSheet } from 'react-native';

/**
 * Wrapper around Virtualized list that provides scrollable container
 * but with async rendering of its children render item(s). This means
 * using this component for any virtualized list component provides smooth
 * scrolling effects with still preserving their performance guarantees that
 * virtualized lists (e.g. FlatList, SectionList, VirtualizedList, etc) offer.
 * @param {ReactElement} children A virtualized list component to render
 * with data
 * @param {object} style A stylesheet object to decorate virtualized list
 * container
 */
export const DataTableView = React.memo(({ children, style }) => (
  <FlatList
    nestedScrollEnabled
    data={[]}
    renderItem={null}
    ListEmptyComponent={null}
    ListHeaderComponent={<>{children}</>}
    ListHeaderComponentStyle={style}
  />
));

const styles = StyleSheet.create({ virtualizedView: { flex: 1 } });

DataTableView.defaultProps = {
  style: styles.dataTableView,
};

DataTableView.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  style: PropTypes.object,
};
