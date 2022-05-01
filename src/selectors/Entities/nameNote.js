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

// Selects most recent nameNote entered into the system at the time specified
// Defaults to searching from the current date
export const selectMostRecentNameNote = (
  patient,
  patientEventCode,
  datetoSearchFrom = new Date()
) => {
  const [event] = UIDatabase.objects('PatientEvent').filtered('code == $0', patientEventCode);
  if (!event) return null;

  const { id: eventID } = event;
  const nameNotes = patient?.nameNotes ?? [];

  if (!nameNotes.length) return null;

  // Check first for a nameNote entered before the specified date
  const filtered = nameNotes.filter(
    ({ patientEventID, entryDate }) =>
      patientEventID === eventID && moment(datetoSearchFrom) >= moment(entryDate)
  );

  if (!filtered.length) return null;

  const sorted = filtered.sort(
    ({ entryDate: entryDateA }, { entryDate: entryDateB }) =>
      moment(entryDateB).valueOf() - moment(entryDateA).valueOf()
  );

  const [mostRecentPCD] = sorted;
  return mostRecentPCD;
};
