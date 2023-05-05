/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { Text, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { FlexView } from './FlexView';
import { NumberLabelRow } from './NumberLabelRow';
import { Separator } from './Separator';
import { CurrencyInputRow } from './CurrencyInputRow';
import { FlexRow } from './FlexRow';
import { CircleButton } from './CircleButton';
import { PencilIcon, AddIcon, BookIcon } from './icons';
import { DropDown } from './DropDown';

import { UIDatabase } from '../database';
import { PaymentActions } from '../actions/PaymentActions';
import {
  selectPrescriptionSubTotal,
  selectPrescriptionTotal,
  selectCreditBeingUsed,
  selectDiscountRate,
  selectDiscountAmount,
  selectChangeRequired,
} from '../selectors/payment';
import { selectPatientInsurancePolicies, selectAvailableCredit } from '../selectors/patient';

import { InsuranceActions } from '../actions/InsuranceActions';
import { selectCanEditInsurancePolicy } from '../selectors/insurance';
import { selectUsingPaymentTypes } from '../selectors/modules';

import { dispensingStrings } from '../localization';
import { FINALISED_RED, SUSSOL_ORANGE, APP_FONT_FAMILY } from '../globalStyles';
import { selectPrescriptionInsuracePolicy } from '../selectors/prescription';

const paymentState = state => {
  const { insurance, payment, wizard, modules } = state;
  const { usingInsurance } = modules;
  const { isComplete } = wizard;
  const { paymentAmount, creditOverflow, paymentType } = payment;
  const { selectedInsurancePolicy } = insurance;
  const selectedPrescriptionInsurancePolicy = selectPrescriptionInsuracePolicy(state);
  const subtotal = selectPrescriptionSubTotal(state);
  const total = selectPrescriptionTotal(state);
  const creditUsed = selectCreditBeingUsed(state);
  const availableCredit = selectAvailableCredit(state);
  const insurancePolicies = selectPatientInsurancePolicies(state);
  const isPolicyEditable = selectCanEditInsurancePolicy(state);
  const paymentTypes = UIDatabase.objects('PaymentType').sorted('description');
  const discountRate = selectDiscountRate(state);
  const discountAmount = selectDiscountAmount(state);
  const changeRequired = selectChangeRequired(state);
  const usingPaymentTypes = selectUsingPaymentTypes(state);

  return {
    usingPaymentTypes,
    discountRate,
    discountAmount,
    subtotal,
    total,
    creditUsed,
    paymentAmount,
    creditOverflow,
    isComplete,
    insurancePolicies,
    paymentTypes,
    paymentType,
    selectedInsurancePolicy,
    isPolicyEditable,
    availableCredit,
    changeRequired,
    usingInsurance,
    selectedPrescriptionInsurancePolicy,
  };
};

const paymentDispatch = dispatch => {
  const choosePolicy = policy => dispatch(InsuranceActions.select(policy));
  const choosePaymentType = paymentType => dispatch(PaymentActions.choosePaymentType(paymentType));
  const updatePayment = amount => dispatch(PaymentActions.validatePayment(amount));

  const editPolicy = () => dispatch(InsuranceActions.edit());
  const newPolicy = () => dispatch(InsuranceActions.createNew());

  return { choosePolicy, choosePaymentType, updatePayment, editPolicy, newPolicy };
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
  paymentTypes,
  choosePaymentType,
  paymentType,
  selectedInsurancePolicy,
  isPolicyEditable,
  editPolicy,
  newPolicy,
  discountRate,
  discountAmount,
  availableCredit,
  changeRequired,
  usingInsurance,
  usingPaymentTypes,
  selectedPrescriptionInsurancePolicy,
}) => {
  const policyNumbers = React.useMemo(() => insurancePolicies.map(policy => policy.policyNumber), [
    insurancePolicies,
  ]);

  const selectedPolicyNumber = React.useMemo(() => {
    let policyNumberFull = '';
    if (selectedPrescriptionInsurancePolicy) {
      // console.log('selectedInsuracePolicy ', selectedInsuracePolicy);
      if (!selectedPrescriptionInsurancePolicy.policyNumberPerson) {
        policyNumberFull = selectedPrescriptionInsurancePolicy.policyNumberFamily;
      } else {
        policyNumberFull = `${selectedPrescriptionInsurancePolicy.policyNumberFamily}-${selectedPrescriptionInsurancePolicy.policyNumberPerson}`;
      }
    }
    return policyNumberFull;
  }, [selectedPrescriptionInsurancePolicy]);

  const onSelectPolicy = React.useCallback(
    (_, index) => {
      choosePolicy(insurancePolicies[index]);
    },
    [choosePolicy, insurancePolicies]
  );

  const paymentTypeTitles = React.useMemo(
    () => paymentTypes.map(({ description }) => description),
    [paymentTypes]
  );

  const onSelectPaymentType = React.useCallback(
    (_, index) => choosePaymentType(paymentTypes[index]),
    [choosePaymentType, paymentTypes]
  );

  return (
    <ScrollView>
      <FlexView style={localStyles.container}>
        <Text style={localStyles.title}>{dispensingStrings.payment}</Text>
        {!!usingInsurance && (
          <FlexRow flex={1}>
            <DropDown
              headerValue={dispensingStrings.select_a_policy}
              values={policyNumbers}
              selectedValue={selectedPolicyNumber}
              onValueChange={onSelectPolicy}
              style={localStyles.dropdown}
            />
            {!!selectedInsurancePolicy && (
              <CircleButton
                IconComponent={isPolicyEditable ? PencilIcon : BookIcon}
                onPress={editPolicy}
              />
            )}
            <CircleButton IconComponent={AddIcon} onPress={newPolicy} />
          </FlexRow>
        )}

        {!!usingPaymentTypes && (
          <DropDown
            headerValue={dispensingStrings.select_a_payment_type}
            values={paymentTypeTitles}
            selectedValue={paymentType?.description}
            onValueChange={onSelectPaymentType}
            style={localStyles.dropdown}
          />
        )}

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
              text={dispensingStrings.available_credit}
              number={availableCredit.format()}
            />
            <NumberLabelRow
              size="small"
              text={dispensingStrings.credit_used}
              number={creditUsed.format()}
            />

            <Text style={localStyles.errorMessageStyle}>
              {creditOverflow ? dispensingStrings.not_enough_credit : ' '}
            </Text>
          </FlexView>
        </FlexView>

        <FlexView flex={1}>
          <Separator marginBottom={20} />
          <NumberLabelRow
            text={dispensingStrings.subtotal}
            number={subtotal.format()}
            size="medium"
            bold
          />

          {!!usingInsurance && (
            <NumberLabelRow
              text={dispensingStrings.insurance_discount_rate}
              isPercentage
              number={discountRate}
            />
          )}
          {!!usingInsurance && (
            <NumberLabelRow
              text={dispensingStrings.insurance_discount_amount}
              number={discountAmount.format()}
            />
          )}
          <NumberLabelRow
            text={dispensingStrings.change_required}
            number={changeRequired.format()}
          />
          <Separator length="50%" marginTop={20} marginBottom={20} />
          <NumberLabelRow size="large" text={dispensingStrings.total} number={total.format()} />
        </FlexView>
      </FlexView>
    </ScrollView>
  );
};

PaymentSummaryComponent.defaultProps = {
  paymentType: null,
  selectedInsurancePolicy: null,
  isPolicyEditable: false,
  creditOverflow: false,
  selectedPrescriptionInsurancePolicy: null,
};

PaymentSummaryComponent.propTypes = {
  subtotal: PropTypes.object.isRequired,
  total: PropTypes.object.isRequired,
  updatePayment: PropTypes.func.isRequired,
  creditUsed: PropTypes.object.isRequired,
  paymentAmount: PropTypes.object.isRequired,
  creditOverflow: PropTypes.bool,
  isComplete: PropTypes.bool.isRequired,
  insurancePolicies: PropTypes.array.isRequired,
  choosePolicy: PropTypes.func.isRequired,
  selectedInsurancePolicy: PropTypes.object,
  isPolicyEditable: PropTypes.bool,
  editPolicy: PropTypes.func.isRequired,
  newPolicy: PropTypes.func.isRequired,
  paymentTypes: PropTypes.object.isRequired,
  choosePaymentType: PropTypes.func.isRequired,
  paymentType: PropTypes.object,
  discountRate: PropTypes.number.isRequired,
  discountAmount: PropTypes.object.isRequired,
  availableCredit: PropTypes.object.isRequired,
  changeRequired: PropTypes.object.isRequired,
  usingInsurance: PropTypes.bool.isRequired,
  usingPaymentTypes: PropTypes.bool.isRequired,
  selectedPrescriptionInsurancePolicy: PropTypes.object,
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
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: SUSSOL_ORANGE,
    marginVertical: 5,
  },
  dropdown: { width: null, flex: 1 },
  errorMessageStyle: { color: FINALISED_RED, fontFamily: APP_FONT_FAMILY },
};

export const PaymentSummary = connect(paymentState, paymentDispatch)(PaymentSummaryComponent);
