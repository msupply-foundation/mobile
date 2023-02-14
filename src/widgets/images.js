/* eslint-disable react/forbid-prop-types */
/* eslint-disable global-require */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';

/**
 * Collection of image components for easy access and to ensure
 * images are lazily required.
 */

const imagePropTypes = { style: PropTypes.object.isRequired };

export const EnglishFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/gb.png')} resizeMode="stretch" />
);
EnglishFlag.propTypes = imagePropTypes;

export const KiribatiFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/gil.png')} resizeMode="stretch" />
);
KiribatiFlag.propTypes = imagePropTypes;

export const FrenchFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/fr.png')} resizeMode="stretch" />
);
FrenchFlag.propTypes = imagePropTypes;

export const TetumFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/tl.png')} resizeMode="stretch" />
);
TetumFlag.propTypes = imagePropTypes;

export const LaosFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/la.png')} resizeMode="stretch" />
);
LaosFlag.propTypes = imagePropTypes;

export const MyanmarFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/my.png')} resizeMode="stretch" />
);
MyanmarFlag.propTypes = imagePropTypes;

export const PortugueseFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/pt.png')} resizeMode="stretch" />
);
PortugueseFlag.propTypes = imagePropTypes;

export const SpanishFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/es.png')} resizeMode="stretch" />
);
SpanishFlag.propTypes = imagePropTypes;

export const ChineseFlag = ({ style }) => (
  <Image style={style} source={require('../images/flags/ch.png')} resizeMode="stretch" />
);
ChineseFlag.propTypes = imagePropTypes;

export const CustomerImage = ({ style }) => (
  <Image style={style} source={require('../images/menu_people.png')} resizeMode="contain" />
);
CustomerImage.propTypes = imagePropTypes;

export const SupplierImage = ({ style }) => (
  <Image style={style} source={require('../images/menu_truck.png')} resizeMode="contain" />
);
SupplierImage.propTypes = imagePropTypes;

export const StockImage = ({ style }) => (
  <Image style={style} source={require('../images/menu_pc_clipboard.png')} resizeMode="contain" />
);
StockImage.propTypes = imagePropTypes;

export const ModulesImage = ({ style }) => (
  <Image style={style} source={require('../images/menu_modules.png')} resizeMode="contain" />
);
ModulesImage.propTypes = imagePropTypes;

export const MsupplyMan = () => (
  <Image resizeMode="contain" source={require('../images/logo.png')} />
);
