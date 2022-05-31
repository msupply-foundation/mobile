import moment from 'moment';

/**
 * Converts the vaccinationDate (stored as a string and potentially in a variable format) to
 * an ISO formatted date string
 * The 'expected' mobile format is DD/MM/YYYY but some users have inserted/scripted data
 * in all sorts of weird formats - this is a hack to make a best attempt to read it.
 *
 * @param   {string}  dateString  The date of vaccination (as entered by the user / script)
 * @return  {string}              ISO formatted date string
 */
export const convertVaccinationEntryToISOString = dateString => {
  const invalidDateString = 'Invalid date';
  if (!dateString) return invalidDateString; // show 'Invalid date' if no date
  const separators = ['/', '-'];
  const splitDate = dateString.split(new RegExp(separators.join('|'), 'g'));

  if (splitDate.length !== 3) return invalidDateString; // date needs to have month, date and year

  let convertedDate;
  // Some variant of xx-xx-yyyy format
  if (splitDate[2].length === 4) {
    convertedDate = moment(dateString, 'DD/MM/YYYY').isValid()
      ? moment(dateString, 'DD/MM/YYYY')
      : moment(dateString, 'MM/DD/YYYY'); // Try swap - likely month was entered the wrong way
  } else {
    // Some variant of yyyy-xx-xx format
    convertedDate = moment(dateString, 'YYYY/MM/DD').isValid()
      ? moment(dateString, 'YYYY/MM/DD')
      : moment(dateString, 'YYYY/DD/MM'); // Try swap - likely month was entered the wrong way
  }
  return convertedDate.format('YYYY-MM-DD');
};
