import { selectSpecificEntityState } from './index';

export const selectNewConfigs = state => {
  const configState = selectSpecificEntityState(state, 'temperatureBreachConfiguration');
  const { byId, newIds } = configState;
  return newIds.map(id => byId[id]);
};

export const selectEditingConfigs = state => {
  const configState = selectSpecificEntityState(state, 'temperatureBreachConfiguration');
  const { byId, editingIds } = configState;
  return editingIds.map(id => byId[id]);
};

export const selectEditingConfigsByType = state => {
  const newConfigs = selectEditingConfigs(state);

  return newConfigs.reduce(
    (acc, config) => ({
      ...acc,
      [config?.type]: config,
    }),
    {}
  );
};

export const selectEditingConfigThresholds = state => {
  const editingConfigs = selectEditingConfigsByType(state);
  const {
    HOT_CONSECUTIVE: hotConsecutiveConfig = {},
    COLD_CONSECUTIVE: coldConsecutiveConfig = {},
    HOT_CUMULATIVE: hotCumulativeConfig = {},
    COLD_CUMULATIVE: coldCumulativeConfig = {},
  } = editingConfigs;

  const coldConsecutiveThreshold = (hotConsecutiveConfig.minimumTemperature ?? 0) - 0.5;
  const hotConsecutiveThreshold = (coldConsecutiveConfig.maximumTemperature ?? 0) + 0.5;

  const coldCumulativeThreshold = (hotCumulativeConfig.minimumTemperature ?? 0) - 0.5;
  const hotCumulativeThreshold = (coldCumulativeConfig.maximumTemperature ?? 0) + 0.5;

  return {
    coldConsecutiveThreshold,
    hotConsecutiveThreshold,
    hotCumulativeThreshold,
    coldCumulativeThreshold,
  };
};

export const selectNewConfigsByType = state => {
  const newConfigs = selectNewConfigs(state);

  return newConfigs.reduce(
    (acc, config) => ({
      ...acc,
      [config?.type]: config,
    }),
    {}
  );
};

export const selectNewConfigThresholds = state => {
  const newConfigs = selectNewConfigsByType(state);
  const {
    HOT_CONSECUTIVE: hotConsecutiveConfig = {},
    COLD_CONSECUTIVE: coldConsecutiveConfig = {},
    HOT_CUMULATIVE: hotCumulativeConfig = {},
    COLD_CUMULATIVE: coldCumulativeConfig = {},
  } = newConfigs;

  const coldConsecutiveThreshold = (hotConsecutiveConfig.minimumTemperature ?? 0) - 0.1;
  const hotConsecutiveThreshold = (coldConsecutiveConfig.maximumTemperature ?? 0) + 0.1;

  const coldCumulativeThreshold = (hotCumulativeConfig.minimumTemperature ?? 0) - 0.1;
  const hotCumulativeThreshold = (coldCumulativeConfig.maximumTemperature ?? 0) + 0.1;

  return {
    coldConsecutiveThreshold,
    hotConsecutiveThreshold,
    hotCumulativeThreshold,
    coldCumulativeThreshold,
  };
};
