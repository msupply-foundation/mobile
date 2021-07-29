/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

import { DateRangeSelector } from '../widgets/DateRangeSelector';
import { DataTablePageView, FlexRow, FlexView, Paper, SensorStatus } from '../widgets';
import { BreachCard } from '../widgets/BreachCard';
import { VaccineBarChart } from '../widgets/VaccineBarChart';
import { VaccineLineChart } from '../widgets/VaccineLineChart';
import { FridgeDetailActions } from '../actions/FridgeDetailActions';
import { AfterInteractions } from '../widgets/AfterInteractions';
import { IconButton } from '../widgets/IconButton';
import { BarChartIcon, LineChartIcon } from '../widgets/icons';

import {
  selectMinAndMaxLogs,
  selectBreachBoundaries,
  selectSelectedFridgeSensor,
  selectFromDate,
  selectToDate,
  selectMaximumToDate,
  selectMinimumFromDate,
} from '../selectors/fridge';

import { APP_FONT_FAMILY, DARKER_GREY, BLUE_WHITE, WARMER_GREY } from '../globalStyles';
import { vaccineStrings } from '../localization/index';
import { SensorHeader } from '../widgets/SensorHeader/SensorHeader';
import { BreachManUnhappy } from '../widgets/BreachManUnhappy';
import { BreachActions } from '../actions/BreachActions';
import { Spacer } from '../widgets/Spacer';

const BREACH_MAN_UNHAPPY_SIZE = 400;
const EmptyComponent = ({ sensorName }) => (
  <FlexView style={localStyles.emptyComponent}>
    <BreachManUnhappy size={BREACH_MAN_UNHAPPY_SIZE} />
    <Text>{sensorName}</Text>
    <Text style={localStyles.emptyText}>{vaccineStrings.oops_no_temperatures}</Text>
  </FlexView>
);

EmptyComponent.propTypes = {
  sensorName: PropTypes.string.isRequired,
};

export const FridgeDetailPageComponent = ({
  sensor,
  breaches,
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  fromDate,
  toDate,
  minimumDate,
  maximumDate,
  breachBoundaries,
  onPressBreach,
  onChangeToDate,
  onChangeFromDate,
}) => {
  const [chartType, setChartType] = useState('bar');

  const minDate = new Date(minimumDate);
  const maxDate = new Date(maximumDate);
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const getIconButton = type => {
    const iconStyle = { color: chartType === type ? WARMER_GREY : DARKER_GREY };
    return (
      <IconButton
        onPress={() => setChartType(type)}
        Icon={
          type === 'line' ? <LineChartIcon style={iconStyle} /> : <BarChartIcon style={iconStyle} />
        }
        containerStyle={{ padding: 8 }}
      />
    );
  };

  if (!minLine.length || !maxLine.length) {
    return (
      <AfterInteractions>
        <View style={localStyles.container}>
          <View style={localStyles.topRow}>
            <DateRangeSelector
              containerStyle={localStyles.datePickerContainer}
              initialStartDate={from}
              initialEndDate={to}
              onChangeToDate={onChangeToDate}
              onChangeFromDate={onChangeFromDate}
              minimumDate={minDate}
              maximumDate={maxDate}
            />
          </View>
          <EmptyComponent sensorName={sensor.name} />
        </View>
      </AfterInteractions>
    );
  }

  return (
    <DataTablePageView>
      <AfterInteractions>
        <View style={localStyles.container}>
          <View style={localStyles.topRow}>
            <DateRangeSelector
              containerStyle={localStyles.datePickerContainer}
              initialStartDate={from}
              initialEndDate={to}
              onChangeToDate={onChangeToDate}
              onChangeFromDate={onChangeFromDate}
              minimumDate={minDate}
              maximumDate={maxDate}
            />
            <View style={localStyles.buttonContainer}>
              {getIconButton('line')}
              {getIconButton('bar')}
            </View>
          </View>

          <Paper
            height={300}
            contentContainerStyle={{ flex: 1 }}
            Header={<SensorHeader showTitle showCog sensor={sensor} />}
          >
            <AfterInteractions>
              <FlexRow alignItems="center" style={{ height: '100%' }}>
                {chartType === 'line' && (
                  <VaccineLineChart
                    breaches={breaches}
                    minLine={minLine}
                    maxLine={maxLine}
                    minDomain={minDomain}
                    maxDomain={maxDomain}
                    breachBoundaries={breachBoundaries}
                    onPressBreach={onPressBreach}
                  />
                )}
                {chartType === 'bar' && (
                  <VaccineBarChart
                    breaches={breaches}
                    minLine={minLine}
                    maxLine={maxLine}
                    minDomain={minDomain}
                    maxDomain={maxDomain}
                    breachBoundaries={breachBoundaries}
                  />
                )}
                <Spacer space={20} />
                <SensorStatus macAddress={sensor.macAddress} />
              </FlexRow>
            </AfterInteractions>
          </Paper>

          <Animatable.View animation="fadeIn" duration={3000} useNativeDriver>
            <FlexRow style={localStyles.breachCardRow}>
              <BreachCard type="COLD_CUMULATIVE" />
              <BreachCard type="COLD_CONSECUTIVE" />
              <BreachCard type="AVERAGE_TEMPERATURE" />
              <BreachCard type="HOT_CUMULATIVE" />
              <BreachCard type="HOT_CONSECUTIVE" />
            </FlexRow>
          </Animatable.View>
        </View>
      </AfterInteractions>
    </DataTablePageView>
  );
};

const stateToProps = state => {
  const { minLine, maxLine, breaches, minDomain, maxDomain } = selectMinAndMaxLogs(state);
  const sensor = selectSelectedFridgeSensor(state);
  const fromDate = selectFromDate(state);
  const toDate = selectToDate(state);
  const minimumDate = selectMinimumFromDate(state);
  const maximumDate = selectMaximumToDate(state);
  const breachBoundaries = selectBreachBoundaries(state);

  return {
    sensor,
    breaches,
    minLine,
    maxLine,
    minDomain,
    maxDomain,
    fromDate,
    toDate,
    minimumDate,
    maximumDate,
    breachBoundaries,
  };
};

const dispatchToProps = dispatch => ({
  onChangeToDate: date => dispatch(FridgeDetailActions.changeToDate(date)),
  onChangeFromDate: date => dispatch(FridgeDetailActions.changeFromDate(date)),
  onPressBreach: breachId => dispatch(BreachActions.viewFridgeBreach(breachId)),
});

FridgeDetailPageComponent.defaultProps = {
  minimumDate: null,
  maximumDate: null,
};

FridgeDetailPageComponent.propTypes = {
  onPressBreach: PropTypes.func.isRequired,
  breaches: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  onChangeToDate: PropTypes.func.isRequired,
  onChangeFromDate: PropTypes.func.isRequired,
  fromDate: PropTypes.number.isRequired,
  toDate: PropTypes.number.isRequired,
  minimumDate: PropTypes.number,
  maximumDate: PropTypes.number,
  sensor: PropTypes.object.isRequired,
  breachBoundaries: PropTypes.object.isRequired,
};

const localStyles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: BLUE_WHITE },
  datePickerContainer: { width: 250, borderRadius: 50, height: 50 },
  card: { flex: 1 },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  emptyText: {
    fontSize: 28,
  },
  emptyComponent: {
    alignItems: 'center',
    color: DARKER_GREY,
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  topRow: { flexDirection: 'row' },
  breachCardRow: { justifyContent: 'space-around' },
});

export const FridgeDetailPage = connect(stateToProps, dispatchToProps)(FridgeDetailPageComponent);
