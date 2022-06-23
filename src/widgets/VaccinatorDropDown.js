/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { UIDatabase } from '../database/index';
import { DropDown } from './DropDown';

export const VaccinatorDropDown = ({ value, onChange }) => {
  const medicineAdmins = UIDatabase.objects('MedicineAdministrator').sorted('lastName');
  const values = medicineAdmins.map(({ displayString }) => displayString);

  return (
    <DropDown
      style={styles.dropdown}
      values={values}
      onValueChange={(_, i) => onChange(medicineAdmins[i])}
      selectedValue={value?.displayString}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: { height: 35, marginTop: 0, marginBottom: 0, marginLeft: 0 },
});

VaccinatorDropDown.defaultProps = {
  value: null,
};

VaccinatorDropDown.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};
