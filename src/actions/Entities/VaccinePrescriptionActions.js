import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';

import { UIDatabase, createRecord } from '../../database';
import {
  selectFoundBonusDose,
  selectHasRefused,
  selectLastSupplementalData,
  selectSelectedBatches,
  selectSelectedSupplementalData,
  selectSelectedVaccinator,
} from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';
import { goBack, gotoVaccineDispensingPage } from '../../navigation/actions';
import { selectSupplementalDataSchemas } from '../../selectors/formSchema';
import { validateJsonSchemaData } from '../../utilities/ajvValidator';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  SET_REFUSAL: 'VACCINE_PRESCRIPTION/setRefusal',
  RESET: 'VACCINE_PRESCRIPTION/reset',
  SELECT_VACCINE: 'VACCINE_PRESCRIPTION/selectVaccine',
  SELECT_SUPPLEMENTAL_DATA: 'VACCINE_PRESCRIPTION/selectSupplementalData',
  UPDATE_SUPPLEMENTAL_DATA: 'VACCINE_PRESCRIPTION/updateSupplementalData',
  SELECT_BATCH: 'VACCINE_PRESCRIPTION/selectBatch',
  SELECT_VACCINATOR: 'VACCINE_PRESCRIPTION/selectVaccinator',
  SET_BONUS_DOSE: 'VACCINE_PRESCRIPTION/setBonusDose',
  TOGGLE_HISTORY: 'VACCINE_PRESCRIPTION/toggleHistory',
  SELECT_DEFAULT_VACCINE: 'VACCINE_PRESCRIPTION/selectDefaultVaccine',
};

const createDefaultVaccinePrescription = () => ({
  id: generateUUID(),
  name: '',
  code: '',
  type: 'patient',
  isCustomer: false,
  isSupplier: false,
  isManufacturer: false,
  isVisible: true,
});

const getDefaultVaccinator = () => {
  const [batches] = UIDatabase.objects('TransactionBatch')
    .filtered('medicineAdministrator != null && itemBatch.item.isVaccine == true')
    .sorted('transaction.confirmDate', true);

  if (batches) {
    return batches.medicineAdministrator;
  }

  return UIDatabase.objects('MedicineAdministrator').sorted('lastName')[0] ?? null;
};

const getDefaultVaccine = () => {
  const [mostRecentTrans] = UIDatabase.objects('Transaction')
    .filtered("type == 'customer_invoice' && (status == 'finalised' || status == 'confirmed')")
    .sorted('confirmDate', true);

  const anyVaccine = UIDatabase.objects('ItemBatch').filtered(
    'item.isVaccine == true && numberOfPacks > 0'
  )[0]?.item;

  const mostRecentlyUsedVaccine = mostRecentTrans?.items?.filtered('item.isVaccine == true')[0]
    ?.item;

  const item = mostRecentlyUsedVaccine?.hasStock ? mostRecentlyUsedVaccine : anyVaccine;

  return item ?? null;
};

const getRecommendedBatch = vaccine => {
  const { batchesWithStock = [] } = vaccine ?? getDefaultVaccine() ?? {};

  if (batchesWithStock?.length) {
    const batchesByExpiry = batchesWithStock.sorted('expiryDate');
    const openVials = batchesByExpiry.filter(b => !Number.isInteger(b.numberOfPacks));

    return openVials.length ? openVials[0] : batchesByExpiry[0];
  }

  return null;
};

const create = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.CREATE,
  payload: {
    prescription: createDefaultVaccinePrescription(),
    vaccinator: getDefaultVaccinator(),
  },
});

const reset = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.RESET,
});

const selectDefaultVaccine = () => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_DEFAULT_VACCINE,
  payload: { selectedVaccines: [getDefaultVaccine()], selectedBatches: [getRecommendedBatch()] },
});

const selectSupplementalData = (supplementalData, isSupplementalDataValid) => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_SUPPLEMENTAL_DATA,
  payload: { supplementalData, isSupplementalDataValid },
});

const updateSupplementalData = (supplementalData, validator) => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.UPDATE_SUPPLEMENTAL_DATA,
  payload: { supplementalData, isSupplementalDataValid: validator(supplementalData) },
});

const selectVaccine = vaccine => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINE,
  payload: { vaccine, batch: getRecommendedBatch(vaccine) },
});

const selectBatch = itemBatch => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_BATCH,
  payload: { itemBatch },
});

const setBonusDose = toggle => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SET_BONUS_DOSE,
  payload: { toggle },
});

const setRefusal = hasRefused => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SET_REFUSAL,
  payload: {
    hasRefused,
    selectedVaccines: [getDefaultVaccine()],
    selectedBatches: [getRecommendedBatch()],
  },
});

const createPrescription = (
  patient,
  currentUser,
  selectedBatches,
  vaccinator,
  supplementalData
) => {
  UIDatabase.write(() => {
    const prescription = createRecord(
      UIDatabase,
      'CustomerInvoice',
      patient,
      currentUser,
      'dispensary',
      supplementalData
    );

    selectedBatches.forEach(itemBatch => {
      const { item } = itemBatch;
      const transactionItem = createRecord(UIDatabase, 'TransactionItem', prescription, item);
      createRecord(UIDatabase, 'TransactionBatch', transactionItem, itemBatch);
      transactionItem.setDoses(UIDatabase, 1);
      transactionItem.setVaccinator(UIDatabase, vaccinator);
    });
    prescription.finalise(UIDatabase);
  });
};

const createRefusalNameNote = name => {
  const [patientEvent] = UIDatabase.objects('PatientEvent').filtered('code == "RV"');

  if (!patientEvent) return;

  const id = generateUUID();
  const newNameNote = { id, name, patientEvent, entryDate: new Date() };

  UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
};

const createSupplementaryData = () => (dispatch, getState) => {
  // Create a supplementaryData object which is seeded with the data that was last
  // entered against a prescription
  const lastSupplementalData = selectLastSupplementalData();

  // Get the schema and perform initial validation
  const [supplementalDataSchema = {}] = selectSupplementalDataSchemas(getState());
  const { jsonSchema } = supplementalDataSchema;

  const isValid = validateJsonSchemaData(jsonSchema, lastSupplementalData);

  if (isValid) {
    dispatch(selectSupplementalData(lastSupplementalData, isValid));
  }
};

const confirm = () => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const hasRefused = selectHasRefused(getState());
  const hasBonusDoses = selectFoundBonusDose(getState());
  const patientID = selectEditingNameId(getState());
  const selectedBatches = selectSelectedBatches(getState());
  const vaccinator = selectSelectedVaccinator(getState());
  const supplementalData = selectSelectedSupplementalData(getState());

  if (hasBonusDoses) {
    UIDatabase.write(() => {
      const stocktake = createRecord(UIDatabase, 'Stocktake', currentUser, 'bonus_dose');
      const [selectedBatch] = selectedBatches;
      const stocktakeItem = createRecord(
        UIDatabase,
        'StocktakeItem',
        stocktake,
        selectedBatch?.item
      );
      const stocktakeBatch = createRecord(
        UIDatabase,
        'StocktakeBatch',
        stocktakeItem,
        selectedBatch
      );

      stocktakeBatch.setDoses(UIDatabase, stocktakeBatch?.itemBatch?.doses + 1);
      stocktake.comment = 'bonus_dose';
      stocktake.finalise(UIDatabase, currentUser);
    });
  }

  batch(() => {
    dispatch(NameActions.saveEditing());
    dispatch(NameNoteActions.saveEditing());
    dispatch(reset());
  });

  const patient = UIDatabase.get('Name', patientID);
  if (hasRefused) {
    createRefusalNameNote(patient);
  } else {
    createPrescription(patient, currentUser, selectedBatches, vaccinator, supplementalData);
  }
};

const selectVaccinator = vaccinator => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SELECT_VACCINATOR,
  payload: { vaccinator },
});

const cancel = () => goBack();

const confirmAndRepeat = () => dispatch =>
  batch(() => {
    dispatch(confirm());
    dispatch(goBack());
    dispatch(gotoVaccineDispensingPage());
  });

const toggleHistory = toggle => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.TOGGLE_HISTORY,
  payload: { toggle },
});

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  createSupplementaryData,
  reset,
  selectBatch,
  selectSupplementalData,
  selectVaccine,
  setRefusal,
  selectVaccinator,
  confirmAndRepeat,
  setBonusDose,
  toggleHistory,
  selectDefaultVaccine,
  updateSupplementalData,
};
