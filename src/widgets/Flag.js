/* eslint-disable import/prefer-default-export */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { LANGUAGE_CODES } from '../localization/index';

import {
  EnglishFlag,
  FrenchFlag,
  KiribatiFlag,
  LaosFlag,
  MyanmarFlag,
  PortugueseFlag,
  SpanishFlag,
  TetumFlag,
  ChineseFlag,
} from './images';

const LANGUAGE_TO_FLAG = {
  [LANGUAGE_CODES.ENGLISH]: EnglishFlag,
  [LANGUAGE_CODES.FRENCH]: FrenchFlag,
  [LANGUAGE_CODES.KIRIBATI]: KiribatiFlag,
  [LANGUAGE_CODES.LAOS]: LaosFlag,
  [LANGUAGE_CODES.MYANMAR]: MyanmarFlag,
  [LANGUAGE_CODES.PORTUGUESE]: PortugueseFlag,
  [LANGUAGE_CODES.SPANISH]: SpanishFlag,
  [LANGUAGE_CODES.TETUM]: TetumFlag,
  [LANGUAGE_CODES.CHINESE]: ChineseFlag,
};

/**
 * Simple component rendering a flag image given the country code.
 * See localization/index - LANGUAGE_CODES
 *
 * @param {Object} Style       Style object for the flag Image component
 * @param {String} countryCode The country code whose flag should be used.
 */
export const Flag = ({ style, countryCode }) => {
  const FlagImage = LANGUAGE_TO_FLAG[countryCode];
  return <FlagImage style={style} />;
};

Flag.defaultProps = { style: { width: 55, height: 33 } };
Flag.propTypes = { style: PropTypes.object, countryCode: PropTypes.string.isRequired };
