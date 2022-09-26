/* eslint-disable react/forbid-prop-types */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-community/picker';

import { SUSSOL_ORANGE, LIGHT_GREY } from '../../../globalStyles/colors';

export const Select = ({
  disabled,
  readonly,
  onChange,
  placeholder,
  options,
  value,
  schema,
  onBlur,
  id,
}) => {
  let pickers = options.enumOptions.map(({ label, value: enumValue }) => (
    <Picker.Item
      key={label}
      label={label}
      value={enumValue}
      color={disabled ? LIGHT_GREY : SUSSOL_ORANGE}
    />
  ));

  const placeholderItem = (
    <Picker.Item
      key={placeholder}
      label={placeholder}
      value={placeholder}
      color={disabled ? LIGHT_GREY : SUSSOL_ORANGE}
    />
  );

  pickers = [placeholderItem, ...pickers];

  useEffect(() => {
    if (!options?.enumOptions?.find(o => o.value === value)) {
      const { default: defaultValue } = schema;
      onChange(defaultValue);
    }
  }, [value, options, schema, onChange]);

  return (
    <Picker
      mode="dropdown"
      enabled={!(disabled || readonly)}
      selectedValue={value}
      onValueChange={chosenValue => {
        // There is a requirement for 'empty'/placeholder entries to call on change with
        // undefined: https://github.com/rjsf-team/react-jsonschema-form/pull/451/files
        // however the placeholder value is passed by default as an empty string.
        if (chosenValue === '') onChange(undefined);
        else onChange(chosenValue);
        onBlur(id, chosenValue);
      }}
    >
      {pickers}
    </Picker>
  );
};

Select.defaultProps = {
  readonly: false,
  value: '',
};

Select.propTypes = {
  options: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBlur: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  readonly: PropTypes.bool,
  placeholder: PropTypes.string.isRequired,
  schema: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};
