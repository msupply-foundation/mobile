import Ajv from 'ajv';

const ajvErrors = require('ajv-errors');

const ajvOptions = {
  errorDataPath: 'property',
  allErrors: true,
  multipleOfPrecision: 8,
  schemaId: 'auto',
  jsonPointers: true,
};

const ajv = new Ajv(ajvOptions);
ajvErrors(ajv);

export const validateJsonSchemaData = (jsonSchema, data) => {
  if (!jsonSchema) return true;
  const result = ajv.validate(jsonSchema, data);
  return result;
};
