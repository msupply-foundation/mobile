/* eslint-disable no-useless-catch */
/* eslint-disable camelcase */
import {
  EXTERNAL_TO_INTERNAL,
  NAME_TYPES,
  RECORD_TYPES,
  REQUISITION_STATUSES,
  REQUISITION_TYPES,
  SEQUENCE_KEYS,
  STATUSES,
  SYNC_TYPES,
  TRANSACTION_TYPES,
} from './syncTranslators';
import { CHANGE_TYPES } from '../database';
import {
  deleteRecord,
  getOrCreateAddress,
  parseBoolean,
  parseDate,
  parseNumber,
  parseJsonString,
} from '../database/utilities';
import { SETTINGS_KEYS } from '../settings';
import { validateReport } from '../utilities';

const { THIS_STORE_ID, THIS_STORE_TAGS, THIS_STORE_CODE } = SETTINGS_KEYS;

/**
 * Ensure the given record has the right data to create an internal record of the given
 * |recordType|. Check only that it is a recognised record type, and that it contains values
 * for all expected keys. Does not values (content of the record itself could be unexpected or
 * invalid, and would not be detected).
 *
 * @param   {string}  recordType  The internal record type this sync record should be used for.
 * @param   {object}  record      The data from the sync record.
 * @return  {boolean}             Whether the data is sufficient to create an internal record from.
 */
export const sanityCheckIncomingRecord = (recordType, record) => {
  if (!record.ID || record.ID.length < 1) return false; // Every record must have an ID.
  const requiredFields = {
    IndicatorAttribute: {
      canBeBlank: [
        'description',
        'index',
        'is_required',
        'value_type',
        'default_value',
        'axis',
        'is_active',
      ],
      cannotBeBlank: ['code', 'indicator_ID'],
    },
    IndicatorValue: {
      cannotBeBlank: ['facility_ID', 'period_ID', 'column_ID', 'row_ID'],
      canBeBlank: ['value'],
    },
    Item: {
      cannotBeBlank: ['code', 'item_name'],
      canBeBlank: ['default_pack_size', 'doses'],
    },
    ItemCategory: {
      cannotBeBlank: [],
      canBeBlank: ['Description'],
    },
    ItemDepartment: {
      cannotBeBlank: [],
      canBeBlank: ['department'],
    },
    ItemBatch: {
      cannotBeBlank: ['item_ID', 'quantity'],
      canBeBlank: [
        'pack_size',
        'batch',
        'expiry_date',
        'cost_price',
        'sell_price',
        'donor_id',
        'location_ID',
      ],
    },
    ItemStoreJoin: {
      cannotBeBlank: ['item_ID', 'store_ID'],
      canBeBlank: [],
    },
    LocalListItem: {
      cannotBeBlank: ['item_ID', 'list_master_name_join_ID'],
      canBeBlank: [],
    },
    MasterListNameJoin: {
      cannotBeBlank: ['name_ID', 'list_master_ID'],
      canBeBlank: ['description'],
    },
    MasterList: {
      cannotBeBlank: [],
      canBeBlank: ['description', 'programSettings', 'isProgram'],
    },
    MasterListItem: {
      cannotBeBlank: ['item_ID'],
      canBeBlank: [],
    },
    Name: {
      cannotBeBlank: ['type', 'customer', 'supplier', 'manufacturer'],
      canBeBlank: ['name', 'code'],
    },
    NameStoreJoin: {
      cannotBeBlank: ['name_ID', 'store_ID'],
      canBeBlank: ['name_ID', 'store_ID'],
    },
    NumberSequence: {
      cannotBeBlank: ['name', 'value'],
      canBeBlank: [],
    },
    NumberReuse: {
      cannotBeBlank: ['name', 'number_to_use'],
      canBeBlank: [],
    },
    Preference: {
      cannotBeBlank: ['ID', 'store_ID', 'item', 'data'],
      canBeBlank: ['user_ID', 'network_ID'],
    },
    Requisition: {
      cannotBeBlank: ['status', 'type', 'daysToSupply'],
      canBeBlank: ['date_entered', 'serial_number', 'requester_reference', 'programID', 'periodID'],
    },
    RequisitionItem: {
      cannotBeBlank: ['requisition_ID', 'item_ID'],
      canBeBlank: ['stock_on_hand', 'Cust_stock_order', 'optionID'],
    },
    Stocktake: {
      cannotBeBlank: ['status'],
      canBeBlank: ['Description', 'stock_take_created_date', 'serial_number', 'programID'],
    },
    StocktakeBatch: {
      cannotBeBlank: [
        'stock_take_ID',
        'item_line_ID',
        'item_ID',
        'snapshot_qty',
        'snapshot_packsize',
      ],
      canBeBlank: [
        'expiry',
        'Batch',
        'cost_price',
        'sell_price',
        'optionID',
        'vaccine_vial_monitor_status_ID',
        'location_id',
      ],
    },
    Store: {
      cannotBeBlank: [],
      canBeBlank: [],
    },
    Transaction: {
      cannotBeBlank: ['name_ID', 'type', 'status', 'store_ID'],
      canBeBlank: ['invoice_num', 'entry_date'],
    },
    TransactionCategory: {
      cannotBeBlank: [],
      canBeBlank: ['category', 'code', 'type'],
    },
    TransactionBatch: {
      cannotBeBlank: [
        'item_ID',
        'item_line_ID',
        'expiry_date',
        'quantity',
        'cost_price',
        'sell_price',
      ],
      canBeBlank: [
        'item_name',
        'batch',
        'expiry_date',
        'pack_size',
        'cost_price',
        'sell_price',
        'donor_id',
        'vaccine_vial_monitor_status_ID',
        'location_ID',
      ],
    },
    Options: {
      cannotBeBlank: ['title', 'type', 'isActive'],
      canBeBlank: [],
    },
    PeriodSchedule: {
      cannotBeBlank: ['name'],
      canBeBlank: [],
    },
    Period: {
      cannotBeBlank: ['name', 'startDate', 'endDate', 'periodScheduleID'],
      canBeBlank: [],
    },
    Prescriber: {
      cannotBeBlank: ['first_name', 'last_name', 'code'],
      canBeBlank: [],
    },
    Unit: {
      cannotBeBlank: [],
      canBeBlank: ['units', 'comment', 'order_number'],
    },
    ItemDirection: {
      cannotBeBlank: ['directions', 'priority', 'item_ID'],
      canBeBlank: [],
    },
    Abbreviation: {
      cannotBeBlank: ['abbreviation', 'expansion'],
      canBeBlank: [],
    },
    InsuranceProvider: {
      cannotBeBlank: ['providerName', 'isActive', 'prescriptionValidityDays'],
      canBeBlank: ['comment'],
    },
    InsurancePolicy: {
      cannotBeBlank: [
        'insuranceProviderID',
        'nameID',
        'isActive',
        'policyNumberFamily',
        'policyNumberPerson',
        'expiryDate',
        'discountRate',
      ],
      canBeBlank: ['type', 'policyNumberFull', 'enteredByID'],
    },
    Report: {
      cannotBeBlank: ['ID', 'title', 'type', 'json'],
      canBeBlank: [],
    },
    ProgramIndicator: {
      cannotBeBlank: ['code', 'program_ID', 'is_active'],
      canBeBlank: [],
    },
    PaymentType: {
      cannotBeBlank: ['code', 'description'],
      canBeBlank: [],
    },
    Currency: {
      cannotBeBlank: [],
      canBeBlank: [],
    },
    TemperatureLog: {
      cannotBeBlank: ['temperature', 'date', 'time', 'location_ID', 'store_ID', 'log_interval'],
      canBeBlank: ['temperature_breach_ID'],
    },
    TemperatureBreach: {
      cannotBeBlank: ['start_time', 'start_date', 'location_ID', 'sensor_ID', 'type'],
      canBeBlank: [
        'end_time',
        'end_date',
        'acknowledged',
        'threshold_duration',
        'threshold_maximum_temperature',
        'threshold_minimum_temperature',
      ],
    },
    LocationMovement: {
      cannotBeBlank: ['item_line_ID', 'enter_time', 'enter_date', 'location_ID'],
      canBeBlank: ['exit_time', 'exit_date'],
    },
    VaccineVialMonitorStatus: {
      cannotBeBlank: [],
      canBeBlank: ['description', 'code', 'level', 'is_active'],
    },
    VaccineVialMonitorStatusLog: {
      cannotBeBlank: ['status_ID', 'item_line_ID', 'time', 'date'],
      canBeBlank: [],
    },
    Location: { cannotBeBlank: [], canBeBlank: ['Description', 'code', 'type_ID'] },
    LocationType: { cannotBeBlank: [], canBeBlank: ['Description'] },
    Sensor: { cannotBeBlank: ['macAddress'], canBeBlank: ['batteryLevel', 'is_active', 'name'] },
    TemperatureBreachConfiguration: {
      cannotBeBlank: ['minimum_temperature', 'maximum_temperature', 'duration', 'type'],
      canBeBlank: ['description', 'colour'],
    },
    NameTag: {
      cannotBeBlank: ['ID'],
      canBeBlank: ['description'],
    },
    NameTagJoin: {
      cannotBeBlank: ['ID', 'name_ID', 'name_tag_ID'],
      canBeBlank: [],
    },
    Occupation: {
      cannotBeBlank: [],
      canBeBlank: ['name'],
    },
    Ethnicity: {
      cannotBeBlank: [],
      canBeBlank: ['name'],
    },
    Nationality: {
      cannotBeBlank: [],
      canBeBlank: ['description'],
    },
    NameNote: {
      cannotBeBlank: [],
      canBeBlank: [],
    },
    PatientEvent: {
      cannotBeBlank: [],
      canBeBlank: ['code', 'description', 'event_type', 'unit'],
    },
    FormSchema: {
      cannotBeBlank: [],
      canBeBlank: ['json_schema', 'ui_schema', 'type', 'version'],
    },
    MedicineAdministrator: {
      cannotBeBlank: [],
      canBeBlank: ['first_name', 'last_name', 'code'],
    },
  };

  if (!requiredFields[recordType]) return false; // Unsupported record type
  const hasAllNonBlankFields = requiredFields[recordType].cannotBeBlank.reduce(
    (containsAllFieldsSoFar, fieldName) =>
      containsAllFieldsSoFar &&
      record[fieldName] !== null && // Key must exist.
      record[fieldName] !== undefined && // Field may be undefined.
      record[fieldName].length > 0, // Field must not be empty string.
    true
  );

  if (!hasAllNonBlankFields) return false; // Return early if record invalid.
  const hasRequiredFields = requiredFields[recordType].canBeBlank.reduce(
    (containsAllFieldsSoFar, fieldName) =>
      containsAllFieldsSoFar &&
      record[fieldName] !== null && // Key must exist.
      record[fieldName] !== undefined, // Field may be undefined.
    hasAllNonBlankFields
  ); // Initialise |containsAllFieldsSoFar| as result from |hasAllNonBlankFields|.
  return hasRequiredFields;
};

/**
 * Update an existing record or create a new one based on the sync record.
 *
 * @param   {Realm}  database    The local database.
 * @param   {object} settings    Access to app settings.
 * @param   {string} recordType  Internal record type.
 * @param   {object} record      Data from sync representing the record.
 * @return  {none}
 */
export const createOrUpdateRecord = (database, settings, recordType, record) => {
  if (!sanityCheckIncomingRecord(recordType, record)) return;
  let internalRecord;

  switch (recordType) {
    case 'FormSchema': {
      database.update('FormSchema', {
        id: record.ID,
        _jsonSchema: record.json_schema,
        _uiSchema: record.ui_schema,
        version: Number(record.version),
        type: record.type,
      });
      break;
    }
    case 'IndicatorAttribute': {
      const indicator = database.getOrCreate('ProgramIndicator', record.indicator_ID);
      const indicatorAttribute = database.update(recordType, {
        id: record.ID,
        indicator,
        description: record.description,
        code: record.code,
        index: parseNumber(record.index),
        isRequired: parseBoolean(record?.is_required ?? false),
        valueType: record.value_type,
        defaultValue: record.default_value,
        axis: record.axis,
        isActive: parseBoolean(record?.is_active ?? false),
      });
      indicator.addIndicatorAttributeIfUnique(indicatorAttribute);
      break;
    }
    case 'InsuranceProvider': {
      database.update(recordType, {
        id: record.ID,
        name: record.providerName,
        comment: record?.comment,
        validityDays: parseNumber(record?.prescriptionValidityDays || 0),
        isActive: parseBoolean(record?.isActive || false),
      });
      return;
    }
    case 'Currency': {
      database.update(recordType, {
        id: record.ID,
        rate: parseNumber(record.rate),
        description: record.currency,
        isDefaultCurrency: parseBoolean(record.is_home_currency ?? false),
        lastUpdate: parseDate(record.date_updated) ?? new Date(),
      });
      return;
    }
    case 'InsurancePolicy': {
      database.update(recordType, {
        id: record.ID,
        policyNumberFamily: record.policyNumberFamily,
        policyNumberPerson: record.policyNumberPerson,
        type: record.type,
        discountRate: parseNumber(record.discountRate),
        expiryDate: parseDate(record.expiryDate),
        enteredBy: database.getOrCreate('User', record.enteredByID),
        patient: database.getOrCreate('Name', record.nameID),
        insuranceProvider: database.getOrCreate('InsuranceProvider', record.insuranceProviderID),
        isActive: parseBoolean(record.isActive),
      });
      break;
    }
    case 'IndicatorValue': {
      const indicatorColumn = database.getOrCreate('IndicatorAttribute', record.column_ID);
      const indicatorRow = database.getOrCreate('IndicatorAttribute', record.row_ID);
      const indicatorValue = database.update(recordType, {
        id: record.ID,
        storeId: record.facility_ID,
        period: database.getOrCreate('Period', record.period_ID),
        column: indicatorColumn,
        row: indicatorRow,
        _value: record.value ?? '',
      });
      indicatorRow.addIndicatorValue(indicatorValue);
      indicatorColumn.addIndicatorValue(indicatorValue);
      break;
    }
    case 'Item': {
      internalRecord = {
        id: record.ID,
        category: database.getOrCreate('ItemCategory', record.category_ID),
        code: record.code,
        defaultPackSize: 1, // Every item batch in mobile should be pack-to-one
        department: database.getOrCreate('ItemDepartment', record.department_ID),
        description: record.description,
        name: record.item_name,
        crossReferenceItem: database.getOrCreate('Item', record.cross_ref_item_ID),
        unit: database.getOrCreate('Unit', record.unit_ID),
        doses: parseNumber(record.doses),
        isVaccine: parseBoolean(record.is_vaccine),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'ItemCategory': {
      internalRecord = {
        id: record.ID,
        name: record.Description,
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'ItemDepartment': {
      internalRecord = {
        id: record.ID,
        name: record.department,
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'ItemBatch': {
      // Not for this store
      if (record.store_ID !== settings.get(THIS_STORE_ID)) break;
      const item = database.getOrCreate('Item', record.item_ID);
      const packSize = parseNumber(record.pack_size);
      internalRecord = {
        id: record.ID,
        item,
        packSize: 1, // Every item batch in mobile should be pack-to-one.
        numberOfPacks: parseNumber(record.quantity) * packSize,
        expiryDate: parseDate(record.expiry_date),
        batch: record.batch,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        supplier: database.getOrCreate('Name', record.name_ID),
        donor: database.getOrCreate('Name', record.donor_ID),
        location: database.getOrCreate('Location', record.location_ID),
      };
      const itemBatch = database.update(recordType, internalRecord);
      item.addBatchIfUnique(itemBatch);
      database.save('Item', item);
      break;
    }
    case 'ItemStoreJoin': {
      const joinsThisStore = record.store_ID === settings.get(THIS_STORE_ID);
      internalRecord = {
        id: record.ID,
        itemId: record.item_ID,
        joinsThisStore,
      };
      database.update(recordType, internalRecord);
      if (joinsThisStore) {
        // If it joins this store, set the item's visibility.
        const item = database.getOrCreate('Item', record.item_ID);
        item.isVisible = !parseBoolean(record.inactive);
        item.defaultPrice = parseNumber(record.default_price);
        database.save('Item', item);
      }
      break;
    }
    // 'LocalListItem' is not a class defined in the app's realm. The structure from mSupply
    // will be replaced by storing equivalent infomation in a MasterList. 'LocalListItem'
    // objects will be mapped to 'MasterListItem' in sync.
    case 'LocalListItem': {
      const item = database.getOrCreate('Item', record.item_ID);
      // Get masterList by 'list_master_name_join_ID' as the join's id is used in mobile
      // to mimic the local list join with a MasterList.
      const masterList = database.getOrCreate('MasterList', record.list_master_name_join_ID);

      internalRecord = {
        id: record.ID,
        item,
        imprestQuantity: parseNumber(record.imprest_quantity),
        masterList,
      };
      const localListItem = database.update('MasterListItem', internalRecord);
      masterList.addItemIfUnique(localListItem);
      break;
    }
    case 'MasterListNameJoin': {
      const name = database.getOrCreate('Name', record.name_ID);
      let masterList;
      if (!record.list_master_ID) {
        // mSupply 'list_local_line' do not have a 'list_master_ID', map the join to a 'MasterList'
        masterList = database.getOrCreate('MasterList', record.ID);
        masterList.name = record.description;
        database.save('MasterList', masterList);
      } else {
        // Regular 'MasterListNameJoin'.
        masterList = database.getOrCreate('MasterList', record.list_master_ID);
        internalRecord = {
          id: record.ID,
          name,
          masterList,
        };
        database.update(recordType, internalRecord);
      }

      name.addMasterListIfUnique(masterList);
      database.save('Name', name);
      break;
    }
    case 'MasterList': {
      internalRecord = {
        id: record.ID,
        name: record.description,
        note: record.note,
        isProgram: parseBoolean(record.isProgram),
        programSettings: parseJsonString(record.programSettings),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'MasterListItem': {
      const masterList = database.getOrCreate('MasterList', record.item_master_ID);
      internalRecord = {
        id: record.ID,
        item: database.getOrCreate('Item', record.item_ID),
        imprestQuantity: parseNumber(record.imprest_quan),
        price: parseNumber(record.price),
        masterList,
      };
      const masterListItem = database.update(recordType, internalRecord);
      masterList.addItemIfUnique(masterListItem);
      break;
    }
    case 'Name': {
      const isPatient = record.type === 'patient';
      const thisStoresPatient = record.supplying_store_id === settings.get(THIS_STORE_ID);

      const {
        bill_address1: line1,
        bill_address2: line2,
        bill_address3: line3,
        bill_address4: line4,
        bill_postal_zip_code: zipCode,
      } = record;

      const billingAddress = getOrCreateAddress(database, { line1, line2, line3, line4, zipCode });

      internalRecord = {
        id: record.ID,
        name: record.name,
        barcode: record.barcode,
        code: record.code,
        phoneNumber: record.phone,
        billingAddress,
        emailAddress: record.email,
        type: NAME_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        isCustomer: parseBoolean(record.customer),
        isDeceased: parseBoolean(record.isDeceased),
        isSupplier: parseBoolean(record.supplier),
        isManufacturer: parseBoolean(record.manufacturer),
        supplyingStoreId: record.supplying_store_id,
        thisStoresPatient,
        isPatient,
        firstName: record.first,
        middleName: record.middle,
        lastName: record.last,
        dateOfBirth: parseDate(record.date_of_birth),
        nationality: database.getOrCreate('Nationality', record.nationality_ID),
        occupation: database.getOrCreate('Occupation', record.occupation_ID),
        ethnicity: database.getOrCreate('Ethnicity', record.ethnicity_ID),
        createdDate: parseDate(record.created_date),
        female: parseBoolean(record.female),
      };

      if (isPatient) internalRecord.isVisible = true;

      database.update(recordType, internalRecord);
      break;
    }
    case 'NameTag': {
      internalRecord = { id: record.ID, description: record.description };
      database.update(recordType, internalRecord);
      break;
    }
    case 'NameTagJoin': {
      internalRecord = {
        id: record.ID,
        name: database.getOrCreate('Name', record.name_ID),
        nameTag: database.getOrCreate('NameTag', record.name_tag_ID),
      };

      database.update(recordType, internalRecord);
      break;
    }
    case 'NameStoreJoin': {
      const joinsThisStore = record.store_ID === settings.get(THIS_STORE_ID);
      internalRecord = {
        id: record.ID,
        nameId: record.name_ID,
        joinsThisStore,
      };
      database.update(recordType, internalRecord);
      if (joinsThisStore) {
        // If it joins this store, set the name's visibility.
        const name = database.getOrCreate('Name', record.name_ID);
        name.isVisible = !parseBoolean(record.inactive);
        database.save('Name', name);
      }
      break;
    }
    case 'NumberSequence': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(record.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      // Don't accept updates to number sequences.
      if (
        database.objects('NumberSequence').filtered('sequenceKey == $0', sequenceKey).length > 0
      ) {
        break;
      }
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store.
      internalRecord = {
        id: record.ID,
        sequenceKey,
        highestNumberUsed: parseNumber(record.value),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'NumberToReuse': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(record.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store.
      const numberSequence = database.getOrCreate('NumberSequence', sequenceKey, 'sequenceKey');
      internalRecord = {
        id: record.ID,
        numberSequence,
        number: parseNumber(record.number_to_use),
      };
      const numberToReuse = database.update(recordType, internalRecord);
      // Attach the number to reuse to the number sequence.
      numberSequence.addNumberToReuse(numberToReuse);
      break;
    }
    case 'Preference': {
      const { item, data: recordData } = record;
      if (item === 'store_preferences') {
        try {
          const parsedData = JSON.parse(recordData);
          Object.entries(parsedData).forEach(([id, value]) => {
            const data = JSON.stringify(value ?? {});
            internalRecord = { id, data };
            database.update(recordType, internalRecord);
          });
        } catch (error) {
          // Silently ignore malformed prefs.
        }
      }
      break;
    }
    case 'Report': {
      const { ID: id, title, type, json } = record;
      try {
        const parsedData = JSON.parse(json);
        if (validateReport(parsedData, type)) {
          internalRecord = {
            id,
            title,
            type,
            _data: JSON.stringify(parsedData.data),
          };
          database.update(recordType, internalRecord);
        }
      } catch (error) {
        // Throw to parent, for now
        throw error;
      }
      break;
    }
    case 'Requisition': {
      let status = REQUISITION_STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL);
      let period;
      // If not a special 'wp' or 'wf' status, use the normal status translation.
      if (!status) {
        status = STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL);
      }
      if (record.periodID) {
        period = database.getOrCreate('Period', record.periodID);
      }

      internalRecord = {
        id: record.ID,
        status: REQUISITION_STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        entryDate: parseDate(record.date_entered),
        daysToSupply: parseNumber(record.daysToSupply),
        serialNumber: record.serial_number,
        requesterReference: record.requester_reference,
        comment: record.comment,
        enteredBy: database.getOrCreate('User', record.user_ID),
        type: REQUISITION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        otherStoreName: database.getOrCreate('Name', record.name_ID),
        thresholdMOS: parseNumber(record.thresholdMOS),
        program: database.getOrCreate('MasterList', record.programID),
        period,
        orderType: record.orderType,
        customData: parseJsonString(record.custom_data),
        isRemoteOrder: parseBoolean(record.isRemoteOrder),
        createdDate: parseDate(record.date_order_received),
      };
      const requisition = database.update(recordType, internalRecord);
      if (period) period.addRequisitionIfUnique(requisition);
      break;
    }
    case 'RequisitionItem': {
      const requisition = database.getOrCreate('Requisition', record.requisition_ID);
      internalRecord = {
        id: record.ID,
        requisition,
        item: database.getOrCreate('Item', record.item_ID),
        stockOnHand: parseNumber(record.stock_on_hand),
        dailyUsage: parseNumber(record.daily_usage),
        requiredQuantity: parseNumber(record.Cust_stock_order),
        suppliedQuantity: parseNumber(record.actualQuan),
        comment: record.comment,
        sortIndex: parseNumber(record.line_number),
        openingStock: parseNumber(record.Cust_prev_stock_balance),
        negativeAdjustments: parseNumber(record.stockLosses),
        positiveAdjustments: parseNumber(record.stockAdditions),
        incomingStock: parseNumber(record.Cust_stock_received),
        outgoingStock: parseNumber(record.Cust_stock_issued),
        daysOutOfStock: parseNumber(record.DOSforAMCadjustment),
      };
      const requisitionItem = database.update(recordType, internalRecord);
      // requisitionItem will be an orphan record if it's not unique?
      requisition.addItemIfUnique(requisitionItem);
      database.save('Requisition', requisition);
      break;
    }
    case 'Stocktake': {
      internalRecord = {
        id: record.ID,
        name: record.Description,
        createdDate: parseDate(record.stock_take_created_date),
        stocktakeDate: parseDate(record.stock_take_date, record.stock_take_time),
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        createdBy: database.getOrCreate('User', record.created_by_ID),
        finalisedBy: database.getOrCreate('User', record.finalised_by_ID),
        comment: record.comment,
        serialNumber: record.serial_number,
        additions: database.getOrCreate('Transaction', record.invad_additions_ID),
        reductions: database.getOrCreate('Transaction', record.invad_reductions_ID),
        program: database.getOrCreate('MasterList', record.programID),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'StocktakeBatch': {
      const stocktake = database.getOrCreate('Stocktake', record.stock_take_ID);
      const packSize = parseNumber(record.snapshot_packsize);
      const itemBatch = database.getOrCreate('ItemBatch', record.item_line_ID);
      const item = database.getOrCreate('Item', record.item_ID);
      itemBatch.item = item;
      item.addBatchIfUnique(itemBatch);
      internalRecord = {
        id: record.ID,
        stocktake,
        itemBatch,
        snapshotNumberOfPacks: parseNumber(record.snapshot_qty) * packSize,
        packSize: 1, // Pack to one all mobile data
        expiryDate: parseDate(record.expiry),
        batch: record.Batch,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        countedNumberOfPacks: parseNumber(record.stock_take_qty) * packSize,
        sortIndex: parseNumber(record.line_number),
        option: database.getOrCreate('Options', record.optionID),
        location: database.getOrCreate('Location', record.location_id),
        vaccineVialMonitorStatus: database.getOrCreate(
          'VaccineVialMonitorStatus',
          record.vaccine_vial_monitor_status_ID
        ),
      };
      const stocktakeBatch = database.update(recordType, internalRecord);
      stocktake.addBatchIfUnique(database, stocktakeBatch);
      database.save('Stocktake', stocktake);
      break;
    }
    case 'Store': {
      const { tags, code } = record;
      if (settings.get(THIS_STORE_ID) === record.ID) {
        database.update('Setting', { key: THIS_STORE_TAGS, value: tags });
        database.update('Setting', { key: THIS_STORE_CODE, value: code });
      }
      break;
    }
    case 'Transaction': {
      if (record.store_ID !== settings.get(THIS_STORE_ID)) break; // Not for this store
      const otherParty = database.getOrCreate('Name', record.name_ID);
      const enteredBy = database.getOrCreate('User', record.user_ID);
      const linkedRequisition = record.requisition_ID
        ? database.getOrCreate('Requisition', record.requisition_ID)
        : null;
      const insurancePolicy = record.nameInsuranceJoin?.id
        ? database.getOrCreate('InsurancePolicy', record.nameInsuranceJoin.id)
        : null;
      const linkedTransaction = record.linked_transaction_id
        ? database.getOrCreate('Transaction', record.linked_transaction_id)
        : null;
      const category = database.getOrCreate('TransactionCategory', record.category_ID);

      internalRecord = {
        id: record.ID,
        serialNumber: record.invoice_num,
        otherParty,
        comment: record.comment,
        customData: parseJsonString(record.custom_data),
        entryDate: parseDate(record.entry_date),
        type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        confirmDate: parseDate(record.confirm_date),
        enteredBy,
        theirRef: record.their_ref,
        category,
        mode: record.mode,
        prescriber: database.getOrCreate('Prescriber', record.prescriber_ID),
        linkedRequisition,
        subtotal: parseFloat(record.subtotal),
        outstanding: parseFloat(record.total),
        insurancePolicy,
        option: database.getOrCreate('Options', record.optionID),
        linkedTransaction,
        user1: record.user1,
        insuranceDiscountAmount: parseFloat(record.insuranceDiscountAmount),
        insuranceDiscountRate: parseFloat(record.insuranceDiscountRate),
        paymentType: database.getOrCreate('PaymentType', record.paymentTypeID),
        isCancellation: parseBoolean(record.is_cancellation),
      };
      const transaction = database.update(recordType, internalRecord);
      if (linkedRequisition) {
        database.update('Requisition', {
          id: linkedRequisition.id,
          linkedTransaction: transaction,
        });
      }
      break;
    }
    case 'TransactionCategory': {
      internalRecord = {
        id: record.ID,
        name: record.category,
        code: record.code,
        type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'TransactionBatch': {
      const transaction = database.getOrCreate('Transaction', record.transaction_ID);
      const itemBatch = database.getOrCreate('ItemBatch', record.item_line_ID);
      const item = database.getOrCreate('Item', record.item_ID);
      const donor = database.getOrCreate('Name', record.donor_id);
      itemBatch.item = item;
      itemBatch.donor = donor;
      item.addBatchIfUnique(itemBatch);
      const packSize = parseNumber(record.pack_size);
      internalRecord = {
        id: record.ID,
        itemId: record.item_ID,
        itemName: record.item_name,
        itemBatch,
        packSize: 1, // Pack to one all mobile data.
        numberOfPacks: parseNumber(record.quantity) * packSize,
        numberOfPacksSent: parseNumber(record.quantity) * packSize,
        transaction,
        note: record.note,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        donor,
        sortIndex: parseNumber(record.line_number),
        expiryDate: parseDate(record.expiry_date),
        batch: record.batch,
        type: record.type,
        location: database.getOrCreate('Location', record.location_ID),
        vaccineVialMonitorStatus: database.getOrCreate(
          'VaccineVialMonitorStatus',
          record.vaccine_vial_monitor_status_ID
        ),
        sentPackSize: parseNumber(record.sent_pack_size) || packSize,
        medicineAdministrator: database.getOrCreate(
          'MedicineAdministrator',
          record.medicine_administrator_ID
        ),
      };
      const transactionBatch = database.update(recordType, internalRecord);
      transaction.addBatchIfUnique(database, transactionBatch);
      database.save('Transaction', transaction);
      itemBatch.addTransactionBatchIfUnique(transactionBatch);
      database.save('ItemBatch', itemBatch);
      break;
    }
    case 'Period': {
      const period = database.update(recordType, {
        id: record.ID,
        startDate: record.startDate ? parseDate(record.startDate) : new Date(),
        endDate: record.endDate ? parseDate(record.endDate) : new Date(),
        name: record.name,
        periodSchedule: database.getOrCreate('PeriodSchedule', record.periodScheduleID),
      });
      period.periodSchedule.addPeriodIfUnique(period);
      break;
    }
    case 'PeriodSchedule': {
      database.update(recordType, {
        id: record.ID,
        name: record.name,
      });
      break;
    }
    case 'ProgramIndicator': {
      const indicator = database.update(recordType, {
        id: record.ID,
        code: record.code,
        program: database.getOrCreate('MasterList', record.program_ID),
        isActive: parseBoolean(record.is_active),
      });
      indicator.program.addIndicatorIfUnique(indicator);
      break;
    }
    case 'Options': {
      database.update(recordType, {
        id: record.ID,
        title: record.title,
        type: record.type,
        isActive: parseBoolean(record.isActive),
      });
      break;
    }
    case 'Unit': {
      database.update(recordType, {
        id: record.ID,
        units: record.units,
        orderNumber: parseNumber(record.order_number),
        comment: record.comment,
      });
      break;
    }
    case 'Prescriber': {
      const fromThisStore = record.store_ID === settings.get(THIS_STORE_ID);

      const { address1: line1, address2: line2 } = record;
      const address = getOrCreateAddress(database, { line1, line2 });

      database.update(recordType, {
        id: record.ID,
        firstName: record.first_name,
        lastName: record.last_name,
        registrationCode: record.registration_code,
        address,
        isVisible: true,
        isActive: true,
        phoneNumber: record.phone,
        mobileNumber: record.mobile,
        emailAddress: record.email,
        fromThisStore,
      });
      break;
    }
    case 'Abbreviation': {
      database.update(recordType, {
        id: record.ID,
        expansion: record.expansion,
        abbreviation: record.abbreviation,
      });
      break;
    }
    case 'ItemDirection': {
      const item = database.getOrCreate('Item', record.item_ID);
      database.update(recordType, {
        id: record.ID,
        item,
        priority: Number(record.priority),
        directions: record.directions,
      });
      break;
    }
    case 'PaymentType': {
      database.update(recordType, {
        id: record.ID,
        code: record.code,
        description: record.description,
      });
      break;
    }
    case 'TemperatureLog': {
      database.update(recordType, {
        id: record.ID,
        temperature: parseNumber(record.temperature),
        timestamp: parseDate(record.date, record.time),
        location: database.getOrCreate('Location', record.location_ID),
        breach: database.getOrCreate('TemperatureBreach', record.temperature_breach_ID),
        logInterval: parseNumber(record.log_interval),
        sensor: database.getOrCreate('Sensor', record.sensor_ID),
      });
      break;
    }
    case 'TemperatureBreach': {
      const sensor = database.getOrCreate('Sensor', record.sensor_ID);
      database.update(recordType, {
        id: record.ID,
        startTimestamp: parseDate(record.start_date, record.start_time),
        endTimestamp: parseDate(record.end_date, record.end_time),
        location: database.getOrCreate('Location', record.location_ID),
        type: record.type,
        acknowledged: parseBoolean(record.acknowledged),
        thresholdMaxTemperature: parseNumber(record.threshold_maximum_temperature),
        thresholdMinTemperature: parseNumber(record.threshold_minimum_temperature),
        thresholdDuration: parseNumber(record.threshold_duration),
        sensor,
      });
      break;
    }
    case 'TemperatureBreachConfiguration': {
      const location = database.getOrCreate('Location', record.location_ID);
      database.update(recordType, {
        id: record.ID,
        minimumTemperature: parseNumber(record.minimum_temperature),
        maximumTemperature: parseNumber(record.maximum_temperature),
        duration: parseNumber(record.duration),
        description: record.description,
        colour: record.colour,
        type: record.type,
        location,
      });
      break;
    }
    case 'LocationMovement': {
      database.update(recordType, {
        id: record.ID,
        location: database.getOrCreate('Location', record.location_ID),
        itemBatch: database.getOrCreate('ItemBatch', record.item_line_ID),
        enterTimestamp: parseDate(record.enter_date, record.enter_time),
        exitTimestamp: parseDate(record.exit_date, record.exit_time),
      });
      break;
    }
    case 'VaccineVialMonitorStatus': {
      database.update(recordType, {
        id: record.ID,
        description: record.description,
        code: record.code,
        level: parseNumber(record.level),
        isActive: parseBoolean(record.is_active),
      });
      break;
    }
    case 'VaccineVialMonitorStatusLog': {
      database.update(recordType, {
        id: record.ID,
        status: database.getOrCreate(
          'VaccineVialMonitorStatus',
          record.vaccine_vial_monitor_status_ID
        ),
        timestamp: parseDate(record.date, record.time),
        itemBatch: database.getOrCreate('ItemBatch', record.item_line_ID),
      });
      break;
    }
    case 'Location': {
      database.update(recordType, {
        id: record.ID,
        description: record.Description,
        code: record.code,
        locationType: database.getOrCreate('LocationType', record.type_ID),
        hold: parseBoolean(record.hold),
      });
      break;
    }
    case 'LocationType': {
      database.update(recordType, {
        id: record.ID,
        description: record.Description,
      });
      break;
    }
    case 'Sensor': {
      database.update(recordType, {
        id: record.ID,
        macAddress: record.macAddress,
        location: database.getOrCreate('Location', record.locationID),
        batteryLevel: parseNumber(record.batteryLevel),
        name: record.name,
        isActive: parseBoolean(record.is_active),
        logInterval: parseNumber(record.logInterval),
        logDelay: parseDate(record.log_delay_date, record.log_delay_time) ?? new Date(0),
        programmedDate: parseDate(record.programmed_date, record.programmed_time) ?? new Date(),
      });
      break;
    }
    case 'Nationality': {
      database.update('Nationality', {
        id: record.ID,
        description: record.description,
      });
      break;
    }
    case 'Occupation': {
      database.update('Occupation', {
        id: record.ID,
        name: record.name,
      });
      break;
    }
    case 'Ethnicity': {
      database.update('Ethnicity', {
        id: record.ID,
        name: record.name,
      });
      break;
    }
    case 'NameNote': {
      database.update('NameNote', {
        id: record.ID,
        patientEvent: database.getOrCreate('PatientEvent', record.patient_event_ID),
        entryDate: parseDate(record.entry_date),
        _data: record.data,
        name: database.getOrCreate('Name', record.name_ID),
        note: record.note,
      });
      break;
    }
    case 'PatientEvent': {
      database.update('PatientEvent', {
        id: record.ID,
        code: record.code,
        description: record.description,
        eventType: record.event_type,
        unit: record.unit,
      });
      break;
    }
    case 'MedicineAdministrator': {
      database.update('MedicineAdministrator', {
        id: record.ID,
        firstName: record.first_name,
        lastName: record.last_name,
        code: record.code,
        isActive: parseBoolean(record.is_active),
      });
      break;
    }
    default:
      break; // Silently ignore record types which are not used by mobile.
  }
};

/**
 * Take the data from a sync record, and integrate it into the local database as
 * the given |recordType|. If create or update and the id matches, will update an
 * existing record, otherwise create a new one if not. If delete, clean up/delete.
 *
 * @param   {Realm}   database    The local database.
 * @param   {object}  settings    Access to app settings.
 * @param   {string}  syncType    The type of change that created this sync record.
 * @param   {object}  syncRecord  Data representing the sync record.
 * @return  {none}
 */

export const integrateRecord = (database, settings, syncRecord) => {
  // Ignore sync record if missing data, record type, sync type, or record ID.

  if (!syncRecord.RecordType || !syncRecord.SyncType) return;

  const syncType = syncRecord.SyncType;
  const recordType = syncRecord.RecordType;
  const changeType = SYNC_TYPES.translate(syncType, EXTERNAL_TO_INTERNAL);
  const internalRecordType = RECORD_TYPES.translate(recordType, EXTERNAL_TO_INTERNAL);

  // If there is no translation available, then the app does not handle the record type.
  // Shortcut return here and silently ignore it.
  if (!internalRecordType) return;

  switch (changeType) {
    case CHANGE_TYPES.CREATE:
    case CHANGE_TYPES.UPDATE:
      if (!syncRecord.data) return; // Ignore if missing data.
      createOrUpdateRecord(database, settings, internalRecordType, syncRecord.data);
      break;
    case CHANGE_TYPES.DELETE:
      if (!syncRecord.RecordID) return; // Ignore if missing record id.
      deleteRecord(database, internalRecordType, syncRecord.RecordID);
      break;
    case 'merge':
      mergeRecords(database, settings, internalRecordType, syncRecord);
      break;
    default:
    // Handle unexpected |changeType|.
  }
};

// Translations for merge logic.
// TODO: bind translations to |DataType| constants to avoid breakage on schema update.
const RECORD_TYPE_TO_TABLE = {
  Item: {
    StocktakeItem: {
      field: 'item',
    },
    TransactionItem: {
      field: 'item',
    },
    ItemBatch: {
      field: 'item',
    },
    RequisitionItem: {
      field: 'item',
    },
  },
  Name: {
    AdverseDrugReaction: {
      field: 'name',
    },
    ItemBatch: {
      field: 'supplier',
    },
    NameNote: {
      field: 'name',
    },
    NameTagJoin: {
      field: 'name',
    },
    Transaction: {
      field: 'otherParty',
      setterMethod: 'setOtherParty',
    },
    Requisition: {
      field: 'otherStoreName',
    },
  },
  Prescriber: {
    Transaction: {
      field: 'prescriber',
    },
  },
};

const RECORD_TYPE_TO_MASTERLIST = {
  Item: {
    MasterListItem: {
      field: 'item',
    },
  },
  Name: {
    MasterListNameJoin: {
      field: 'name',
    },
  },
};

/**
 * Merge two existing records. One record is retained and the other is merged. After the objects
 * are merged, the merged object is deleted from the database. The merge operation updates the
 * fields of the retained record to reference the same data as the merged object.
 *
 * @param  {Realm}   database            Local database.
 * @param  {Object}  settings            Local settings.
 * @param  {string}  internalRecordType  Internal record type for merge operation.
 * @param  {Object}  syncRecord          Data representing the sync record.
 */
export const mergeRecords = (database, settings, internalRecordType, syncRecord) => {
  const recordToKeep = database
    .objects(internalRecordType)
    .filtered('id == $0', syncRecord.mergeIDtokeep)[0];
  const recordToMerge = database
    .objects(internalRecordType)
    .filtered('id == $0', syncRecord.mergeIDtodelete)[0];
  const recordsExist = recordToKeep && recordToMerge;
  if (!recordsExist) return;
  const tablesToUpdate = RECORD_TYPE_TO_TABLE[internalRecordType];
  // TODO: log to bugsnag if merging not implemented for a certain |recordType|.
  if (!tablesToUpdate) return;

  Object.entries(tablesToUpdate).forEach(
    ([tableToUpdate, { field: fieldToUpdate, setterMethod: fieldSetter }]) => {
      const recordsToUpdate = database
        .objects(tableToUpdate)
        .filtered(`${fieldToUpdate}.id == $0`, recordToMerge.id)
        .snapshot();
      recordsToUpdate.forEach(record => {
        if (record) {
          if (typeof record[fieldSetter] === typeof Function) {
            record[fieldSetter](recordToKeep);
          } else {
            record[fieldToUpdate] = recordToKeep;
          }
        }
      });
    }
  );

  if (RECORD_TYPE_TO_MASTERLIST[internalRecordType]) {
    const [[tableToUpdate, { field: fieldToUpdate }]] = Object.entries(
      RECORD_TYPE_TO_MASTERLIST[internalRecordType]
    );

    database
      .objects(tableToUpdate)
      .filtered(`${fieldToUpdate}.id == $0`, recordToMerge.id)
      .snapshot()
      .forEach(joinRecord => {
        const duplicateJoinRecord = database
          .objects(tableToUpdate)
          .filtered(
            `(${fieldToUpdate}.id == $0) && (masterList.id == $0)`,
            recordToKeep.id,
            joinRecord.masterList.id
          )[0];
        if (duplicateJoinRecord) {
          deleteRecord(database, tableToUpdate, joinRecord.id);
        } else {
          joinRecord[fieldToUpdate] = recordToKeep;
          createOrUpdateRecord(database, settings, tableToUpdate, joinRecord);
        }
      });
  }

  switch (internalRecordType) {
    case 'Item':
      recordToMerge.batches.forEach(batch => recordToKeep.addBatchIfUnique(batch));
      database
        .objects('TransactionBatch')
        .filtered('itemId == $0', recordToMerge.id)
        .snapshot()
        .forEach(batch => {
          batch.itemId = recordToKeep.id;
        });

      // createOrUpdateRecord(database, settings, 'TransactionBatch', batch);
      break;
    case 'Name':
      recordToMerge.masterLists.forEach(masterList =>
        recordToKeep.addMasterListIfUnique(masterList)
      );
      break;
    default:
      break;
  }

  recordToKeep.isVisible = recordToKeep.isVisible || recordToMerge.isVisible;

  deleteRecord(database, internalRecordType, recordToMerge.id);
};
