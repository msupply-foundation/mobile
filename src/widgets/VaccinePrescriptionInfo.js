/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import CheckBox from '@react-native-community/checkbox';
import { FlexRow } from './FlexRow';
import { selectFullName } from '../selectors/Entities/name';
import { Paper } from './Paper';
import { dispensingStrings, vaccineStrings } from '../localization';
import { FlexColumn } from './FlexColumn';
import { FlexView } from './FlexView';
import { APP_FONT_FAMILY, DARKER_GREY, SUSSOL_ORANGE } from '../globalStyles';
import { VaccinePrescriptionActions } from '../actions/Entities';
import {
  selectFoundBonusDose,
  selectHasRefused,
  selectSelectedVaccinator,
} from '../selectors/Entities/vaccinePrescription';
import { Spacer } from './Spacer';
import { BACKGROUND_COLOR, LIGHT_GREY } from '../globalStyles/colors';
import { selectCurrentTab } from '../selectors/wizard';
import { VaccinatorDropDown } from './VaccinatorDropDown';

const WithLabel = ({ label, ...props }) => (
  <FlexColumn flex={0}>
    <FlexView flex={0}>
      <Text style={styles.labelText}>{label}</Text>
    </FlexView>
    <FlexView flex={0} justifyContent="flex-end" {...props} />
  </FlexColumn>
);

WithLabel.propTypes = {
  label: PropTypes.string.isRequired,
};

const Header = ({ title }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerText}>{title}</Text>
  </View>
);

Header.propTypes = {
  title: PropTypes.string.isRequired,
};

const VaccinePrescriptionInfoComponent = ({
  currentWizardStep,
  patientName,
  onSelectVaccinator,
  vaccinator,
  onRefuse,
  hasRefused,
  onFoundBonusDose,
  foundBonusDose,
}) => (
  <Paper
    Header={
      <Header
        title={`${vaccineStrings.vaccine_step} ${currentWizardStep + 1} ${
          vaccineStrings.vaccine_dispense_vaccine_select_title
        }`}
      />
    }
    headerText={vaccineStrings.vaccine_dispense_step_three_title}
    style={{ flex: 2 }}
    contentContainerStyle={{ flex: 1 }}
  >
    <FlexRow flex={1} justifyContent="center" alignItems="center">
      <FlexRow flex={1} alignItems="center">
        <WithLabel label={vaccineStrings.vaccinator}>
          <VaccinatorDropDown onChange={onSelectVaccinator} value={vaccinator} />
        </WithLabel>
      </FlexRow>

      <WithLabel label={dispensingStrings.patient}>
        <Text style={styles.valueText}>{patientName}</Text>
      </WithLabel>

      <Spacer space={50} />

      <FlexRow flex={0} alignItems="center" justifyContent="space-between">
        <Text style={styles.labelText}>{dispensingStrings.refused_vaccine}</Text>

        <CheckBox
          onValueChange={onRefuse}
          value={hasRefused}
          tintColors={{ true: SUSSOL_ORANGE, false: DARKER_GREY }}
        />
      </FlexRow>
      <FlexRow flex={0} alignItems="center" justifyContent="space-between">
        <Text style={styles.labelText}>{dispensingStrings.bonus_dose}</Text>

        <CheckBox
          disabled={hasRefused}
          onValueChange={onFoundBonusDose}
          value={foundBonusDose}
          tintColors={{ true: SUSSOL_ORANGE, false: hasRefused ? LIGHT_GREY : DARKER_GREY }}
        />
      </FlexRow>
    </FlexRow>
  </Paper>
);

const mapDispatchToProps = dispatch => {
  const onSelectVaccinator = vaccinator =>
    dispatch(VaccinePrescriptionActions.selectVaccinator(vaccinator));
  const onRefuse = value => dispatch(VaccinePrescriptionActions.setRefusal(value));
  const onFoundBonusDose = value => dispatch(VaccinePrescriptionActions.setBonusDose(value));

  return { onSelectVaccinator, onRefuse, onFoundBonusDose };
};

const mapStateToProps = state => {
  const patientName = selectFullName(state);
  const hasRefused = selectHasRefused(state);
  const vaccinator = selectSelectedVaccinator(state);
  const foundBonusDose = selectFoundBonusDose(state);
  const currentWizardStep = selectCurrentTab(state);

  return {
    patientName,
    vaccinator,
    hasRefused,
    foundBonusDose,
    currentWizardStep,
  };
};

VaccinePrescriptionInfoComponent.defaultProps = {
  vaccinator: null,
};

VaccinePrescriptionInfoComponent.propTypes = {
  currentWizardStep: PropTypes.number.isRequired,
  patientName: PropTypes.string.isRequired,
  onSelectVaccinator: PropTypes.func.isRequired,
  vaccinator: PropTypes.object,
  onRefuse: PropTypes.func.isRequired,
  hasRefused: PropTypes.bool.isRequired,
  onFoundBonusDose: PropTypes.func.isRequired,
  foundBonusDose: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  labelText: {
    fontSize: 12,
    color: DARKER_GREY,
    fontFamily: APP_FONT_FAMILY,
  },
  valueText: {
    marginTop: 5,
    color: SUSSOL_ORANGE,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
  },
  headerContainer: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BACKGROUND_COLOR,
  },
  headerText: { fontFamily: APP_FONT_FAMILY, color: DARKER_GREY, fontSize: 14 },
});

export const VaccinePrescriptionInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(VaccinePrescriptionInfoComponent);
