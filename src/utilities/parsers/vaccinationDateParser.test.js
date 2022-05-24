import { convertVaccinationEntryToISOString } from './vaccinationDateParser';

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

  // This format is invalid and also does not have enough granularity to correctly parse this date
  // it('Correctly formats a date provided in M/D/YYYY format', () => {
  //   const testDate = '3/4/2022';
  //   const result = convertVaccinationEntryToISOString(testDate);

  //   expect(result).toEqual('2022-03-04');
  // });

  it('Correctly formats a date provided in YYYY/DD/MM format', () => {
    const testDate = '2022/03/28';
    const result = convertVaccinationEntryToISOString(testDate);

    expect(result).toEqual('2022-03-28');
  });

  // This format is invalid and also does not have enough granularity to correctly parse this date
  // it('Correctly formats a date provided in YYYY/D/M format', () => {
  //   const testDate = '2022/4/3';
  //   const result = convertVaccinationEntryToISOString(testDate);

  //   expect(result).toEqual('2022-03-04');
  // });

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
});
