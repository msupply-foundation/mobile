import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';
import { ToastAndroid } from 'react-native';
import moment from 'moment';
import { selectEditingName } from '../../selectors/Entities/name';
import { createRecord, UIDatabase } from '../../database';
import { createPatientVisibility } from '../../sync/lookupApiUtils';
import { generalStrings } from '../../localization/index';

export const NAME_ACTIONS = {
  CREATE: 'NAME/create',
  UPDATE: 'NAME/update',
  SELECT: 'NAME/select',
  RESET: 'NAME/reset',
  FILTER: 'NAME/filter',
  SORT: 'NAME/sort',
  SAVE: 'NAME/save',
  FETCH_SUCCESS: 'NAME/fetchSuccess',
};

export const createDefaultName = (type = 'patient', id) => ({
  id: id ?? generateUUID(),
  code: '',
  isCustomer: false,
  isManufacturer: false,
  isPatient: true,
  isSupplier: false,
  isVisible: true,
  name: '',
  type,
  isEditable: true,
  createdDate: moment().format(),
});

const create = name => ({
  type: NAME_ACTIONS.CREATE,
  payload: { name },
});

const reset = () => ({
  type: NAME_ACTIONS.RESET,
});

const update = (id, field, value) => ({
  type: NAME_ACTIONS.UPDATE,
  payload: { id, field, value },
});

const updatePatient = detailsEntered => (dispatch, getState) => {
  const currentPatient = selectEditingName(getState());
  const { id } = currentPatient || {};

  if (!id) return;

  batch(() => {
    Object.entries(detailsEntered).forEach(([key, value]) => {
      if (currentPatient[key] !== value) {
        dispatch(update(id, key, value));
      }
    });
  });
};

const select = name => async dispatch => {
  // If it's a realm object, then patient visibility needs to be created
  // on the server. If we can't set up the patient visibility, rollback
  // and don't save or select the patient- give a toast to the user
  // to say why. Otherwise, if there is no visibility, we won't receive
  // updates for the name record.
  let selectedName = null;
  const storedName = UIDatabase.get('Name', name?.id);
  if (!storedName) {
    const result = await createPatientVisibility(name);
    if (result) {
      UIDatabase.write(() => {
        selectedName = createRecord(UIDatabase, 'Patient', name, true);
      });
    } else {
      ToastAndroid.show(generalStrings.problem_connecting_please_try_again, ToastAndroid.LONG);
    }
  } else {
    selectedName = storedName;
  }

  if (selectedName) {
    dispatch({
      type: NAME_ACTIONS.SELECT,
      payload: { name: selectedName },
    });
  }

  return selectedName;
};

const filter = (key, value) => ({ type: NAME_ACTIONS.FILTER, payload: { key, value } });

const sort = sortKey => ({ type: NAME_ACTIONS.SORT, payload: { sortKey } });

const saveEditing = () => (dispatch, getState) => {
  const currentPatient = selectEditingName(getState());
  const createdDate = currentPatient?.createdDate ? new Date(currentPatient.createdDate) : null;
  const dateOfBirth = new Date(currentPatient.dateOfBirth);
  const name = `${currentPatient.lastName}, ${currentPatient.firstName}`;

  const patientRecord = { ...currentPatient, dateOfBirth, createdDate, name };

  UIDatabase.write(() => createRecord(UIDatabase, 'Patient', patientRecord, true));
  dispatch(reset());
};

export const NameActions = {
  create,
  filter,
  reset,
  saveEditing,
  select,
  sort,
  update,
  updatePatient,
};
