/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import React from 'react';
import PropTypes from 'prop-types';

import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory-native';
import { FlexView } from './FlexView';

import { useLayoutDimensions } from '../hooks/useLayoutDimensions';

import { COLD_BREACH_BLUE, WHITE, SUSSOL_ORANGE, APP_FONT_FAMILY, GREY } from '../globalStyles';
import { CHART_CONSTANTS } from '../utilities/modules/vaccines';
import { timestampTickFormatter, temperatureTickFormatter } from '../utilities/formatters';

export const BreachChart = ({ lineData, x, y, xTickFormat, yTickFormat, breach }) => {
  const [width, height, setDimensions] = useLayoutDimensions();

  const { minimumTemperature, maximumTemperature } = breach;

  const lineStyle = React.useMemo(() => ({ data: { stroke: SUSSOL_ORANGE } }), []);
  const scatterStyle = React.useMemo(
    () => ({
      data: {
        fill: WHITE,
        stroke: SUSSOL_ORANGE,
        strokeWidth: CHART_CONSTANTS.STROKE_WIDTH,
        size: CHART_CONSTANTS.STROKE_SIZE,
      },
    }),
    []
  );
  const domain = React.useMemo(
    () => ({
      y: [
        minimumTemperature - CHART_CONSTANTS.DOMAIN_OFFSET,
        maximumTemperature + CHART_CONSTANTS.DOMAIN_OFFSET,
      ],
    }),
    []
  );

  return (
    <FlexView onLayout={setDimensions}>
      <VictoryChart width={width} height={height} domain={domain}>
        <VictoryAxis
          offsetX={CHART_CONSTANTS.AXIS_OFFSET}
          dependentAxis
          style={chartStyles.axis}
          tickFormat={yTickFormat}
        />
        <VictoryAxis
          offsetY={CHART_CONSTANTS.AXIS_OFFSET}
          tickFormat={xTickFormat}
          style={chartStyles.axis}
        />
        <VictoryLine
          interpolation={CHART_CONSTANTS.INTERPOLATION}
          data={lineData}
          y={y}
          x={x}
          style={lineStyle}
        />
        <VictoryScatter data={lineData} y={y} x={x} style={scatterStyle} />
      </VictoryChart>
    </FlexView>
  );
};

BreachChart.defaultProps = {
  x: 'timestamp',
  y: 'temperature',
  xTickFormat: timestampTickFormatter,
  yTickFormat: temperatureTickFormatter,
};

BreachChart.propTypes = {
  x: PropTypes.string,
  y: PropTypes.string,
  lineData: PropTypes.array.isRequired,
  xTickFormat: PropTypes.func,
  yTickFormat: PropTypes.func,
  breach: PropTypes.object.isRequired,
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
  minLine: { data: { stroke: WHITE } },
  axis: { fontSize: 15, fontFamily: APP_FONT_FAMILY, fill: GREY },
};
