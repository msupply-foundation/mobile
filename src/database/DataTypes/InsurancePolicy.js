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
    policyNumberFamily: { type: 'string', optional: true },
    policyNumberPerson: { type: 'string', optional: true },
    type: { type: 'string', optional: true },
    discountRate: { type: 'double', optional: true },
    isActive: { type: 'bool', default: true },
    expiryDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    patient: { type: 'Name', optional: true },
    insuranceProvider: { type: 'InsuranceProvider', optional: true },
  },
};

export default InsurancePolicy;
