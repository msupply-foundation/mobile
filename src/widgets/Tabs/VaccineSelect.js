/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { Text, StyleSheet } from 'react-native';
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
import globalStyles, { APP_FONT_FAMILY } from '../../globalStyles';
import { DARKER_GREY } from '../../globalStyles/colors';
import { AfterInteractions } from '../AfterInteractions';
import { Paper } from '../Paper';
import { VaccinePrescriptionInfo } from '../VaccinePrescriptionInfo';
import { useNavigationFocus } from '../../hooks/useNavigationFocus';
import { selectWasPatientVaccinatedWithinOneDay } from '../../selectors/Entities/name';
import { PaperModalContainer } from '../PaperModal/PaperModalContainer';
import { PaperConfirmModal } from '../PaperModal/PaperConfirmModal';
import { useToggle } from '../../hooks/useToggle';
import { PageButton } from '../PageButton';

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
  onCancelPrescription,
  onConfirm,
  onSelectBatch,
  onSelectVaccine,
  hasRefused,
  selectedBatches,
  selectedBatchRows,
  selectedRows,
  selectedVaccine,
  vaccines,
  okAndRepeat,
  selectDefaultVaccine,
  wasPatientVaccinatedWithinOneDay,
}) => {
  const { pageTopViewContainer } = globalStyles;
  const [confirmDoubleDoseModalOpen, toggleConfirmDoubleDoseModal] = useToggle();
  const [confirmAndRepeatDoubleDoseModalOpen, toggleConfirmAndRepeatDoubleDoseModal] = useToggle();
  const vaccineColumns = React.useMemo(() => getColumns(TABS.ITEM), []);
  const batchColumns = React.useMemo(() => getColumns(TABS.VACCINE_BATCH), []);
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

  const onModalConfirm = confirmDoubleDoseModalOpen
    ? confirmPrescription
    : confirmAndRepeatPrescription;

  const isModalOpen = confirmDoubleDoseModalOpen || confirmAndRepeatDoubleDoseModalOpen;

  const navigation = useNavigation();
  useNavigationFocus(navigation, selectDefaultVaccine);

  return (
    <FlexView style={pageTopViewContainer}>
      <VaccinePrescriptionInfo />

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

      <FlexRow flex={1} alignItems="flex-end" justifyContent="flex-end">
        <PageButtonWithOnePress text={buttonStrings.cancel} onPress={onCancelPrescription} />
        <PageButton
          debounceTimer={1000}
          text={buttonStrings.confirm}
          style={{ marginLeft: 'auto' }}
          isDisabled={!selectedBatches && !hasRefused}
          onPress={
            wasPatientVaccinatedWithinOneDay ? toggleConfirmDoubleDoseModal : confirmPrescription
          }
        />
        <PageButton
          debounceTimer={1000}
          text={generalStrings.ok_and_next}
          style={{ marginLeft: 5 }}
          isDisabled={!selectedBatches && !hasRefused}
          onPress={
            wasPatientVaccinatedWithinOneDay
              ? toggleConfirmAndRepeatDoubleDoseModal
              : confirmAndRepeatPrescription
          }
        />
      </FlexRow>
      <PaperModalContainer isVisible={isModalOpen} onClose={onModalClose}>
        <PaperConfirmModal
          questionText={modalStrings.confirm_double_dose}
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
  const onRefuse = value => dispatch(VaccinePrescriptionActions.setRefusal(value));
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
    onRefuse,
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

  return {
    vaccinator,
    hasRefused,
    selectedBatches,
    selectedBatchRows,
    selectedRows,
    selectedVaccine,
    vaccines,
    wasPatientVaccinatedWithinOneDay,
  };
};

VaccineSelectComponent.defaultProps = {
  selectedBatchRows: {},
  selectedRows: {},
  selectedBatches: [],
  selectedVaccine: undefined,
};

VaccineSelectComponent.propTypes = {
  selectDefaultVaccine: PropTypes.func.isRequired,
  okAndRepeat: PropTypes.func.isRequired,
  onCancelPrescription: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onSelectBatch: PropTypes.func.isRequired,
  onSelectVaccine: PropTypes.func.isRequired,
  hasRefused: PropTypes.bool.isRequired,
  selectedBatchRows: PropTypes.object,
  selectedRows: PropTypes.object,
  selectedBatches: PropTypes.array,
  selectedVaccine: PropTypes.object,
  wasPatientVaccinatedWithinOneDay: PropTypes.bool.isRequired,
  vaccines: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
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
});
