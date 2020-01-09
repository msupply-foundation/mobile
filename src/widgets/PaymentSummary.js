/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FlexView } from './FlexView';
import { NumberLabelRow } from './NumberLabelRow';
import { Separator } from './Separator';
import { CurrencyInputRow } from './CurrencyInputRow';

import { FINALISED_RED, SUSSOL_ORANGE, APP_FONT_FAMILY } from '../globalStyles';
import { PaymentActions } from '../actions/PaymentActions';
import {
  selectPrescriptionSubTotal,
  selectPrescriptionTotal,
  selectCreditBeingUsed,
} from '../selectors/payment';
import { DropDown } from './DropDown';
import { selectPatientInsurancePolicies } from '../selectors/patient';
import { UIDatabase } from '../database/index';

const paymentState = state => {
  const { payment, wizard } = state;

  const { isComplete } = wizard;
  const { insurancePolicy, paymentAmount, creditOverflow, paymentType } = payment;
  const subtotal = selectPrescriptionSubTotal(state);
  const total = selectPrescriptionTotal(state);
  const creditUsed = selectCreditBeingUsed(state);

  const insurancePolicies = selectPatientInsurancePolicies(state);
  const paymentTypes = UIDatabase.objects('PaymentType');

  return {
    insurancePolicy,
    subtotal,
    total,
    creditUsed,
    paymentAmount,
    creditOverflow,
    isComplete,
    insurancePolicies,
    paymentTypes,
    paymentType,
  };
};

const paymentDispatch = dispatch => {
  const choosePolicy = policy => dispatch(PaymentActions.choosePolicy(policy));
  const choosePaymentType = paymentType => dispatch(PaymentActions.choosePaymentType(paymentType));
  const updatePayment = amount => dispatch(PaymentActions.validatePayment(amount));

  return { choosePolicy, choosePaymentType, updatePayment };
};

const PaymentSummaryComponent = ({
  subtotal,
  total,
  updatePayment,
  creditUsed,
  paymentAmount,
  creditOverflow,
  isComplete,
  insurancePolicies,
  choosePolicy,
  insurancePolicy,
  paymentTypes,
  choosePaymentType,
  paymentType,
}) => {
  const policyNumbers = React.useMemo(() => insurancePolicies.map(p => p.policyNumber), [
    insurancePolicies,
  ]);
  const onSelectPolicy = React.useCallback((_, index) => choosePolicy(insurancePolicies[index]), [
    choosePolicy,
  ]);
  const paymentTypeTitles = React.useMemo(() => paymentTypes.map(({ title }) => title), [
    paymentTypes,
  ]);
  const onSelectPaymentType = React.useCallback(
    (_, index) => choosePaymentType(paymentTypes[index]),
    [choosePaymentType]
  );

  return (
    <ScrollView>
      <FlexView flex={1} style={localStyles.container}>
        <Text style={localStyles.title}>Payment</Text>

        <DropDown
          values={policyNumbers}
          selectedValue={insurancePolicy?.policyNumber}
          onValueChange={onSelectPolicy}
          style={localStyles.dropdown}
        />

        <DropDown
          values={paymentTypeTitles}
          selectedValue={paymentType?.title}
          onValueChange={onSelectPaymentType}
          style={localStyles.dropdown}
        />

        <FlexView flex={1}>
          <FlexView flex={0.25}>
            <CurrencyInputRow
              isDisabled={isComplete}
              currencyAmount={paymentAmount}
              onChangeText={updatePayment}
            />
          </FlexView>

          <FlexView flex={0.25}>
            <NumberLabelRow
              size="small"
              text="Credit used"
              isCurrency
              number={creditUsed.format()}
            />
            <Text style={localStyles.errorMessageStyle}>
              {creditOverflow ? 'Not enough credit!' : ''}
            </Text>
          </FlexView>
        </FlexView>

        <FlexView flex={1}>
          <Separator />
          <NumberLabelRow size="small" text="Sub total" isCurrency number={subtotal.format()} />
          <NumberLabelRow size="large" text="Total" isCurrency number={total.format()} />
        </FlexView>
      </FlexView>
    </ScrollView>
  );
};

PaymentSummaryComponent.propTypes = {
  subtotal: PropTypes.object.isRequired,
  total: PropTypes.object.isRequired,
  updatePayment: PropTypes.func.isRequired,
  creditUsed: PropTypes.object.isRequired,
  paymentAmount: PropTypes.object.isRequired,
  creditOverflow: PropTypes.bool.isRequired,
  isComplete: PropTypes.bool.isRequired,
  insurancePolicies: PropTypes.object.isRequired,
  choosePolicy: PropTypes.func.isRequired,
  insurancePolicy: PropTypes.object.isRequired,
  paymentTypes: PropTypes.object.isRequired,
  choosePaymentType: PropTypes.func.isRequired,
  paymentType: PropTypes.object.isRequired,
};

const localStyles = {
  container: {
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    marginHorizontal: 50,
    marginBottom: 10,
    padding: 10,
  },
  title: {
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: SUSSOL_ORANGE,
    marginVertical: 5,
  },
  dropdown: { width: null, flex: 1 },
  errorMessageStyle: { color: FINALISED_RED, fontFamily: APP_FONT_FAMILY },
};

export const PaymentSummary = connect(paymentState, paymentDispatch)(PaymentSummaryComponent);
