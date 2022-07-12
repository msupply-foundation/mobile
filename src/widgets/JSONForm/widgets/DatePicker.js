import React, { useState } from 'react';
import { TextInput } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';

import { DatePickerButton } from '../../DatePickerButton';
import { FlexRow } from '../../FlexRow';
import { useJSONFormOptions } from '../JSONFormContext';
import { DARKER_GREY, LIGHT_GREY } from '../../../globalStyles/colors';
import { DATE_FORMAT } from '../../../utilities/constants';

export const DatePicker = ({
  disabled,
  value,
  onChange,
  placeholder,
  readonly,
  onBlur,
  id,
  options,
}) => {
  const { focusController } = useJSONFormOptions();
  const ref = focusController.useRegisteredRef();

  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = dateString => {
    onChange(dateString);
    onBlur(id, dateString);
  };

  React.useEffect(() => {
    const alternateFormatDate = moment(value, 'YYYY-MM-DD', true);
    const expectedFormateDate = alternateFormatDate.isValid()
      ? alternateFormatDate
      : moment(value, DATE_FORMAT.DD_MM_YYYY, true);

    setSelectedDate(expectedFormateDate.isValid() ? expectedFormateDate.toDate() : null);
  }, [value]);

  return (
    <FlexRow>
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor={LIGHT_GREY}
        underlineColorAndroid={DARKER_GREY}
        placeholder={placeholder}
        editable={!(readonly || disabled)}
        value={selectedDate ? moment(selectedDate).format(DATE_FORMAT.DD_MM_YYYY) : ''}
        ref={ref}
        onSubmitEditing={() => focusController.next(ref)}
        onChangeText={handleChange}
        returnKeyType="next"
        autoCapitalize="none"
        keyboardType="numeric"
        autoCorrect={false}
      />
      <DatePickerButton
        isDisabled={readonly || disabled}
        initialValue={selectedDate || moment().toDate()}
        minimumDate={options.dateRange === 'future' ? new Date() : null}
        maximumDate={options.dateRange === 'past' ? new Date() : null}
        onDateChanged={date => handleChange(moment(date).format(DATE_FORMAT.DD_MM_YYYY))}
      />
    </FlexRow>
  );
};

DatePicker.defaultProps = {
  value: '',
};

DatePicker.propTypes = {
  disabled: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.shape({
    dateRange: PropTypes.string,
  }).isRequired,
  placeholder: PropTypes.string.isRequired,
  readonly: PropTypes.bool.isRequired,
  onBlur: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};
