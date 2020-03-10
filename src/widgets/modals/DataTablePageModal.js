/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import { UIDatabase } from '../../database';
import Settings from '../../settings/MobileAppSettings';
import { getModalTitle, MODAL_KEYS } from '../../utilities/getModalTitle';

import { ModalContainer } from './ModalContainer';
import {
  TextEditor,
  AutocompleteSelector,
  ConfirmForm,
  GenericChoiceList,
  MultiSelectList,
  ToggleSelector,
} from '../modalChildren';

import { ByProgramModal } from './ByProgramModal';
import { CashTransactionModal } from './CashTransactionModal';
import { RegimenDataModal } from './RegimenDataModal';
import { StocktakeBatchModal } from './StocktakeBatchModal';

import { modalStrings } from '../../localization';

/**
 * Wrapper around ModalContainer, containing common modals used in various
 * DataTable pages.
 *
 * NOTE: Exported component is MEMOIZED - see below for propsAreEqual implementation.
 *
 * @prop {Bool}   fullScreen   Force the modal to cover the entire screen.
 * @prop {Bool}   isOpen       Whether the modal is open
 * @prop {Func}   onClose      A function to call if the close x is pressed
 * @prop {Func}   onSelect     The components to render within the modal
 * @prop {String} modalKey     The title to show in within the modal.
 * @prop {String} currentValue The current value a modal should be i.e. theirRef/comment
 */

const ADDITIONAL_MODAL_PROPS = {
  [MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM]: { noCancel: true, fullScreen: true },
  [MODAL_KEYS.ENFORCE_STOCKTAKE_REASON]: { noCancel: true, fullScreen: true },
  [MODAL_KEYS.ENFORCE_REQUISITION_REASON]: { noCancel: true, fullScreen: true },
};

const DataTablePageModalComponent = ({
  fullScreen,
  isOpen,
  onClose,
  modalKey,
  onSelect,
  currentValue,
}) => {
  const ModalContent = () => {
    switch (modalKey) {
      case MODAL_KEYS.CREATE_CASH_TRANSACTION:
        return <CashTransactionModal onConfirm={onSelect} />;
      case MODAL_KEYS.SELECT_ITEM:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Item')}
            queryString="name CONTAINS[c] $0 OR code BEGINSWITH[c] $0"
            sortKeyString="name"
            onSelect={onSelect}
            renderLeftText={({ code, name }) => `${code} - ${name}`}
            renderRightText={({ totalQuantity }) => `${totalQuantity}`}
          />
        );
      case MODAL_KEYS.CONFIRM_USER_PASSWORD:
      case MODAL_KEYS.SYNC_URL_EDIT:
      case MODAL_KEYS.SYNC_PASSWORD_EDIT:
      case MODAL_KEYS.STOCKTAKE_NAME_EDIT:
      case MODAL_KEYS.THEIR_REF_EDIT:
      case MODAL_KEYS.STOCKTAKE_COMMENT_EDIT:
      case MODAL_KEYS.TRANSACTION_COMMENT_EDIT:
      case MODAL_KEYS.REQUISITION_COMMENT_EDIT: {
        const isPasswordEdit = !!(
          modalKey === MODAL_KEYS.CONFIRM_USER_PASSWORD ||
          modalKey === MODAL_KEYS.SYNC_PASSWORD_EDIT
        );
        return (
          <TextEditor
            text={currentValue}
            onEndEditing={onSelect}
            secureTextEntry={isPasswordEdit}
          />
        );
      }
      case MODAL_KEYS.SELECT_PRESCRIBER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Prescriber')}
            isOpen={isOpen}
            placeholderText="Select a prescriber"
            queryString="firstName BEGINSWITH[c] $0"
            sortByString="firstName"
            onSelect={onSelect}
            renderLeftText={({ firstName, lastName }) => `${firstName} ${lastName}`}
          />
        );
      case MODAL_KEYS.SELECT_PATIENT:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Patient')}
            isOpen={isOpen}
            placeholderText="Start typing to select a patient"
            queryString="firstName BEGINSWITH[c] $0"
            sortByString="firstName"
            onSelect={onSelect}
            renderLeftText={({ firstName, lastName }) => `${firstName} ${lastName}`}
          />
        );

      case MODAL_KEYS.SELECT_CUSTOMER:
        return (
          <AutocompleteSelector
            options={UIDatabase.objects('Customer')}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_customer}
            queryString="name BEGINSWITH[c] $0"
            sortKeyString="name"
            onSelect={onSelect}
          />
        );
      case MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER:
      case MODAL_KEYS.SELECT_INTERNAL_SUPPLIER: {
        const options =
          modalKey === MODAL_KEYS.SELECT_EXTERNAL_SUPPLIER
            ? UIDatabase.objects('ExternalSupplier')
            : UIDatabase.objects('InternalSupplier');
        return (
          <AutocompleteSelector
            options={options}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_supplier}
            queryString="name BEGINSWITH[c] $0"
            sortKeyString="name"
            onSelect={onSelect}
          />
        );
      }

      case MODAL_KEYS.PROGRAM_STOCKTAKE:
      case MODAL_KEYS.PROGRAM_REQUISITION:
        return (
          <ByProgramModal
            onConfirm={onSelect}
            database={UIDatabase}
            transactionType={
              modalKey === MODAL_KEYS.PROGRAM_STOCKTAKE ? 'stocktake' : 'requisition'
            }
            settings={Settings}
          />
        );

      case MODAL_KEYS.SELECT_MONTH:
        return (
          <ToggleSelector
            options={[1, 2, 3, 4, 5, 6]}
            onSelect={onSelect}
            selected={currentValue}
          />
        );

      case MODAL_KEYS.VIEW_REGIMEN_DATA:
        return <RegimenDataModal requisition={currentValue} />;

      case MODAL_KEYS.EDIT_STOCKTAKE_BATCH:
        return <StocktakeBatchModal stocktakeItem={currentValue} />;

      case MODAL_KEYS.STOCKTAKE_OUTDATED_ITEM:
        return (
          <ConfirmForm
            coverScreen
            noCancel
            isOpen={isOpen}
            questionText={`${modalStrings.stocktake_invalid_stock} ${currentValue}`}
            onConfirm={onSelect}
          />
        );
      case MODAL_KEYS.ENFORCE_REQUISITION_REASON:
      case MODAL_KEYS.REQUISITION_REASON: {
        const { reasonTitle } = currentValue;
        const reasonsSelection = UIDatabase.objects('RequisitionReason');

        return (
          <GenericChoiceList
            data={reasonsSelection}
            highlightValue={reasonTitle}
            keyToDisplay="title"
            onPress={onSelect}
          />
        );
      }

      case MODAL_KEYS.ENFORCE_STOCKTAKE_REASON:
      case MODAL_KEYS.STOCKTAKE_REASON: {
        const { difference, reasonTitle } = currentValue;
        const reasonsSelection =
          difference > 0
            ? UIDatabase.objects('PositiveAdjustmentReason')
            : UIDatabase.objects('NegativeAdjustmentReason');
        return (
          <GenericChoiceList
            data={reasonsSelection}
            highlightValue={reasonTitle}
            keyToDisplay="title"
            onPress={onSelect}
          />
        );
      }
      case MODAL_KEYS.SELECT_MASTER_LISTS:
        return (
          <MultiSelectList
            options={currentValue}
            isOpen={isOpen}
            placeholderText={modalStrings.start_typing_to_select_master_list}
            queryString="name BEGINSWITH[c] $0"
            sortByString="name"
            onConfirmSelections={onSelect}
            emptyMessage={modalStrings.no_masterlist_available}
          />
        );
      default:
        return null;
    }
  };

  const modalTitle = getModalTitle(modalKey);
  const numberOfTitleLines = modalTitle.split('\n').length;

  return (
    <ModalContainer
      fullScreen={fullScreen}
      isVisible={isOpen}
      onClose={onClose}
      title={modalTitle}
      numberOfLines={numberOfTitleLines}
      {...ADDITIONAL_MODAL_PROPS[modalKey]}
    >
      <ModalContent />
    </ModalContainer>
  );
};

/**
 * Only re-render this component when the isOpen prop changes.
 */
const propsAreEqual = ({ isOpen: prevIsOpen }, { isOpen: nextIsOpen }) => prevIsOpen === nextIsOpen;

export const DataTablePageModal = React.memo(DataTablePageModalComponent, propsAreEqual);

DataTablePageModalComponent.defaultProps = {
  fullScreen: false,
  modalKey: '',
  onSelect: null,
  currentValue: '',
  modalObject: null,
};

DataTablePageModalComponent.propTypes = {
  modalObject: PropTypes.object,
  fullScreen: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  modalKey: PropTypes.string,
  onSelect: PropTypes.func,
  currentValue: PropTypes.any,
};
