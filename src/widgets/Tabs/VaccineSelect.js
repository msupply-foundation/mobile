/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { Dimensions, Text, StyleSheet, TextInput, View } from 'react-native';
import { batch, connect } from 'react-redux';

import { TABS } from '../constants';
import { FlexRow } from '../FlexRow';
import { FlexView } from '../FlexView';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';
import { SimpleTable } from '../SimpleTable';

import { VaccinePrescriptionActions } from '../../actions/Entities/VaccinePrescriptionActions';
import { goBack } from '../../navigation/actions';
import {
  selectSelectedBatchRows,
  selectSelectedBatches,
  selectHasRefused,
  selectSelectedRows,
  selectSelectedVaccines,
  selectVaccines,
  selectSelectedVaccinator,
  selectDepartmentFromWeeklyVaccinationHistory,
} from '../../selectors/Entities/vaccinePrescription';
import { getColumns } from '../../pages/dataTableUtilities';
import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import {
  vaccineStrings,
  buttonStrings,
  dispensingStrings,
  generalStrings,
  modalStrings,
} from '../../localization';
import globalStyles, { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../globalStyles';
import { DARKER_GREY, SUSSOL_ORANGE } from '../../globalStyles/colors';
import { AfterInteractions } from '../AfterInteractions';
import { Paper } from '../Paper';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { useNavigationFocus } from '../../hooks/useNavigationFocus';
import { selectWasPatientVaccinatedWithinOneDay } from '../../selectors/Entities/name';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';
import { useToggle } from '../../hooks/useToggle';
import { PageButton } from '../PageButton';
import { UIDatabase } from '../../database/index';
import { PREFERENCE_KEYS } from '../../database/utilities/preferenceConstants';

const ListEmptyComponent = () => (
  <FlexView flex={1} justifyContent="center" alignItems="center">
    <Text style={localStyles.emptyComponentText}>
      {generalStrings.select_an_item_before_choosing_the_batch}
    </Text>
  </FlexView>
);

/**
 * Layout component used for a tab within the vaccine prescription wizard.
 *
 * @prop {Func}   onCancelPrescription  Callback for cancelling the prescription.
 * @prop {Func}   onConfirm             Callback for confirming / creating transaction.
 * @prop {Func}   onSelectBatch         Callback for selecting a batch.
 * @prop {Func}   onSelectVaccine       Callback for selecting a vaccine.
 * @prop {array}  selectedBatches       Returns the currently selected batches.
 * @prop {object} selectedBatchRows     Selected batch row objects.
 * @prop {object} selectedRows          Selected vaccine row objects.
 * @prop {object} selectedVaccine       Currently selected vaccine.
 * @prop {array}  vaccines              List of vaccine items.
 */
const VaccineSelectComponent = ({
  hasRefused,
  okAndRepeat,
  onCancelPrescription,
  onConfirm,
  onRefusalReason,
  onSelectBatch,
  onSelectVaccine,
  selectDefaultVaccine,
  selectedBatchRows,
  selectedBatches,
  selectedRows,
  selectedVaccine,
  vaccines,
  wasPatientVaccinatedWithinOneDay,
  departmentFromWeeklyVaccination,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const [confirmDoubleDoseModalOpen, toggleConfirmDoubleDoseModal] = useToggle();
  const [confirmAndRepeatDoubleDoseModalOpen, toggleConfirmAndRepeatDoubleDoseModal] = useToggle();
  const vaccineColumns = React.useMemo(() => getColumns(TABS.ITEM), []);
  const batchColumns = React.useMemo(() => getColumns(TABS.VACCINE_BATCH), []);
  const [wasPatientVaccinatedAlready, setPatientVaccinatedStatus] = useState(false);
  const [doubleDoseAlertTitle, setDoubleDoseAlertTitle] = useState('');

  // Get departmentID from the selectedVaccine,
  // then loop through vaccine history taken within one week.
  // If at least one history record has same department as selected vaccine,
  // then return true that would be helpful to generate an alert

  const departmentID = selectedVaccine?.department?.id;

  const vaccinatedWithSameItemDepartment = selectedDepartmentID => {
    if (selectedDepartmentID) {
      return departmentFromWeeklyVaccination.some(({ id }) => id === selectedDepartmentID);
    }
    return false; // If department doesn't exist.
  };

  const wasPatientVaccinatedWithinOneWeek = React.useMemo(
    () => vaccinatedWithSameItemDepartment(departmentID),
    [departmentID]
  );

  const canDispenseSameTypeOfVaccine = UIDatabase.getPreference(
    PREFERENCE_KEYS.DISPENSE_VACCINE_OF_SAME_ITEM_DEPARTMENT
  );

  // If DISPENSE_VACCINE_OF_SAME_ITEM_DEPARTMENT is enabled in store preference and patient has been
  // vaccinated within a week, then look at weekly vaccination history otherwise 24hrs history
  useEffect(() => {
    if (canDispenseSameTypeOfVaccine && wasPatientVaccinatedWithinOneWeek) {
      setPatientVaccinatedStatus(canDispenseSameTypeOfVaccine);
      setDoubleDoseAlertTitle(modalStrings.confirm_weekly_double_dose);
    } else {
      setPatientVaccinatedStatus(wasPatientVaccinatedWithinOneDay);
      setDoubleDoseAlertTitle(modalStrings.confirm_double_dose);
    }
  }, [
    canDispenseSameTypeOfVaccine,
    wasPatientVaccinatedWithinOneDay,
    wasPatientVaccinatedWithinOneWeek,
  ]);

  const disabledVaccineRows = React.useMemo(
    () =>
      vaccines
        .filter(vaccine => vaccine.totalQuantity === 0)
        .reduce((acc, vaccine) => ({ ...acc, [vaccine.id]: true }), {}),
    [vaccines]
  );
  const disabledBatchRows = React.useMemo(
    () =>
      selectedVaccine?.batches
        ?.filter(b => b.doses === 0)
        .reduce((acc, b) => ({ ...acc, [b.id]: true }), {}),
    [vaccines]
  );
  const runWithLoadingIndicator = useLoadingIndicator();

  const confirmPrescription = React.useCallback(() => runWithLoadingIndicator(onConfirm), [
    onConfirm,
  ]);

  const confirmAndRepeatPrescription = React.useCallback(
    () => runWithLoadingIndicator(okAndRepeat),
    [okAndRepeat]
  );

  const onModalClose = confirmDoubleDoseModalOpen
    ? toggleConfirmDoubleDoseModal
    : toggleConfirmAndRepeatDoubleDoseModal;

  const onModalConfirm = () => {
    onModalClose();

    if (confirmDoubleDoseModalOpen) {
      confirmPrescription();
    } else {
      confirmAndRepeatPrescription();
    }
  };

  const isModalOpen = confirmDoubleDoseModalOpen || confirmAndRepeatDoubleDoseModalOpen;

  const navigation = useNavigation();
  useNavigationFocus(navigation, selectDefaultVaccine);

  return (
    <FlexView style={pageTopViewContainer}>
      <VaccinePrescriptionInfo />

      {hasRefused ? (
        <FlexRow flex={8}>
          <Paper contentContainerStyle={{ flex: 1, padding: 20 }} style={{ flex: 1 }}>
            <View style={localStyles.flexColumn}>
              <Text style={localStyles.textStyle}>{vaccineStrings.refusal_reason}</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                multiline={true}
                numberOfLines={2}
                onChangeText={onRefusalReason}
                placeholderTextColor={SUSSOL_ORANGE}
                returnKeyType="next"
                selectTextOnFocus
                style={localStyles.textInput}
                underlineColorAndroid={DARKER_GREY}
              />
            </View>
          </Paper>
        </FlexRow>
      ) : (
        <FlexRow flex={8}>
          <Paper
            headerText={vaccineStrings.vaccines}
            contentContainerStyle={{ flex: 1 }}
            style={{ flex: 1 }}
          >
            <AfterInteractions placeholder={null}>
              <SimpleTable
                columns={vaccineColumns}
                data={vaccines}
                disabledRows={disabledVaccineRows}
                selectedRows={selectedRows}
                selectRow={onSelectVaccine}
              />
            </AfterInteractions>
          </Paper>

          <Paper
            headerText={dispensingStrings.available_batches}
            contentContainerStyle={{ flex: 1 }}
            style={{ flex: 1 }}
          >
            <AfterInteractions placeholder={null}>
              <SimpleTable
                columns={batchColumns}
                data={selectedVaccine?.batchesWithStock.sorted('expiryDate') ?? []}
                disabledRows={disabledBatchRows}
                selectedRows={selectedBatchRows}
                selectRow={onSelectBatch}
                ListEmptyComponent={<ListEmptyComponent />}
              />
            </AfterInteractions>
          </Paper>
        </FlexRow>
      )}

      <FlexRow flex={1} alignItems="flex-end" justifyContent="flex-end">
        <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancelPrescription} />
        <PageButton
          debounceTimer={1000}
          text={buttonStrings.confirm}
          style={{ marginLeft: 'auto' }}
          isDisabled={!selectedBatches && !hasRefused}
          onPress={wasPatientVaccinatedAlready ? toggleConfirmDoubleDoseModal : confirmPrescription}
        />
        <PageButton
          debounceTimer={1000}
          text={generalStrings.ok_and_next}
          style={{ marginLeft: 5 }}
          isDisabled={!selectedBatches && !hasRefused}
          onPress={
            wasPatientVaccinatedAlready
              ? toggleConfirmAndRepeatDoubleDoseModal
              : confirmAndRepeatPrescription
          }
        />
      </FlexRow>
      <PaperModalContainer isVisible={isModalOpen} onClose={onModalClose}>
        <PaperConfirmModal
          questionText={doubleDoseAlertTitle}
          confirmText={modalStrings.confirm}
          cancelText={modalStrings.cancel}
          onConfirm={onModalConfirm}
          onCancel={onModalClose}
        />
      </PaperModalContainer>
    </FlexView>
  );
};

const mapDispatchToProps = dispatch => {
  const onRefusalReason = value => dispatch(VaccinePrescriptionActions.setRefusalReason(value));
  const onCancelPrescription = () => dispatch(VaccinePrescriptionActions.cancel());
  const onSelectBatch = itemBatch => dispatch(VaccinePrescriptionActions.selectBatch(itemBatch));
  const onSelectVaccine = vaccine => dispatch(VaccinePrescriptionActions.selectVaccine(vaccine));
  const selectDefaultVaccine = () => dispatch(VaccinePrescriptionActions.selectDefaultVaccine());

  const onConfirm = () =>
    batch(() => {
      dispatch(VaccinePrescriptionActions.confirm());
      dispatch(goBack());
    });
  const okAndRepeat = () => dispatch(VaccinePrescriptionActions.confirmAndRepeat());

  return {
    okAndRepeat,
    onCancelPrescription,
    onConfirm,
    onRefusalReason,
    onSelectBatch,
    onSelectVaccine,
    selectDefaultVaccine,
  };
};

const mapStateToProps = state => {
  const hasRefused = selectHasRefused(state);
  const selectedRows = selectSelectedRows(state);
  const selectedBatchRows = selectSelectedBatchRows(state);
  const selectedBatches = selectSelectedBatches(state);
  const selectedVaccines = selectSelectedVaccines(state);
  const vaccines = selectVaccines(state);
  const [selectedVaccine] = selectedVaccines;
  const vaccinator = selectSelectedVaccinator(state);
  const wasPatientVaccinatedWithinOneDay = selectWasPatientVaccinatedWithinOneDay(state);
  const departmentFromWeeklyVaccination = selectDepartmentFromWeeklyVaccinationHistory(state);

  return {
    vaccinator,
    hasRefused,
    selectedBatches,
    selectedBatchRows,
    selectedRows,
    selectedVaccine,
    vaccines,
    wasPatientVaccinatedWithinOneDay,
    departmentFromWeeklyVaccination,
  };
};

VaccineSelectComponent.defaultProps = {
  selectedBatchRows: {},
  selectedRows: {},
  selectedBatches: [],
  selectedVaccine: undefined,
  departmentFromWeeklyVaccination: [],
};

VaccineSelectComponent.propTypes = {
  hasRefused: PropTypes.bool.isRequired,
  okAndRepeat: PropTypes.func.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onRefusalReason: PropTypes.func.isRequired,
  onSelectBatch: PropTypes.func.isRequired,
  onSelectVaccine: PropTypes.func.isRequired,
  selectDefaultVaccine: PropTypes.func.isRequired,
  selectedBatchRows: PropTypes.object,
  selectedBatches: PropTypes.array,
  selectedRows: PropTypes.object,
  selectedVaccine: PropTypes.object,
  vaccines: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  wasPatientVaccinatedWithinOneDay: PropTypes.bool.isRequired,
  departmentFromWeeklyVaccination: PropTypes.array,
};

export const VaccineSelect = connect(mapStateToProps, mapDispatchToProps)(VaccineSelectComponent);

const localStyles = StyleSheet.create({
  emptyComponentText: {
    flex: 1,
    textAlignVertical: 'center',
    fontSize: 12,
    color: DARKER_GREY,
    fontFamily: APP_FONT_FAMILY,
  },
  textInput: {
    fontSize: Dimensions.get('window').width / 80,
    fontFamily: APP_FONT_FAMILY,
    textAlignVertical: 'top',
  },
  flexColumn: { flex: 1, flexDirection: 'column' },
  textStyle: {
    fontSize: APP_GENERAL_FONT_SIZE,
    fontFamily: APP_FONT_FAMILY,
  },
});
