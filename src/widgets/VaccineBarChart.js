/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Svg } from 'react-native-svg';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryBar } from 'victory-native';
import PropTypes from 'prop-types';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';
import {
  WEARY_TARMAC,
  COLD_BREACH_BLUE,
  SUSSOL_ORANGE,
  APP_FONT_FAMILY,
  GREY,
  WARMER_GREY,
} from '../globalStyles';
import { FlexView } from './FlexView';
import { CHART_CONSTANTS } from '../utilities/modules/vaccines';
import { timestampTickFormatter, temperatureTickFormatter } from '../utilities/formatters';

export const VaccineBarChart = ({
  minLine,
  maxLine,
  minDomain,
  maxDomain,
  onPressBreach,
  breachBoundaries,
}) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const chartMinDomain = React.useMemo(() => ({ y: minDomain - CHART_CONSTANTS.DOMAIN_OFFSET }), [
    minDomain,
  ]);
  const chartMaxDomain = React.useMemo(() => ({ y: maxDomain + CHART_CONSTANTS.DOMAIN_OFFSET }), [
    maxDomain,
  ]);

  const upperBoundData = maxLine.map(point => ({ x: point.timestamp, y: breachBoundaries.upper }));
  const lowerBoundData = minLine.map(point => ({ x: point.timestamp, y: breachBoundaries.lower }));
  const barData = minLine.map(minPoint => {
    const maxPoint = maxLine.find(max => max.timestamp === minPoint.timestamp);

    const dataPoint = {
      x: minPoint.timestamp,
      hotY: 0,
      hotY0: 0,
      y: 0,
      y0: 0,
      coldY: 0,
      coldY0: 0,
    };

    if (maxPoint && maxPoint.temperature > breachBoundaries.upper) {
      dataPoint.hotY = maxPoint.temperature;
      dataPoint.hotY0 = Math.max(minPoint.temperature, breachBoundaries.upper);

      if (dataPoint.hotY === dataPoint.hotY0) {
        dataPoint.hotY += CHART_CONSTANTS.MIN_BAR_HEIGHT;
      }
    }

    if (minPoint.temperature < breachBoundaries.lower) {
      dataPoint.coldY = Math.min(breachBoundaries.lower, maxPoint.temperature);
      dataPoint.coldY0 = minPoint.temperature;

      if (dataPoint.coldY === dataPoint.coldY0) {
        dataPoint.coldY0 -= CHART_CONSTANTS.MIN_BAR_HEIGHT;
      }
    }

    if (
      minPoint.temperature > breachBoundaries.upper ||
      maxPoint.temperature < breachBoundaries.lower
    ) {
      // no mid section to display
      return dataPoint;
    }

    dataPoint.y = Math.min(breachBoundaries.upper, maxPoint.temperature);
    dataPoint.y0 = Math.max(breachBoundaries.lower, minPoint.temperature);
    if (dataPoint.y === dataPoint.y0) {
      dataPoint.y += CHART_CONSTANTS.MIN_BAR_HEIGHT;
    }

    return dataPoint;
  });

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

            <VictoryLine data={upperBoundData} style={chartStyles.maxBoundaryLine} />
            <VictoryLine data={lowerBoundData} style={chartStyles.minBoundaryLine} />
            <VictoryBar
              data={barData}
              y="hotY"
              y0="hotY0"
              style={chartStyles.hotBars}
              barRatio={0.9}
              alignment="start"
              onPress={onPressBreach}
            />
            <VictoryBar
              data={barData}
              style={chartStyles.midBars}
              barRatio={0.9}
              alignment="start"
            />
            <VictoryBar
              data={barData}
              y="coldY"
              y0="coldY0"
              style={chartStyles.coldBars}
              barRatio={0.9}
              alignment="start"
            />
          </VictoryChart>
        </Svg>
      )}
    </FlexView>
  );
};

VaccineBarChart.defaultProps = {
  onPressBreach: null,
};

VaccineBarChart.propTypes = {
  minDomain: PropTypes.number.isRequired,
  maxDomain: PropTypes.number.isRequired,
  minLine: PropTypes.array.isRequired,
  maxLine: PropTypes.array.isRequired,
  onPressBreach: PropTypes.func,
  breachBoundaries: PropTypes.object.isRequired,
};

const chartStyles = {
  maxBoundaryLine: { data: { stroke: SUSSOL_ORANGE, opacity: 0.75 } },
  minBoundaryLine: { data: { stroke: COLD_BREACH_BLUE, opacity: 0.75 } },
  maxLine: { data: { stroke: SUSSOL_ORANGE } },
  minLine: { data: { stroke: COLD_BREACH_BLUE } },
  axisX: { tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY } },
  axisY: {
    tickLabels: { fontSize: 10, fontFamily: APP_FONT_FAMILY, fill: GREY },
    grid: { stroke: WARMER_GREY, strokeWidth: 0.5 },
  },
  coldBars: { data: { fill: COLD_BREACH_BLUE, opacity: 0.9 } },
  hotBars: { data: { fill: SUSSOL_ORANGE, opacity: 0.9 } },
  midBars: { data: { fill: WEARY_TARMAC, opacity: 0.9 } },
};
