import Realm from 'realm';

export class NameNote extends Realm.Object {
  get data() {
    try {
      return JSON.parse(this._data);
    } catch {
      // swallow error, return a default
      return null;
    }
  }

  // Will throw if newValue is unable to be stringified
  set data(newValue) {
    this._data = JSON.stringify(newValue);
  }

  get patientEventID() {
    return this.patientEvent?.id;
  }

  toObject() {
    return {
      id: this.id,
      entryDate: this.entryDate?.getTime(),
      data: this.data,
      isDeleted: this.isDeleted,
      nameID: this.name?.id,
      note: this.note,
      patientEventID: this.patientEvent?.id,
      storeID: this.storeID,
    };
  }
}

NameNote.schema = {
  name: 'NameNote',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entryDate: { type: 'date', default: new Date() },
    _data: { type: 'string', optional: true },
    isDeleted: { type: 'bool', default: false },
    name: 'Name',
    note: { type: 'string', optional: true },
    patientEvent: 'PatientEvent',
    storeID: { type: 'string', default: '' },
  },
};

export default NameNote;
