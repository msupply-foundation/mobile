/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { utils } from '@rjsf/core';
import { ScrollView, StyleSheet } from 'react-native';
import { FINALISED_RED } from '../../../globalStyles/colors';
import { APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../../globalStyles/fonts';
import { FormInvalidMessage } from '../../FormInputs/FormInvalidMessage';
import { Spacer } from '../../Spacer';
import { Paper } from '../../Paper';

const { getSchemaType } = utils;

const schemaIsObject = schema => getSchemaType(schema) === 'object';
const schemaIsRoot = id => id === 'root';

const getTitleSize = (id, schema) => {
  const isObject = schemaIsObject(schema);
  const isRootSchema = schemaIsRoot(id);

  if (isObject && isRootSchema) return 'large';
  if (isObject) return 'medium';

  return 'normal';
};

export const Field = ({
  label,
  fields,
  required,
  rawErrors,
  description,
  children,
  id,
  schema,
}) => {
  const { TitleField } = fields;

  const hasError = rawErrors?.length > 0;

  let InvalidMessage = null;
  if (hasError) {
    InvalidMessage = rawErrors?.map(error => (
      <FormInvalidMessage
        key={error}
        isValid={!hasError}
        message={error}
        textStyle={styles.invalidStyle}
      />
    ));
  }

  const Content = (
    <>
      {description}
      {children}
      {!schemaIsObject(schema) && InvalidMessage}
    </>
  );

  if (schemaIsRoot(id)) {
    return label ? (
      <Paper
        style={{ flex: 1 }}
        Header={<TitleField title={label} isRequired={required} size={getTitleSize(id, schema)} />}
        contentContainerStyle={{ flex: 1 }}
      >
        <ScrollView keyboardDismissMode="none" keyboardShouldPersistTaps="always">
          <Spacer space={20} vertical />
          {Content}
        </ScrollView>
      </Paper>
    ) : (
      <ScrollView keyboardDismissMode="none" keyboardShouldPersistTaps="always">
        {Content}
      </ScrollView>
    );
  }

  if (schemaIsObject(schema)) {
    return (
      <>
        <TitleField title={label} size={getTitleSize(id, schema)} />
        {Content}
      </>
    );
  }

  return (
    <>
      <Spacer space={20} vertical />
      <TitleField title={label} isRequired={required} size={getTitleSize(id, schema)} />
      {Content}
    </>
  );
};

const styles = StyleSheet.create({
  invalidStyle: {
    color: FINALISED_RED,
    fontFamily: APP_FONT_FAMILY,
    fontSize: APP_GENERAL_FONT_SIZE,
  },
});

Field.defaultProps = {
  rawErrors: [],
  required: false,
  label: null,
};

Field.propTypes = {
  label: PropTypes.string,
  fields: PropTypes.object.isRequired,
  required: PropTypes.bool,
  rawErrors: PropTypes.array,
  description: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  schema: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};
