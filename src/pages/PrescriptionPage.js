/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Wizard } from '../widgets';
import { PrescriberSelect } from '../widgets/Tabs/PrescriberSelect';
import { ItemSelect } from '../widgets/Tabs/ItemSelect';
import { PrescriptionConfirmation } from '../widgets/Tabs/PrescriptionConfirmation';

import { useRecordListener } from '../hooks';
import { WizardActions } from '../actions/WizardActions';

import { dispensingStrings } from '../localization';
import { InsurancePolicyModel, PrescriberModel } from '../widgets/modals';
import { PatientEditModal } from '../widgets/modalChildren';

const tabs = [
  {
    component: PrescriberSelect,
    name: 'prescriber',
    title: dispensingStrings.select_the_prescriber,
  },
  { component: ItemSelect, name: 'item', title: dispensingStrings.select_items },
  { component: PrescriptionConfirmation, name: 'prescription', title: dispensingStrings.finalise },
];

export const Prescription = ({ transaction, completePrescription }) => {
  useRecordListener(completePrescription, transaction, 'Transaction');

  return (
    <>
      <Wizard tabs={tabs} />
      <InsurancePolicyModel />
      <PrescriberModel />
      <PatientEditModal />
    </>
  );
};

const mapDispatchToProps = dispatch => {
  const completePrescription = () => dispatch(WizardActions.complete());
  return { completePrescription };
};

const mapStateToProps = (state, props) => mapParamsToProps(props);

const mapParamsToProps = props => {
  const { route = {} } = props;
  const { params = {} } = route;
  const { transaction } = params;
  return { transaction };
};

export const PrescriptionPage = connect(mapStateToProps, mapDispatchToProps)(Prescription);

Prescription.propTypes = {
  transaction: PropTypes.object.isRequired,
  completePrescription: PropTypes.func.isRequired,
};
