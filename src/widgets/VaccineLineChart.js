/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Svg } from 'react-native-svg';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import PropTypes from 'prop-types';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';
import { WHITE, COLD_BREACH_BLUE, SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles';
import { HazardPoint } from './HazardPoint';
import { FlexView } from './FlexView';
import { CHART_CONSTANTS } from '../utilities/modules/vaccines';
import { timestampTickFormatter, temperatureTickFormatter } from '../utilities/formatters';
import { WARMER_GREY } from '../globalStyles/colors';

export const VaccineLineChart = ({
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  x,
  y,
  breaches,
  breachBoundaries,
  onPressBreach,
}) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const chartMinDomain = React.useMemo(() => ({ y: minDomain - CHART_CONSTANTS.DOMAIN_OFFSET }), [
    minDomain,
  ]);
  const chartMaxDomain = React.useMemo(() => ({ y: maxDomain + CHART_CONSTANTS.DOMAIN_OFFSET }), [
    maxDomain,
  ]);

  const upperBreachLimit = maxLine.map(point => ({
    x: point.timestamp,
    y: breachBoundaries.upper,
  }));
  const lowerBreachLimit = minLine.map(point => ({
    x: point.timestamp,
    y: breachBoundaries.lower,
  }));

  return (
    <FlexView
      onLayout={setDimensions}
      style={{ width: '100%', height: '100%' }}
      alignItems="center"
      justifyContent="center"
    >
      {!width || !height ? (
        <ActivityIndicator size="large" color={SUSSOL_ORANGE} />
      ) : (
        <Svg>
          <VictoryChart
            width={width}
            height={height}
            minDomain={chartMinDomain}
            maxDomain={chartMaxDomain}
            padding={{ top: 20, bottom: 50, right: 10, left: 50 }}
          >
            <VictoryAxis
              offsetX={CHART_CONSTANTS.AXIS_OFFSET}
              dependentAxis
              style={chartStyles.axisY}
              tickFormat={temperatureTickFormatter}
            />
            <VictoryAxis
              offsetY={CHART_CONSTANTS.AXIS_OFFSET}
              tickFormat={timestampTickFormatter}
              style={chartStyles.axisX}
              tickCount={CHART_CONSTANTS.MAX_TICK_COUNTS}
            />

            <VictoryLine
              interpolation={CHART_CONSTANTS.INTERPOLATION}
              data={minLine}
              y={y}
              x={x}
              style={chartStyles.minLine}
            />
            <VictoryLine
              interpolation={CHART_CONSTANTS.INTERPOLATION}
              data={maxLine}
              y={y}
              x={x}
              style={chartStyles.maxLine}
            />
            <VictoryLine data={upperBreachLimit} style={chartStyles.maxBoundaryLine} />
            <VictoryLine data={lowerBreachLimit} style={chartStyles.minBoundaryLine} />

            <VictoryScatter data={maxLine} y={y} x={x} style={chartStyles.maxScatterPlot} />
            <VictoryScatter data={minLine} y={y} x={x} style={chartStyles.minScatterPlot} />
            <VictoryScatter
              data={breaches.slice()}
              y={y}
              x={x}
              dataComponent={<HazardPoint dataSet={breaches.slice()} onPress={onPressBreach} />}
            />
          </VictoryChart>
        </Svg>
      )}
    </FlexView>
  );
};

VaccineLineChart.defaultProps = {
  x: 'timestamp',
  y: 'temperature',
  onPressBreach: null,
  breaches: null,
};

VaccineLineChart.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  onPressBreach: PropTypes.func,
  breaches: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  breachBoundaries: PropTypes.object.isRequired,
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.3 } },
  minBoundaryLine: { data: { stroke: COLD_BREACH_BLUE, opacity: 0.3 } },
  minScatterPlot: {
    data: {
      fill: WHITE,
      stroke: COLD_BREACH_BLUE,
      strokeWidth: CHART_CONSTANTS.STROKE_WIDTH,
      size: CHART_CONSTANTS.STROKE_SIZE,
    },
  },
  maxScatterPlot: {
    data: {
      fill: WHITE,
      stroke: SUSSOL_ORANGE,
      strokeWidth: CHART_CONSTANTS.STROKE_WIDTH,
      size: CHART_CONSTANTS.STROKE_SIZE,
    },
  },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: COLD_BREACH_BLUE } },
  axisX: { tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY } },
  axisY: {
    tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY },
    grid: { stroke: WARMER_GREY, strokeWidth: 0.5 },
  },
};
