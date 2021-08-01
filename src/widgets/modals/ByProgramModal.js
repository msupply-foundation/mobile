/* eslint-disable react/forbid-prop-types */
import React, { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';

import { ToggleBar, PageButton, Step } from '..';
import { AutocompleteSelector, TextEditor } from '../modalChildren';
import { ModalContainer } from './ModalContainer';

import globalStyles, { DARK_GREY, WARM_GREY, SUSSOL_ORANGE } from '../../globalStyles';

import { SETTINGS_KEYS } from '../../settings';
import {
  getAllPrograms,
  getAllPeriodsForProgram,
  getAllProgramsForCustomer,
} from '../../utilities';
import { programStrings, navStrings } from '../../localization';
import { UIDatabase } from '../../database';
import {
  selectProgram,
  selectSupplier,
  selectOrderType,
  selectCustomer,
  selectPeriod,
  setStoreTags,
  setSteps,
  setModalClosed,
  setModalOpen,
  setToggle,
  setName,
  byProgramReducer,
  initialState,
} from '../../reducers/ByProgramReducer';
import { FlexColumn } from '../FlexColumn';

const { THIS_STORE_TAGS, THIS_STORE_NAME_ID } = SETTINGS_KEYS;

const modalProps = ({ dispatch, program, orderType, customer }) => ({
  program: {
    queryStringSecondary: 'name CONTAINS[c] $0',
    onSelect: value => dispatch(selectProgram(value)),
  },
  customer: {
    secondaryFilterProperty: 'code',
    onSelect: value => dispatch(selectCustomer(value)),
  },
  supplier: {
    secondaryFilterProperty: 'code',
    onSelect: value => dispatch(selectSupplier(value)),
  },
  orderType: {
    secondaryFilterProperty: 'code',
    onSelect: value => dispatch(selectOrderType(value)),
    renderRightText: item => {
      const { maxMOS, maxOPP, threshMOS } = getLocalizedStrings();
      const {
        maxOrdersPerPeriod: maxOrders,
        maxMOS: itemMOS,
        thresholdMOS: itemThreshMOS,
        isEmergency,
        name,
      } = item;

      const tags = customer
        ? customer?.nameTags.join(',')
        : UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_TAGS);
      const maxLinesForOrder = program?.getMaxLines?.(name, tags);

      const mosText = `${maxMOS}: ${itemMOS}`;
      const thresholdText = `${threshMOS}: ${itemThreshMOS}`;
      const maxItemsText =
        maxLinesForOrder && maxLinesForOrder !== Infinity
          ? `${programStrings.max_items}: ${maxLinesForOrder}`
          : '';

      const emergencyText = `[${programStrings.emergency_order}]  ${maxItemsText}`;
      const maxOrdersText = isEmergency ? emergencyText : `${maxOPP}: ${maxOrders}`;

      return `${maxOrdersText}\n${mosText}\n${customer ? '' : thresholdText}`;
    },
  },
  period: {
    onSelect: value => dispatch(selectPeriod(value)),
    renderRightText: item => {
      const { requisitions } = getLocalizedStrings();
      const { maxOrdersPerPeriod, isEmergency } = orderType;

      const requisitionsInPeriod = !customer
        ? item.numberOfSupplierRequisitionsForOrderType(program, orderType)
        : item.numberOfCustomerRequisitionsForOrderType(program, orderType, customer);
      const requisitionsCount = `${requisitionsInPeriod}/${maxOrdersPerPeriod} ${requisitions}`;

      const periodText = isEmergency
        ? `${requisitionsInPeriod} ${programStrings.emergency_order}`
        : requisitionsCount;

      return `${item} - ${periodText}`;
    },
  },
});

export const ByProgramModal = ({ settings, database, transactionType, onConfirm }) => {
  const [state, dispatch] = useReducer(byProgramReducer, {}, () =>
    initialState({ transactionType })
  );

  const { steps, modalData, program, orderType, period, supplier, name, customer } = state;
  const strings = getLocalizedStrings({ transactionType });

  const mounting = () => {
    dispatch(setStoreTags(settings.get(THIS_STORE_TAGS)));
    dispatch(setSteps(transactionType));
  };
  useEffect(mounting, []);

  /** Helpers */
  // Calculates the current state of a step, according to what data is currently
  // stored in state, where the current step the user should perform is CURRENT,
  // data which is stored is COMPLETE and steps which can't be done yet are INCOMPLETE.
  const getStatus = key =>
    steps.reduceRight((status, value, i) => {
      if (state[key]) return 'COMPLETE';
      const previousStepIsCurrent = state[value] && steps[i + 1] === key;
      const firstStepIsCurrent = status === 'INCOMPLETE' && steps[0] === key;
      if (previousStepIsCurrent || firstStepIsCurrent) return 'CURRENT';
      return status;
    }, 'INCOMPLETE');

  const tags = database
    .objects('NameTag')
    .filtered(
      'subquery(nameTagJoins, $joins, $joins.name.id == $0).@count > 0',
      customer?.id ?? settings.get(THIS_STORE_NAME_ID)
    )
    .map(({ description }) => description);

  // Helper methods for fetching modal data for user selection
  const getPrograms = () => {
    if (transactionType === 'customerRequisition') {
      return getAllProgramsForCustomer(customer, database);
    }
    return getAllPrograms(settings, database);
  };
  const getSuppliers = () => database.objects('InternalSupplier').slice();
  const getCustomers = () => database.objects('Customer').slice();
  const getOrderTypes = () => program && program.getStoreTagObject(tags).orderTypes;
  const getPeriods = () => {
    if (!(program && orderType)) return null;
    const { periodScheduleName } = program.getStoreTagObject(tags);
    return getAllPeriodsForProgram(database, program, periodScheduleName, orderType, customer);
  };

  /** Call backs */

  // Dispatcher on clicking a step. Opens the modal and sets the passed data as modalData
  const onOpenModal = ({ key, selection }) => dispatch(setModalOpen({ key, selection }));
  // Closed the currently open modal
  const onCloseModal = () => dispatch(setModalClosed());
  // Switches from program <-> general, resetting the state.
  const onToggle = () => dispatch(setToggle());
  const onCreate = () =>
    onConfirm({
      otherStoreName: supplier || customer,
      program,
      period,
      orderType,
      stocktakeName: name,
    });
  /** Inner components */

  // Togglebar for switching between general <-> program. Resets state on toggle.
  const ProgramToggleBar = () => {
    const { toggleContainer } = localStyles;
    const { isProgramBased } = state;
    const { programToggleText, generalToggleText } = strings;
    return (
      <View style={toggleContainer}>
        <ToggleBar
          toggles={[
            { text: programToggleText, onPress: onToggle, isOn: isProgramBased },
            { text: generalToggleText, onPress: onToggle, isOn: !isProgramBased },
          ]}
        />
      </View>
    );
  };

  // Modal component, for user selection
  const ByProgramSelector = () => {
    const { isModalOpen, currentKey } = state;
    const Selector = () => (
      <AutocompleteSelector
        queryString="code CONTAINS[c] $0"
        sortKeyString="name"
        primaryFilterProperty="name"
        renderLeftText={item => `${item.name}`}
        options={modalData}
        {...modalProps({ dispatch, program, orderType, customer })[currentKey]}
      />
    );
    const Editor = () => (
      <TextEditor text={name} onEndEditing={value => dispatch(setName(value))} />
    );
    return (
      <ModalContainer isVisible={isModalOpen} onClose={onCloseModal}>
        {currentKey !== 'name' ? <Selector /> : <Editor />}
      </ModalContainer>
    );
  };

  const stepProps = {
    program: {
      data: program,
      getModalData: getPrograms,
      onPress: onOpenModal,
      status: getStatus('program'),
      stepKey: 'program',
      type: 'select',
      field: 'name',
    },
    customer: {
      data: customer,
      getModalData: getCustomers,
      onPress: onOpenModal,
      status: getStatus('customer'),
      stepKey: 'customer',
      type: 'select',
      field: 'name',
    },

    supplier: {
      data: supplier,
      getModalData: getSuppliers,
      onPress: onOpenModal,
      status: getStatus('supplier'),
      stepKey: 'supplier',
      type: 'select',
      field: 'name',
    },

    orderType: {
      data: orderType,
      getModalData: getOrderTypes,
      onPress: onOpenModal,
      status: getStatus('orderType'),
      stepKey: 'orderType',
      type: 'select',
      field: 'name',
    },

    period: {
      data: period,
      getModalData: getPeriods,
      onPress: onOpenModal,
      status: getStatus('period'),
      stepKey: 'period',
      type: 'select',
      field: 'name',
    },

    name: {
      data: name,
      status: getStatus('name'),
      onPress: onOpenModal,
      stepKey: 'name',
      type: 'input',
    },
  };

  /** Render */
  const { okButton, pageButtonTextStyle } = localStyles;
  const { isModalOpen } = state;
  const { currentKey } = state;
  const isDisabled = !(steps[steps.length - 1] === currentKey);

  return (
    <FlexColumn flex={1} alignItems="center">
      {transactionType !== 'customerRequisition' ? <ProgramToggleBar /> : null}
      {steps.map(stepKey => (
        <Step key={stepKey} {...stepProps[stepKey]} />
      ))}
      <PageButton
        text="OK"
        onPress={onCreate}
        isDisabled={isDisabled}
        disabledColor={WARM_GREY}
        style={okButton}
        textStyle={pageButtonTextStyle}
      />
      {isModalOpen && <ByProgramSelector />}
    </FlexColumn>
  );
};

const localStyles = StyleSheet.create({
  modalStyle: {
    ...globalStyles.modal,
    backgroundColor: DARK_GREY,
  },
  toggleContainer: {
    width: 292,
    alignSelf: 'center',
    marginVertical: 20,
  },
  okButton: {
    ...globalStyles.button,
    backgroundColor: SUSSOL_ORANGE,
    marginTop: 'auto',
  },
  pageButtonTextStyle: {
    ...globalStyles.buttonText,
    color: 'white',
    fontSize: 14,
  },
});

const getTitleString = transactionType =>
  `${transactionType === 'stocktake' ? programStrings.stock_take : navStrings.requisition} ${
    programStrings.details
  }`;

const getProgramToggle = transactionType =>
  transactionType === 'stocktake' ? programStrings.program_stocktake : programStrings.program_order;

const getGeneralToggle = transactionType =>
  transactionType === 'stocktake' ? programStrings.general_stocktake : programStrings.general_order;

const getLocalizedStrings = ({ transactionType } = {}) => ({
  title: getTitleString(transactionType),
  programToggleText: getProgramToggle(transactionType),
  generalToggleText: getGeneralToggle(transactionType),
  maxMOS: programStrings.max_mos,
  threshMOS: programStrings.threshold_mos,
  maxOPP: programStrings.max_orders_per_period,
  requisitions: programStrings.requisitions,
});

ByProgramModal.defaultProps = {
  transactionType: 'requisition',
};

ByProgramModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  database: PropTypes.object.isRequired,
  transactionType: PropTypes.string,
};

export default ByProgramModal;
