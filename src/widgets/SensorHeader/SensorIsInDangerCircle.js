/* eslint-disable arrow-body-style */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DANGER_RED, FINALISE_GREEN } from '../../globalStyles/index';
import { Circle } from '../Circle';
import { WithFlash } from '../WithFlash';
import { selectIsInDangerById } from '../../selectors/Entities/sensor';

export const SensorIsInDangerCircleComponent = ({ isInDanger }) => {
  const backgroundColor = isInDanger ? DANGER_RED : FINALISE_GREEN;

  return (
    <WithFlash condition={isInDanger}>
      <Circle size={20} backgroundColor={backgroundColor} />
    </WithFlash>
  );
};

SensorIsInDangerCircleComponent.defaultProps = {};

SensorIsInDangerCircleComponent.propTypes = {
  isInDanger: PropTypes.bool.isRequired,
};

const stateToProps = (state, props) => {
  const { id } = props;
  const isInDanger = selectIsInDangerById(state, id);
  return { isInDanger };
};

export const SensorIsInDangerCircle = connect(stateToProps)(SensorIsInDangerCircleComponent);
