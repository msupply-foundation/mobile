import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { getColumns } from '../../pages/dataTableUtilities';
import { MODALS } from '../constants';
import { validateJsonSchemaData } from '../../utilities';
import { FlexView } from '../FlexView';
import { WHITE, APP_FONT_FAMILY, APP_GENERAL_FONT_SIZE } from '../../globalStyles';
import { dispensingStrings } from '../../localization';
import { SimpleTable } from '../SimpleTable';

const columns = getColumns(MODALS.VACCINATION_HISTORY);

const EmptyComponent = () => (
  <FlexView flex={1} justifyContent="center" alignItems="center" style={{ marginTop: 20 }}>
    <Text style={localStyles.text}>{dispensingStrings.no_history_for_this_patient}</Text>
  </FlexView>
);

const jsonSchema = {
  type: 'object',
  properties: {
    bonusDose: {
      type: 'boolean',
    },
    refused: {
      type: 'boolean',
    },
    vaccinator: {
      type: 'string',
    },
    itemName: {
      type: 'string',
    },
    itemCode: {
      type: 'string',
    },
    vaccineDate: {
      type: 'string',
    },
  },
};

export const VaccinationHistory = ({ history }) => {
  const filtered =
    history?.filter(vaccination => validateJsonSchemaData(jsonSchema, vaccination)) ?? [];

  return (
    <View style={localStyles.mainContainer}>
      <View style={localStyles.tableContainer}>
        <SimpleTable
          data={filtered}
          columns={columns}
          ListEmptyComponent={<EmptyComponent />}
          keyExtractor={(_, idx) => idx}
        />
      </View>
    </View>
  );
};

const localStyles = {
  mainContainer: { backgroundColor: WHITE, flex: 1 },
  text: { fontFamily: APP_FONT_FAMILY, fontSize: APP_GENERAL_FONT_SIZE },
  tableContainer: { backgroundColor: 'white', flexGrow: 0, flexShrink: 1 },
};

VaccinationHistory.defaultProps = {
  history: null,
};

VaccinationHistory.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.array,
};
