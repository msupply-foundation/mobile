/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2018
 */

import React from 'react';
import PropTypes from 'prop-types';
import { VictoryLabel, VictoryPie } from 'victory-native';

import { APP_FONT_FAMILY, GREY } from '../globalStyles';

/**
 * This page renders a PieChart graph
 *
 * @prop  {number}  width   Horizontal size of the graph container
 * @prop  {number}  height  Vertical size of the graph container
 * @prop  {array}   data    Contains labels, values and quantities to plot
 */

export const PieChart = ({ width, height, data }) => {
  const {
    padVertical,
    padHorizontal,
    innerRadius,
    labelRadius,
    padAngle,
    colorScale,
    style,
  } = victoryStyles.pieChart;

  const padding = {
    top: height * padVertical,
    bottom: height * padVertical,
    right: width * padHorizontal,
    left: width * padHorizontal,
  };

  const widthPadded = width * (1 - padHorizontal);
  return data.map(({ values, index }) => (
    <VictoryPie
      width={width}
      height={height}
      padding={padding}
      padAngle={padAngle}
      innerRadius={widthPadded * innerRadius}
      labelRadius={widthPadded * labelRadius}
      colorScale={colorScale}
      labels={({ datum }) => `${datum.x} : ${datum.y}`}
      labelComponent={<VictoryLabel style={style} />}
      data={values}
      key={index}
    />
  ));
};

PieChart.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
};

const victoryStyles = {
  pieChart: {
    padVertical: 0.15,
    padHorizontal: 0.15,
    innerRadius: 0.2,
    labelRadius: 0.375,
    padAngle: 2.5,
    colorScale: 'warm',
    style: { fontFamily: APP_FONT_FAMILY, fill: GREY },
  },
};
