/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';
import { PRESCRIPTION_ACTIONS } from '../actions/PrescriptionActions';

const initialState = () => ({
  currentTab: 0,
  transaction: null,
  items: UIDatabase.objects('Item').filtered('isVaccine != true'),
  itemSearchTerm: '',
  commentModalOpen: false,
});

export const PrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'NAVIGATE': {
      const { payload } = action;
      const { name, params } = payload;

      if (name !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;

      return { ...state, transaction };
    }

    case PRESCRIPTION_ACTIONS.REFRESH: {
      return { ...state };
    }

    case PRESCRIPTION_ACTIONS.FILTER: {
      const { payload } = action;
      const { itemSearchTerm } = payload;

      return { ...state, itemSearchTerm };
    }

    case PRESCRIPTION_ACTIONS.OPEN_COMMENT_MODAL: {
      return { ...state, commentModalOpen: true };
    }

    case PRESCRIPTION_ACTIONS.CLOSE_COMMENT_MODAL: {
      return { ...state, commentModalOpen: false };
    }

    case PRESCRIPTION_ACTIONS.DELETE:
      return { ...state, transaction: null };

    default: {
      return state;
    }
  }
};
