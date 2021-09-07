/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Wizard } from '../widgets';
import { PatientSelect } from '../widgets/Tabs/PatientSelect';
import { PatientEdit } from '../widgets/Tabs/PatientEdit';
import { VaccineSelect } from '../widgets/Tabs/VaccineSelect';
import { dispensingStrings } from '../localization';
import { VaccineSupplementalData } from '../widgets/Tabs/VaccineSupplementalData';
import { selectSupplementalDataSchemas } from '../selectors/formSchema';

const allTabs = [
  { component: PatientSelect, name: 'patient', title: dispensingStrings.select_the_patient },
  { component: PatientEdit, name: 'edit', title: dispensingStrings.edit_the_patient },
  {
    component: VaccineSupplementalData,
    name: 'supplementalData',
    title: dispensingStrings.edit_supplemental_data,
  },
  { component: VaccineSelect, name: 'prescription', title: dispensingStrings.finalise },
];

export const VaccineDispensingPageComponent = ({ supplementalDataSchema }) => {
  // Site tab is conditional on form schema presence
  const tabs = !supplementalDataSchema
    ? allTabs.filter(tab => tab.name !== 'supplementalData')
    : allTabs;

  return (
    <>
      <Wizard useNewStepper captureUncaughtGestures={false} tabs={tabs} />
    </>
  );
};

VaccineDispensingPageComponent.defaultProps = {
  supplementalDataSchema: null,
};

VaccineDispensingPageComponent.propTypes = {
  supplementalDataSchema: PropTypes.object,
};

const stateToProps = () => {
  const supplementalDataSchemas = selectSupplementalDataSchemas();
  const [supplementalDataSchema] = supplementalDataSchemas;

  return { supplementalDataSchema };
};

export const VaccineDispensingPage = connect(stateToProps)(VaccineDispensingPageComponent);
