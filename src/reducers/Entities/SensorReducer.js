import { SENSOR_ACTIONS } from '../../actions/Entities/SensorActions';
import { UIDatabase } from '../../database';
import { ROUTES } from '../../navigation/index';

const initialState = () => ({
  byId: UIDatabase.objects('Sensor').reduce(
    (acc, sensor) => ({
      ...acc,
      [sensor.id]: sensor,
    }),
    {}
  ),
  newId: '',
  editingId: '',
});

export const SensorReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { params, routeName } = action;

      if (routeName !== ROUTES.SENSOR_EDIT) return state;
      const { sensor } = params;
      const { id } = sensor;

      return { ...state, editingId: id };
    }

    case SENSOR_ACTIONS.CREATE: {
      const { byId } = state;
      const { payload } = action;
      const { id } = payload;

      return { ...state, byId: { ...byId, [id]: payload }, newId: id };
    }

    case SENSOR_ACTIONS.RESET_NEW: {
      const { byId, newId } = state;
      const newById = { ...byId, [newId]: null };
      return { ...state, byId: newById, newId: '' };
    }

    case SENSOR_ACTIONS.SAVE_NEW: {
      const { byId } = state;
      const { payload } = action;
      const { sensor } = payload;
      const { id } = sensor;

      const newById = { ...byId, [id]: sensor };

      return { ...state, byId: newById, newId: '' };
    }

    case SENSOR_ACTIONS.UPDATE: {
      const { byId } = state;
      const { payload } = action;
      const { id, field, value } = payload;

      if (field === 'name' && value?.length > 50) return state;
      if (field === 'code' && value?.length > 10) return state;

      const newSensorState = { ...byId[id], [field]: value };
      const newById = { ...byId, [id]: newSensorState };

      return { ...state, byId: newById };
    }

    default: {
      return state;
    }
  }
};