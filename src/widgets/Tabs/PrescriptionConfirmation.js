/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CommonActions } from '@react-navigation/native';

import { PrescriptionSummary } from '../PrescriptionSummary';
import { PrescriptionInfo } from '../PrescriptionInfo';
import { FlexView } from '../FlexView';
import { FlexRow } from '../FlexRow';

import { UIDatabase } from '../../database';
import { pay } from '../../utilities/modules/dispensary/pay';
import { FinaliseActions } from '../../actions/FinaliseActions';
import { PaymentSummary } from '../PaymentSummary';
import { selectCurrentUser } from '../../selectors/user';
import { selectCurrentPatient } from '../../selectors/patient';
import { PrescriptionExtra } from '../PrescriptionExtra';
import { FlexColumn } from '../FlexColumn';

import { useLoadingIndicator } from '../../hooks/useLoadingIndicator';
import { PrescriptionActions } from '../../actions/PrescriptionActions';
import {
  selectPrescriptionTotal,
  selectDiscountAmount,
  selectPrescriptionSubTotal,
} from '../../selectors/payment';
import { selectInsuranceDiscountRate } from '../../selectors/insurance';
import { selectPrescriptionIsFinalised } from '../../selectors/prescription';

import { buttonStrings } from '../../localization';
import globalStyles from '../../globalStyles';
import { PageButtonWithOnePress } from '../PageButtonWithOnePress';

const { pageTopViewContainer } = globalStyles;
const mapStateToProps = state => {
  const { payment, wizard, modules } = state;
  const { transaction, paymentValid, paymentAmount, paymentType } = payment;
  const { isComplete } = wizard;
  const { usingPayments } = modules;
  const currentPatient = selectCurrentPatient(state);
  const currentUser = selectCurrentUser(state);
  const canConfirm = paymentValid && !isComplete;
  const total = selectPrescriptionTotal(state);
  const subtotal = selectPrescriptionSubTotal(state);
  const discountAmount = selectDiscountAmount(state);
  const discountRate = selectInsuranceDiscountRate(state);
  const isFinalised = selectPrescriptionIsFinalised(state);

  return {
    subtotal,
    discountAmount,
    discountRate,
    total,
    transaction,
    canConfirm,
    paymentAmount,
    paymentType,
    currentUser,
    currentPatient,
    usingPayments,
    isFinalised,
  };
};

const mapDispatchToProps = dispatch => {
  const openFinaliseModal = () => dispatch(FinaliseActions.openModal());
  const onDelete = () => dispatch(PrescriptionActions.cancelPrescription());
  const goBack = () => dispatch(CommonActions.goBack());
  return { goBack, onDelete, openFinaliseModal };
};

const PrescriptionConfirmationComponent = ({
  total,
  subtotal,
  discountAmount,
  discountRate,
  transaction,
  currentUser,
  currentPatient,
  paymentAmount,
  paymentType,
  canConfirm,
  usingPayments,
  onDelete,
  isFinalised,
  goBack,
}) => {
  const runWithLoadingIndicator = useLoadingIndicator();

  const confirmAndPay = React.useCallback(() => {
    pay(
      currentUser,
      currentPatient,
      transaction,
      paymentAmount.value,
      total.value,
      subtotal.value,
      discountAmount.value,
      discountRate,
      paymentType
    );
  }, [
    currentUser,
    currentPatient,
    transaction,
    paymentAmount.value,
    subtotal.value,
    total.value,
    discountAmount.value,
    discountRate,
    paymentType,
  ]);

  const confirmPrescription = React.useCallback(
    () =>
      runWithLoadingIndicator(() => {
        const shouldPay = usingPayments && total?.value;
        UIDatabase.write(() => {
          if (shouldPay) confirmAndPay();
          else transaction.finalise(UIDatabase);
        });
        goBack();
      }),
    [confirmAndPay]
  );

  return (
    <FlexView flex={1} style={pageTopViewContainer}>
      <PrescriptionInfo />

      <FlexRow flex={1} style={{ marginBottom: 7, marginTop: 10 }}>
        <FlexColumn flex={1}>
          <PrescriptionExtra />
          <PrescriptionSummary transaction={transaction} />
        </FlexColumn>

        <FlexColumn flex={1}>
          {!!usingPayments && <PaymentSummary />}

          <FlexRow justifyContent="flex-end">
            <PageButtonWithOnePress
              text={buttonStrings.cancel}
              onPress={onDelete}
              isDisabled={isFinalised}
              debounceTimer={3000}
              style={{ marginRight: 7 }}
            />
            <PageButtonWithOnePress
              isDisabled={!canConfirm}
              text={buttonStrings.confirm}
              onPress={confirmPrescription}
            />
          </FlexRow>
        </FlexColumn>
      </FlexRow>
    </FlexView>
  );
};

PrescriptionConfirmationComponent.defaultProps = {
  discountAmount: null,
  discountRate: 0,
  transaction: null,
  paymentType: null,
};

PrescriptionConfirmationComponent.propTypes = {
  transaction: PropTypes.object,
  currentUser: PropTypes.object.isRequired,
  currentPatient: PropTypes.object.isRequired,
  paymentAmount: PropTypes.object.isRequired,
  paymentType: PropTypes.object,
  canConfirm: PropTypes.bool.isRequired,
  usingPayments: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  total: PropTypes.object.isRequired,
  subtotal: PropTypes.object.isRequired,
  discountAmount: PropTypes.object,
  discountRate: PropTypes.number,
  isFinalised: PropTypes.bool.isRequired,
  goBack: PropTypes.func.isRequired,
};

export const PrescriptionConfirmation = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionConfirmationComponent);
