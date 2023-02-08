/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { batch, connect } from 'react-redux';

import { FlexRow } from './FlexRow';
import { FlexView } from './FlexView';
import { FlexColumn } from './FlexColumn';
import { SimpleLabel } from './SimpleLabel';
import { CircleButton } from './CircleButton';
import { PencilIcon, HistoryIcon, BookIcon } from './icons';

import { PatientActions } from '../actions/PatientActions';
import { PrescriberActions } from '../actions/PrescriberActions';
import {
  selectPrescriptionPatient,
  selectPrescriptionPrescriber,
  selectPrescriberName,
  selectPatientName,
} from '../selectors/prescription';

import { selectCanEditPatient } from '../selectors/patient';
import { selectCanEditPrescriber } from '../selectors/prescriber';

import { dispensingStrings } from '../localization';
import { NameNoteActions } from '../actions';

const PrescriptionInfoComponent = ({
  prescriptionPatient,
  prescriptionPrescriber,
  patientName,
  prescriberName,
  canEditPatient,
  canEditPrescriber,
  editPatient,
  editPrescriber,
  viewHistory,
}) => {
  const editPatientCallback = React.useCallback(() => editPatient(prescriptionPatient), [
    prescriptionPatient,
  ]);

  const prescriberEditCallback = React.useCallback(() => editPrescriber(prescriptionPrescriber), [
    prescriptionPrescriber,
  ]);

  const viewHistoryCallback = React.useCallback(() => viewHistory(prescriptionPatient), [
    prescriptionPatient,
  ]);

  return (
    <FlexRow style={{ minHeight: 40 }}>
      <FlexColumn flex={1}>
        <FlexRow alignItems="center" flex={1}>
          <FlexView flex={3}>
            <SimpleLabel label={dispensingStrings.patient} size="small" />
            <SimpleLabel text={patientName} size="medium" numberOfLines={1} />
          </FlexView>

          <FlexRow flex={1}>
            <CircleButton IconComponent={HistoryIcon} onPress={viewHistoryCallback} />
            <CircleButton
              IconComponent={canEditPatient ? PencilIcon : BookIcon}
              onPress={editPatientCallback}
            />
          </FlexRow>
        </FlexRow>
      </FlexColumn>

      <FlexColumn alignItems="flex-start" flex={1}>
        <FlexRow justifyContent="flex-start" alignItems="center" flex={1} reverse>
          <FlexView flex={3} justifyContent="flex-end" alignItems="flex-end">
            {!!prescriptionPrescriber && (
              <SimpleLabel label={dispensingStrings.prescriber} size="small" labelAlign="right" />
            )}
            {!!prescriptionPrescriber && (
              <SimpleLabel text={prescriberName} size="medium" textAlign="right" />
            )}
          </FlexView>

          <FlexRow flex={1}>
            {!!prescriptionPrescriber && (
              <CircleButton
                IconComponent={canEditPrescriber ? PencilIcon : BookIcon}
                onPress={prescriberEditCallback}
              />
            )}
          </FlexRow>
        </FlexRow>
      </FlexColumn>
    </FlexRow>
  );
};

const mapDispatchToProps = dispatch => {
  const editPatient = patient =>
    batch(() => {
      dispatch(NameNoteActions.createSurveyNameNote(patient));
      dispatch(PatientActions.editPatient(patient));
    });

  const viewHistory = patient => dispatch(PatientActions.viewPatientHistory(patient));
  const editPrescriber = prescriber => dispatch(PrescriberActions.editPrescriber(prescriber));
  return { editPatient, viewHistory, editPrescriber };
};

const mapStateToProps = state => {
  const prescriptionPatient = selectPrescriptionPatient(state);
  const prescriptionPrescriber = selectPrescriptionPrescriber(state);
  const patientName = selectPatientName(state);
  const prescriberName = selectPrescriberName(state);
  const canEditPatient = selectCanEditPatient(state);
  const canEditPrescriber = selectCanEditPrescriber(state);
  return {
    prescriptionPatient,
    prescriptionPrescriber,
    patientName,
    prescriberName,
    canEditPatient,
    canEditPrescriber,
  };
};

PrescriptionInfoComponent.defaultProps = {
  prescriberName: '',
  prescriptionPrescriber: null,
  prescriptionPatient: null,
};

PrescriptionInfoComponent.propTypes = {
  prescriptionPatient: PropTypes.object,
  patientName: PropTypes.string.isRequired,
  prescriberName: PropTypes.string,
  prescriptionPrescriber: PropTypes.object,
  canEditPatient: PropTypes.bool.isRequired,
  canEditPrescriber: PropTypes.bool.isRequired,
  editPatient: PropTypes.func.isRequired,
  editPrescriber: PropTypes.func.isRequired,
  viewHistory: PropTypes.func.isRequired,
};

export const PrescriptionInfo = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrescriptionInfoComponent);
