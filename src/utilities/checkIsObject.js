/**
 * Check if the given parameter is an Object type {} and
 * return a boolean.
 *
 * @param   {object}  object  The object to check.
 *
 */

export const checkIsObject = object =>
  !!(object && typeof object === 'object' && object.constructor === Object);

export const checkIsObjectEmpty = object =>
  checkIsObject(object) && Object.keys(object).length === 0;

// We need this method because objects such as state would return
// Object.keys(object).length === 0 even if they have properties as they are
// immutable properties
export const checkIsObjectValuesEmpty = object =>
  Object.values(object).length === 0 && checkIsObject(object);
