/* eslint-disable react/require-default-props */
/* eslint-disable arrow-body-style */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {
  DataTablePageView,
  ChevronRightIcon,
  PageButton,
  Paper,
  TemperatureIcon,
  Circle,
  FlexRow,
  AlarmClockIcon,
  FlexView,
} from '../widgets/index';
import { TextWithIcon } from '../widgets/Typography';
import { vaccineStrings, buttonStrings } from '../localization';
import { APP_FONT_FAMILY, DARKER_GREY, BLACK } from '../globalStyles';
import { gotoFridgeDetailPage, gotoNewSensorPage } from '../navigation/actions';
import { AfterInteractions } from '../widgets/AfterInteractions';
import { SensorHeader } from '../widgets/SensorHeader/SensorHeader';
import { selectActiveSensors } from '../selectors/Entities/sensor';
import temperature from '../utilities/temperature';
import { BreachManUnhappy } from '../widgets/BreachManUnhappy';
import { formatDate } from '../utilities/formatters';
import BtUtilService from '../bluetooth/BtUtilService';

const BREACH_MAN_UNHAPPY_SIZE = 400;

const EmptyComponent = () => (
  <FlexView justifyContent="center" alignItems="center" flex={1}>
    <BreachManUnhappy size={BREACH_MAN_UNHAPPY_SIZE} />
    <Text style={localStyles.emptyText}>{vaccineStrings.new_sensor_warning}</Text>
  </FlexView>
);

const FridgeDisplay = ({ sensor, toFridgeDetail }) => {
  const { id, macAddress, currentTemperature, mostRecentBreachTime, locationID } = sensor;

  return (
    <Paper
      Header={<SensorHeader showTitle showCog sensor={sensor} />}
      contentContainerStyle={localStyles.fridgePaperContentContainer}
    >
      <TouchableOpacity onPress={() => toFridgeDetail(locationID)}>
        <FlexRow key={id}>
          <TextWithIcon left size="ms" containerStyle={{ flex: 1 }} Icon={<Circle size={20} />}>
            {BtUtilService().deviceDescriptorToDevice(macAddress).id}
          </TextWithIcon>
          <TextWithIcon
            left
            size="ms"
            containerStyle={localStyles.fridgeDetail}
            Icon={<TemperatureIcon color={DARKER_GREY} />}
          >
            {temperature(currentTemperature).format()}
          </TextWithIcon>
          <TextWithIcon
            left
            containerStyle={localStyles.fridgeDetail}
            size="ms"
            Icon={<AlarmClockIcon color={DARKER_GREY} />}
          >
            {formatDate(mostRecentBreachTime)}
          </TextWithIcon>

          <ChevronRightIcon color={BLACK} style={{ alignSelf: 'center' }} />
        </FlexRow>
      </TouchableOpacity>
    </Paper>
  );
};

FridgeDisplay.propTypes = {
  sensor: PropTypes.object.isRequired,
  toFridgeDetail: PropTypes.func.isRequired,
};

export const VaccinePageComponent = ({ sensors, toNewSensorPage, toFridgeDetail }) => (
  <DataTablePageView
    captureUncaughtGestures={false}
    style={{ paddingHorizontal: 20, paddingVertical: 30 }}
  >
    <FlexRow style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
      <PageButton text={buttonStrings.add_sensor} onPress={toNewSensorPage} />
    </FlexRow>
    <AfterInteractions placeholder={null}>
      <Animatable.View style={{ flex: 1 }} animation="fadeIn" duration={500} useNativeDriver>
        <FlatList
          ListEmptyComponent={<EmptyComponent />}
          renderItem={({ item }) => <FridgeDisplay sensor={item} toFridgeDetail={toFridgeDetail} />}
          data={sensors}
        />
      </Animatable.View>
    </AfterInteractions>
  </DataTablePageView>
);

VaccinePageComponent.defaultProps = {
  sensors: null,
};

VaccinePageComponent.propTypes = {
  sensors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  toFridgeDetail: PropTypes.func.isRequired,
  toNewSensorPage: PropTypes.func.isRequired,
};

const localStyles = StyleSheet.create({
  iconButton: {
    flexBasis: 50,
    justifyContent: 'center',
  },
  fridgeDetail: {
    flex: 0,
    height: 60,
    paddingRight: 40,
    width: 140,
  },
  fridgePaperContentContainer: {
    flex: 2,
    flexDirection: 'column',
  },
  emptyText: {
    fontSize: 28,
    color: DARKER_GREY,
    fontFamily: APP_FONT_FAMILY,
    fontWeight: 'bold',
  },
});

const sortSensors = (s1, s2) => {
  const nameA = s1.name.toUpperCase();
  const nameB = s2.name.toUpperCase();

  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  return 0;
};

const stateToProps = state => {
  const sensors = selectActiveSensors(state).sort(sortSensors);
  return { sensors };
};

const dispatchToProps = dispatch => ({
  toFridgeDetail: fridge => dispatch(gotoFridgeDetailPage(fridge)),
  toNewSensorPage: () => dispatch(gotoNewSensorPage()),
});

export const VaccinePage = connect(stateToProps, dispatchToProps)(VaccinePageComponent);
