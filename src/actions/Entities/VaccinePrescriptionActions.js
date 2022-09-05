import { generateUUID } from 'react-native-database';
import { batch } from 'react-redux';
import moment from 'moment';
import { UIDatabase, createRecord } from '../../database';
import {
  selectFoundBonusDose,
  selectHasRefused,
  selectRefusalReason,
  selectLastSupplementalData,
  selectSelectedBatches,
  selectSelectedSupplementalData,
  selectSelectedVaccinator,
} from '../../selectors/Entities/vaccinePrescription';
import { selectEditingNameId, selectEditingName } from '../../selectors/Entities/name';
import { NameActions } from './NameActions';
import { NameNoteActions } from './NameNoteActions';
import { goBack, gotoVaccineDispensingPage } from '../../navigation/actions';
import { selectSupplementalDataSchemas } from '../../selectors/formSchema';
import { validateJsonSchemaData } from '../../utilities/ajvValidator';
import { SETTINGS_KEYS } from '../../settings';

export const VACCINE_PRESCRIPTION_ACTIONS = {
  CREATE: 'VACCINE_PRESCRIPTION/create',
  SET_REFUSAL: 'VACCINE_PRESCRIPTION/setRefusal',
  SET_REFUSAL_REASON: 'VACCINE_PRESCRIPTION/setRefusalReason',
  RESET: 'VACCINE_PRESCRIPTION/reset',
  SELECT_VACCINE: 'VACCINE_PRESCRIPTION/selectVaccine',
  SELECT_SUPPLEMENTAL_DATA: 'VACCINE_PRESCRIPTION/selectSupplementalData',
  UPDATE_SUPPLEMENTAL_DATA: 'VACCINE_PRESCRIPTION/updateSupplementalData',
  SELECT_BATCH: 'VACCINE_PRESCRIPTION/selectBatch',
  SELECT_VACCINATOR: 'VACCINE_PRESCRIPTION/selectVaccinator',
  SET_BONUS_DOSE: 'VACCINE_PRESCRIPTION/setBonusDose',
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

const setRefusalReason = refusalReason => ({
  type: VACCINE_PRESCRIPTION_ACTIONS.SET_REFUSAL_REASON,
  payload: { refusalReason },
});

const createPrescription = (
  patient,
  currentUser,
  selectedBatches,
  vaccinator,
  supplementalData
) => {
  let prescription = {};

  UIDatabase.write(() => {
    prescription = createRecord(
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

  return prescription;
};

const createVaccinationNameNote = (
  patient,
  prescription,
  refused,
  bonusDose,
  vaccinator,
  selectedBatch,
  refusalReason
) => {
  const [patientEvent] = UIDatabase.objects('PatientEvent').filtered('code == "vaccination"');

  if (!patientEvent) return;

  const id = generateUUID();

  // Extract name notes from the patient before saving as this can get huuuge(!)
  const { nameNotes, ...patientObject } = patient.toJSON();
  const storeId = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_ID);
  const storeNameId = UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_NAME_ID);

  const data = {
    refused,
    bonusDose,
    itemName: selectedBatch?.itemName,
    itemCode: selectedBatch?.itemCode,
    batch: selectedBatch?.batch,
    expiry: selectedBatch?.expiryDate,
    vaccineDate: moment().format('DD/MM/YYYY'), // Duplicating entry date for ease of reporting
    vaccinator: vaccinator?.displayString,
    refusalReason,
    extra: {
      prescription: prescription?.toJSON(),
      vaccinator: vaccinator.toJSON(),
      patient: patientObject,
    },
    pcdNameNoteId: getPcdNameNoteID(patient.id),
    storeId,
    storeName: UIDatabase.objects('Name').filtered('id == $0', storeNameId)[0]?.name,
  };
  const newNameNote = {
    id,
    name: patient,
    patientEvent,
    entryDate: new Date(),
    _data: JSON.stringify(data),
    isDeleted: false,
  };
  UIDatabase.write(() => UIDatabase.create('NameNote', newNameNote));
};

const getPcdNameNoteID = patientId => {
  const patientNameNotes = UIDatabase.objects('NameNote')
    .filtered('patientEvent.code == $0 and name.id == $1', 'PCD', patientId)
    .sorted('entryDate', true);
  return patientNameNotes.length > 0 ? patientNameNotes[0].id : '';
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
  const refusalReason = selectRefusalReason(getState());
  const hasBonusDoses = selectFoundBonusDose(getState());
  const patientID = selectEditingNameId(getState());
  const selectedBatches = selectSelectedBatches(getState());
  const [selectedBatch] = selectedBatches;
  const vaccinator = selectSelectedVaccinator(getState());
  const supplementalData = selectSelectedSupplementalData(getState());

  if (hasBonusDoses) {
    UIDatabase.write(() => {
      const stocktake = createRecord(UIDatabase, 'Stocktake', currentUser, 'bonus_dose');

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
    const { isEditable = true } = selectEditingName(getState());

    // We are already not allowing patient update for patient that do not belong
    // to the current store. This check will stop unnecessary updates.
    if (isEditable) {
      dispatch(NameActions.saveEditing());
    }

    dispatch(NameNoteActions.saveEditing());
    dispatch(reset());
  });

  const patient = UIDatabase.get('Name', patientID);
  const prescription = createPrescription(
    patient,
    currentUser,
    selectedBatches,
    vaccinator,
    supplementalData
  );

  createVaccinationNameNote(
    patient,
    prescription,
    hasRefused,
    hasBonusDoses,
    vaccinator,
    selectedBatch,
    refusalReason
  );
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

const returnVaccineToStock = (patientID, transactionBatch) => (dispatch, getState) => {
  const { user } = getState();
  const { currentUser } = user;
  const { totalQuantity } = transactionBatch;
  const patient = UIDatabase.get('Name', patientID);

  UIDatabase.write(() => {
    const customerCredit = createRecord(
      UIDatabase,
      'CustomerCredit',
      currentUser,
      patient,
      -totalQuantity,
      'dispensary'
    );
    createRecord(UIDatabase, 'RefundLine', customerCredit, transactionBatch);
    customerCredit.finalise(UIDatabase);
  });
};

export const VaccinePrescriptionActions = {
  cancel,
  confirm,
  create,
  createSupplementaryData,
  reset,
  returnVaccineToStock,
  selectBatch,
  selectSupplementalData,
  selectVaccine,
  setRefusal,
  setRefusalReason,
  selectVaccinator,
  confirmAndRepeat,
  setBonusDose,
  selectDefaultVaccine,
  updateSupplementalData,
};
