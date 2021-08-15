export type CoreDatabaseType =
  | 'Abbreviation'
  | 'Address'
  | 'AdverseDrugReaction'
  | 'Currency'
  | 'Ethnicity'
  | 'FormSchema'
  | 'IndicatorAttribute'
  | 'IndicatorValue'
  | 'InsurancePolicy'
  | 'InsuranceProvider'
  | 'Item'
  | 'ItemBatch'
  | 'ItemCategory'
  | 'ItemDepartment'
  | 'ItemDirection'
  | 'ItemStoreJoin'
  | 'Location'
  | 'LocationMovement'
  | 'LocationType'
  | 'MasterList'
  | 'MasterListItem'
  | 'MasterListNameJoin'
  | 'MedicineAdministrator'
  | 'Message'
  | 'Name'
  | 'NameNote'
  | 'NameStoreJoin'
  | 'NameTag'
  | 'NameTagJoin'
  | 'Nationality'
  | 'NumberSequence'
  | 'NumberToReuse'
  | 'Occupation'
  | 'Options'
  | 'PatientEvent'
  | 'PaymentType'
  | 'Period'
  | 'PeriodSchedule'
  | 'Preference'
  | 'Prescriber'
  | 'ProgramIndicator'
  | 'Report'
  | 'Requisition'
  | 'RequisitionItem'
  | 'Sensor'
  | 'SensorLog'
  | 'Setting'
  | 'Stocktake'
  | 'StocktakeBatch'
  | 'StocktakeItem'
  | 'SyncOut'
  | 'TemperatureBreach'
  | 'TemperatureBreachConfiguration'
  | 'TemperatureLog'
  | 'Transaction'
  | 'TransactionBatch'
  | 'TransactionCategory'
  | 'TransactionItem'
  | 'Unit'
  | 'User'
  | 'VaccineVialMonitorStatus'
  | 'VaccineVialMonitorStatusLog';

export type RealmDatabaseType =
  | CoreDatabaseType
  | 'ADRForm'
  | 'ActiveLocation'
  | 'CashTransaction'
  | 'CashTransactionName'
  | 'CashTransactionReason'
  | 'Customer'
  | 'CustomerCredit'
  | 'CustomerInvoice'
  | 'CustomerTransaction'
  | 'ExternalSupplier'
  | 'InternalSupplier'
  | 'MedicineAdministrator'
  | 'NegativeAdjustmentReason'
  | 'OpenVialWastageReason'
  | 'PCDEvents'
  | 'Patient'
  | 'PatientSurveyForm'
  | 'Payment'
  | 'Policy'
  | 'PositiveAdjustmentReason'
  | 'Prescription'
  | 'PrescriptionCategory'
  | 'Provider'
  | 'Receipt'
  | 'RequestRequisition'
  | 'RequisitionReason'
  | 'ResponseRequisition'
  | 'Supplier'
  | 'SupplierCreditCategory'
  | 'SupplierInvoice'
  | 'SupplierTransaction'
  | 'Vaccine';
