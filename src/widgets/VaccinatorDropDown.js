/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { UIDatabase } from '../database/index';
import { DropDown } from './DropDown';

export const VaccinatorDropDown = ({ value, onChange, style }) => {
  const medicineAdmins = UIDatabase.objects('MedicineAdministrator').sorted('lastName');
  const values = medicineAdmins.map(({ displayString }) => displayString);
  return (
    <DropDown
      style={{ ...style, ...styles.dropdown }}
      isDisabled={values.length <= 0}
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
  style: {},
};

VaccinatorDropDown.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object,
};
