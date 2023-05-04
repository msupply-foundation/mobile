import Realm from 'realm';

export class InsurancePolicy extends Realm.Object {
  get policyNumber() {
    if (!this.policyNumberPerson) return this.policyNumberFamily;
    return `${this.policyNumberFamily}-${this.policyNumberPerson}`;
  }
}

InsurancePolicy.schema = {
  name: 'InsurancePolicy',
  primaryKey: 'id',
  properties: {
    id: 'string',
    policyNumberFamily: 'string',
    policyNumberPerson: 'string',
    type: 'string',
    discountRate: 'double',
    isActive: { type: 'bool', default: true },
    expiryDate: 'date',
    enteredBy: { type: 'User', optional: true },
    patient: { type: 'Name', optional: true },
    insuranceProvider: { type: 'InsuranceProvider', optional: true },
  },
};

export default InsurancePolicy;
