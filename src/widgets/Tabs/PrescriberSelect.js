/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import { TABS } from '../constants';

import { SearchBar } from '../SearchBar';
import { PageButton } from '../PageButton';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { DataTable, DataTableRow, DataTableHeaderRow } from '../DataTable';

import { selectPrescriptionPrescriber } from '../../selectors/prescription';
import { debounce } from '../../utilities';
import { PrescriberActions } from '../../actions/PrescriberActions';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import { getItemLayout, getColumns } from '../../pages/dataTableUtilities';
import { selectSortedPrescribers } from '../../selectors/prescriber';
import { buttonStrings, dispensingStrings } from '../../localization';
import globalStyles from '../../globalStyles';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

/**
 * Layout component used for a tab within the prescription wizard.
 *
 * @prop {Func}   choosePrescriber Callback for selecting a supplier.
 * @prop {Func}   prescribers      Current set of prescriber data.
 * @prop {Func}   onFilterData     Callback for filtering prescribers.
 * @prop {Func}   onSortData       Callback for sorting prescribers by column.
 * @prop {Func}   searchTerm       The current filtering search term.
 * @prop {Func}   createPrescriber Callback for creating a prescriber.
 * @prop {Func}   isComplete       Indicator for this prescription being complete.
 * @prop {String} sortKey          Current key the list of prescribers is sorted by.
 * @prop {Bool}   isAscending      Indicator if the list of prescriber is sorted ascending.
 */
const PrescriberSelectComponent = ({
  choosePrescriber,
  onCancelPrescription,
  prescribers,
  onFilterData,
  onSortData,
  searchTerm,
  sortKey,
  isAscending,
  createPrescriber,
  isComplete,
  currentPrescriber,
}) => {
  const columns = React.useMemo(() => getColumns(TABS.PRESCRIBER), []);

  const renderRow = React.useCallback(
    listItem => {
      const { item, index } = listItem;
      const rowKey = item.id;
      return (
        <DataTableRow
          rowData={prescribers[index]}
          rowKey={rowKey}
          getCallback={() => (isComplete ? null : () => choosePrescriber(item))}
          columns={columns}
          rowIndex={index}
          onPress={isComplete ? null : choosePrescriber}
        />
      );
    },
    [prescribers]
  );

  const renderHeader = React.useCallback(
    () => (
      <DataTableHeaderRow
        columns={columns}
        isAscending={isAscending}
        sortKey={sortKey}
        onPress={onSortData}
      />
    ),
    [columns, sortKey, isAscending]
  );

  const { pageTopViewContainer } = globalStyles;

  return (
    <FlexView style={pageTopViewContainer}>
      <PrescriptionInfo />
      <FlexRow style={{ marginBottom: 7 }}>
        <SearchBar
          viewStyle={localStyles.searchBar}
          onChangeText={onFilterData}
          value={searchTerm}
          placeholder={dispensingStrings.search_by_last_name_first_name}
        />
        <PageButton
          text={`${dispensingStrings.new} ${dispensingStrings.prescriber}`}
          onPress={createPrescriber}
          style={{ marginLeft: 5 }}
        />
      </FlexRow>

      <DataTable
        data={prescribers}
        renderRow={renderRow}
        renderHeader={renderHeader}
        keyExtractor={item => item.id}
        getItemLayout={getItemLayout}
      />

      <FlexRow justifyContent="flex-end" alignItems="flex-end">
        <PageButtonWithOnePress
          text={buttonStrings.cancel}
          onPress={() => onCancelPrescription()}
          style={{ marginRight: 7 }}
        />
        <PageButton
          text={buttonStrings.next}
          debounceTimer={1000}
          onPress={() => choosePrescriber(currentPrescriber)}
          isDisabled={!currentPrescriber}
        />
      </FlexRow>
    </FlexView>
  );
};

const localStyles = StyleSheet.create({
  searchBar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
    flexGrow: 1,
    marginHorizontal: 5,
  },
});

const mapDispatchToProps = dispatch => {
  const choosePrescriber = debounce(
    prescriber => dispatch(PrescriptionActions.assignPrescriber(prescriber)),
    1000,
    true
  );
  const onFilterData = searchTerm => dispatch(PrescriberActions.filterData(searchTerm));
  const onSortData = sortKey => dispatch(PrescriberActions.sortData(sortKey));
  const createPrescriber = () => dispatch(PrescriberActions.createPrescriber());
  const onCancelPrescription = () => dispatch(PrescriptionActions.cancelPrescription());

  return { onSortData, onCancelPrescription, choosePrescriber, onFilterData, createPrescriber };
};

const mapStateToProps = state => {
  const { prescriber, wizard } = state;
  const { searchTerm, sortKey, isAscending } = prescriber;
  const { isComplete } = wizard;

  const currentPrescriber = selectPrescriptionPrescriber(state);
  const prescribers = selectSortedPrescribers(state);

  return { prescribers, searchTerm, isComplete, sortKey, isAscending, currentPrescriber };
};

PrescriberSelectComponent.defaultProps = {
  searchTerm: '',
  isComplete: false,
  currentPrescriber: null,
};

PrescriberSelectComponent.propTypes = {
  choosePrescriber: PropTypes.func.isRequired,
  prescribers: PropTypes.object.isRequired,
  onFilterData: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
  createPrescriber: PropTypes.func.isRequired,
  isComplete: PropTypes.bool,
  onSortData: PropTypes.func.isRequired,
  sortKey: PropTypes.string.isRequired,
  isAscending: PropTypes.bool.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
  currentPrescriber: PropTypes.object,
};

export const PrescriberSelect = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriberSelectComponent);
