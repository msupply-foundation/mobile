/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import PropTypes from 'prop-types';

import IonIcon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  WHITE,
  FINALISE_GREEN,
  SUSSOL_ORANGE,
  FINALISED_RED,
  DARK_GREY,
  dataTableColors,
  GREY,
  DARKER_GREY,
  BLACK,
} from '../globalStyles';

export const SortAscIcon = () => <FAIcon name="sort-asc" size={15} style={{ marginRight: 10 }} />;
export const SortNeutralIcon = () => <FAIcon name="sort" size={15} style={{ marginRight: 10 }} />;
export const SortDescIcon = () => <FAIcon name="sort-desc" size={15} style={{ marginRight: 10 }} />;

export const CheckedIcon = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellChecked} />
);

export const UncheckedIcon = () => (
  <IonIcon name="md-radio-button-off" size={15} color={SUSSOL_ORANGE} />
);

export const DisabledCheckedIcon = () => (
  <IonIcon name="md-radio-button-on" size={15} color={dataTableColors.checkableCellDisabled} />
);
export const DisabledUncheckedIcon = () => <MaterialCommunityIcon name="cancel" size={15} />;

export const MagnifyingGlassIcon = React.memo(({ size, color }) => (
  <EvilIcon name="search" size={size} color={color} />
));
MagnifyingGlassIcon.propTypes = { size: PropTypes.number, color: PropTypes.string };
MagnifyingGlassIcon.defaultProps = { size: 40, color: SUSSOL_ORANGE };

export const CancelIcon = React.memo(() => (
  <EntypoIcon name="cross" color={FINALISED_RED} size={25} />
));

export const CloseIcon = ({ size, color }) => <IonIcon name="md-close" size={size} color={color} />;
CloseIcon.defaultProps = { color: WHITE, size: 36 };
CloseIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const CogIcon = ({ size, color, style }) => (
  <FAIcon name="cog" size={size} color={color} style={style} />
);
CogIcon.defaultProps = { color: GREY, size: 20, style: {} };
CogIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const ExpandIcon = React.memo(({ style, color, size }) => (
  <FAIcon name="external-link" style={style} size={size} color={color} />
));

ExpandIcon.defaultProps = { color: SUSSOL_ORANGE, size: 16, style: {} };
ExpandIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const ConfirmIcon = React.memo(({ style, color, size }) => (
  <FAIcon name="check-circle" style={style} color={color} size={size} />
));
ConfirmIcon.defaultProps = { color: FINALISE_GREEN, size: 40, style: {} };
ConfirmIcon.propTypes = {
  style: PropTypes.object,
  color: PropTypes.string,
  size: PropTypes.number,
};

export const LockIcon = React.memo(({ style }) => <FAIcon name="lock" size={28} style={style} />);
LockIcon.defaultProps = { style: { color: FINALISED_RED } };
LockIcon.propTypes = { style: PropTypes.object };

export const LanguageIcon = ({ size, color }) => (
  <FAIcon name="language" size={size} color={color} />
);
LanguageIcon.defaultProps = { color: GREY, size: 30 };
LanguageIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ChevronDownIcon = React.memo(({ color, size, style }) => (
  <FA5Icon name="chevron-down" color={color} size={size} style={style} />
));
ChevronDownIcon.defaultProps = { color: WHITE, size: 20, style: {} };
ChevronDownIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const ChevronUpIcon = React.memo(({ color, size, style }) => (
  <FA5Icon name="chevron-up" color={color} size={size} style={style} />
));
ChevronUpIcon.defaultProps = { color: WHITE, size: 20, style: {} };
ChevronUpIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const PowerIcon = React.memo(({ color, size }) => (
  <FAIcon name="power-off" color={color} size={size} />
));
PowerIcon.defaultProps = { color: GREY, size: 20 };
PowerIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const PencilIcon = React.memo(({ color, size }) => (
  <FAIcon name="pencil" color={color} size={size} />
));
PencilIcon.defaultProps = { color: WHITE, size: 20 };
PencilIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const HistoryIcon = ({ color, size }) => (
  <FA5Icon name="history" size={size} color={color} />
);
HistoryIcon.defaultProps = { color: WHITE, size: 20 };
HistoryIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const ChevronRightIcon = ({ color, size, style }) => (
  <FA5Icon name="chevron-right" color={color} size={size} style={style} />
);
ChevronRightIcon.defaultProps = { color: SUSSOL_ORANGE, size: 20, style: {} };
ChevronRightIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const FavouriteStarIcon = () => <FAIcon name="star-o" color={SUSSOL_ORANGE} size={20} />;
export const BurgerMenuIcon = () => <EntypoIcon name="menu" color={SUSSOL_ORANGE} size={30} />;

export const BookIcon = ({ color, size }) => (
  <EntypoIcon name="open-book" color={color} size={size} />
);
BookIcon.defaultProps = { color: WHITE, size: 20 };
BookIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const AddIcon = ({ size, color }) => <IonIcon name="ios-add" size={size} color={color} />;
AddIcon.defaultProps = { color: WHITE, size: 30 };
AddIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const MinusIcon = ({ size, color }) => (
  <IonIcon name="ios-remove" size={size} color={color} />
);
MinusIcon.defaultProps = { color: WHITE, size: 30 };
MinusIcon.propTypes = { color: PropTypes.string, size: PropTypes.number };

export const CalendarIcon = ({ color, size, style }) => (
  <FAIcon name="calendar" size={size} style={style} color={color} />
);
CalendarIcon.defaultProps = { color: WHITE, size: 20, style: {} };
CalendarIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const BackIcon = () => <FAIcon name="chevron-left" size={16} color={BLACK} />;

export const CloudIcon = ({ color, size, style }) => (
  <IonIcon name="md-cloud" size={size} color={color} style={style} />
);
CloudIcon.defaultProps = { color: DARK_GREY, size: 30, style: {} };
CloudIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const ArrowIcon = ({ color, size, style }) => (
  <FAIcon name="exchange" size={size} style={style} color={color} />
);
ArrowIcon.defaultProps = { color: DARK_GREY, size: 16, style: { marginLeft: 10 } };
ArrowIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const WifiOffIcon = ({ color, size, style }) => (
  <MaterialCommunityIcon name="rss-off" size={size} style={style} color={color} />
);
WifiOffIcon.defaultProps = { color: DARK_GREY, size: 22, style: { marginLeft: 10 } };
WifiOffIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const WifiIcon = ({ color, size, style }) => (
  <IonIcon name="logo-rss" size={size} style={style} color={color} />
);
WifiIcon.defaultProps = { color: DARK_GREY, size: 22, style: { marginLeft: 10 } };
WifiIcon.propTypes = { color: PropTypes.string, size: PropTypes.number, style: PropTypes.object };

export const TemperatureIcon = ({ color, size, style }) => (
  <FA5Icon name="temperature-high" size={size} style={style} color={color} />
);
TemperatureIcon.defaultProps = { color: DARK_GREY, size: 25, style: { marginLeft: 10 } };
TemperatureIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const HazardIcon = ({ color, size, style }) => (
  <FA5Icon name="exclamation-triangle" size={size} style={style} color={color} />
);
HazardIcon.defaultProps = { color: SUSSOL_ORANGE, size: 25, style: {} };
HazardIcon.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  style: PropTypes.object,
};

export const SyncArrow = ({ size, style, color }) => (
  <MaterialIcon name="sync" size={size} style={style} color={color} />
);
SyncArrow.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrow.propTypes = { size: PropTypes.number, style: PropTypes.object, color: PropTypes.string };

export const SyncArrowDisabled = ({ size, style, color }) => (
  <MaterialIcon name="sync-disabled" size={size} style={style} color={color} />
);
SyncArrowDisabled.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrowDisabled.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const SyncArrowProblem = ({ size, style, color }) => (
  <MaterialIcon name="sync-problem" size={size} style={style} color={color} />
);
SyncArrowProblem.defaultProps = { size: 30, style: {}, color: GREY };
SyncArrowProblem.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const PlusCircle = ({ size, style, color }) => (
  <FA5Icon name="plus-circle" size={size} style={style} color={color} />
);
PlusCircle.defaultProps = { size: 10, style: {}, color: DARKER_GREY };
PlusCircle.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const LowBatteryIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="battery-1" />
);

LowBatteryIcon.defaultProps = { size: 40, style: {}, color: WHITE };
LowBatteryIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const BatteryIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="battery-full" />
);

BatteryIcon.defaultProps = { size: 20, style: {}, color: WHITE };
BatteryIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const MinusCircle = ({ size, style, color }) => (
  <FA5Icon name="minus-circle" size={size} style={style} color={color} />
);
MinusCircle.defaultProps = { size: 10, style: {}, color: DARKER_GREY };
MinusCircle.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const LightbulbIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="lightbulb-o" />
);
LightbulbIcon.defaultProps = { size: 20, style: {}, color: 'white' };
LightbulbIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const DownloadIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="download" />
);
DownloadIcon.defaultProps = { size: 20, style: {}, color: BLACK };
DownloadIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const InfoIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="info-circle" />
);
InfoIcon.defaultProps = { size: 20, style: {}, color: DARKER_GREY };
InfoIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const AlarmClockIcon = ({ size, style, color }) => (
  <IonIcon size={size} style={style} color={color} name="alarm-outline" />
);
AlarmClockIcon.defaultProps = { size: 30, style: {}, color: DARKER_GREY };
AlarmClockIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const BarChartIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="bar-chart" />
);
BarChartIcon.defaultProps = { size: 20, style: {}, color: DARKER_GREY };
BarChartIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const LineChartIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="line-chart" />
);
LineChartIcon.defaultProps = { size: 20, style: {}, color: DARKER_GREY };
LineChartIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const PauseIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="pause" />
);
PauseIcon.defaultProps = { size: 20, style: {}, color: DARKER_GREY };
PauseIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const PlayIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="play" />
);
PlayIcon.defaultProps = { size: 20, style: {}, color: DARKER_GREY };
PlayIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const DisabledIcon = React.memo(({ style, color, size }) => (
  <FAIcon name="times-circle" style={style} color={color} size={size} />
));
DisabledIcon.defaultProps = { color: FINALISED_RED, size: 40, style: {} };
DisabledIcon.propTypes = {
  style: PropTypes.object,
  color: PropTypes.string,
  size: PropTypes.number,
};

export const SnowflakeIcon = ({ size, style, color }) => (
  <FA5Icon size={size} style={style} color={color} name="snowflake" />
);
SnowflakeIcon.defaultProps = { size: 20, style: {}, color: SUSSOL_ORANGE };
SnowflakeIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const SyringeIcon = ({ size, style, color }) => (
  <FA5Icon size={size} style={style} color={color} name="syringe" />
);
SyringeIcon.defaultProps = { size: 20, style: {}, color: SUSSOL_ORANGE };
SyringeIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const DollarIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="dollar" />
);
DollarIcon.defaultProps = { size: 20, style: {}, color: SUSSOL_ORANGE };
DollarIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const ClockIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="clock-o" />
);
ClockIcon.defaultProps = { size: 20, style: {}, color: WHITE };
ClockIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const EyeIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="eye" />
);
EyeIcon.defaultProps = { size: 30, style: {}, color: SUSSOL_ORANGE };
EyeIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};

export const EyeSlashIcon = ({ size, style, color }) => (
  <FAIcon size={size} style={style} color={color} name="eye-slash" />
);
EyeSlashIcon.defaultProps = { size: 30, style: {}, color: SUSSOL_ORANGE };
EyeSlashIcon.propTypes = {
  size: PropTypes.number,
  style: PropTypes.object,
  color: PropTypes.string,
};
