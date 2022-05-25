import { convertVaccinationEntryToISOString } from './vaccinationDateParser';

const invalidDateString = 'Invalid date';
// Test cases from https://github.com/openmsupply/mobile/issues/4724
describe('vaccinationDateParser: convertVaccinationEntryToISOString', () => {
  it('Correctly formats a date provided in DD-MM-YYYY format', () => {
    const testDate = '28-03-2022';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  it('Correctly formats a date provided in DD/MM/YYYY format', () => {
    const testDate = '28/03/2022';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  it('Correctly formats a date provided in YYYY-MM-DD format', () => {
    const testDate = '2022-03-28';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  it('Correctly formats a date provided in YYYY/MM/DD format', () => {
    const testDate = '2022/03/28';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  it('Correctly formats a date provided in MM/DD/YYYY format', () => {
    const testDate = '03/28/2022';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  it('Correctly formats a date provided in YYYY/DD/MM format', () => {
    const testDate = '2022/03/28';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  // NB: D/M/YYYY is the default if there is not enough granularity
  // (e.g 3/4/2022 vs 4/3/2022 will both be treated as D/M/YYYY)
  it('Correctly formats a date provided in D/M/YYYY format', () => {
    const testDate = '4/3/2022';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-04');
  });

  it('Correctly formats a date provided in D-M-YYYY format', () => {
    const testDate = '4-3-2022';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-04');
  });

  it('Alphabetical input is invalid date', () => {
    const testDate = 'AA-BB-CCCC';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual(invalidDateString);
  });

  it('Date without 3 parts is invalid date', () => {
    const testDate = '18/01';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual(invalidDateString);
  });

  it('undefined dateString is invalid date', () => {
    const testDate = undefined;
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual(invalidDateString);
  });
});
