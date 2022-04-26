import moment from 'moment';
import { UIDatabase } from '../../database';
import { selectSpecificEntityState } from './index';

export const selectCreatingNameNote = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { creating } = nameNoteState;
  return creating;
};

export const selectNameNoteIsValid = state => {
  const nameNoteState = selectSpecificEntityState(state, 'nameNote');
  const { isValid = false } = nameNoteState ?? {};
  return isValid;
};

// Selects most recent PCD entered into the system at the time of vaccination
// (i.e. closest before or at the same time as the vaccination entry)
export const selectClosestPCDToVaccination = (patient, vaccinationEntryDate) => {
  const [pcdEvent] = UIDatabase.objects('PCDEvents');
  if (!pcdEvent) return null;

  const { id: pcdEventID } = pcdEvent;
  const nameNotes = patient?.nameNotes ?? [];

  if (!nameNotes.length) return null;

  // Check first for a nameNote entered before the vaccination date
  const filtered = nameNotes.filter(
    ({ patientEventID, entryDate }) =>
      patientEventID === pcdEventID && moment(vaccinationEntryDate) >= moment(entryDate)
  );

  if (!filtered.length) return null;

  const sorted = filtered.sort(
    ({ entryDate: entryDateA }, { entryDate: entryDateB }) =>
      moment(entryDateB).valueOf() - moment(entryDateA).valueOf()
  );

  const [mostRecentPCD] = sorted;
  return mostRecentPCD;
};

export const selectMostRecentPCD = patient => {
  const [pcdEvent] = UIDatabase.objects('PCDEvents');
  if (!pcdEvent) return null;

  const { id: pcdEventID } = pcdEvent;
  const nameNotes = patient?.nameNotes ?? [];

  if (!nameNotes.length) return null;

  const filtered = nameNotes.filter(({ patientEventID }) => patientEventID === pcdEventID);

  if (!filtered.length) return null;

  const sorted = filtered.sort(
    ({ entryDate: entryDateA }, { entryDate: entryDateB }) =>
      moment(entryDateB).valueOf() - moment(entryDateA).valueOf()
  );

  const [mostRecentPCD] = sorted;
  return mostRecentPCD;
};
