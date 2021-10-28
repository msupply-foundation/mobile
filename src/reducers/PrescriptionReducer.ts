/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';
import { PRESCRIPTION_ACTIONS } from '../actions/PrescriptionActions';

const fetchItems = () => UIDatabase.objects('Item').filtered('isVaccine != true').slice();

export type PrescriptionState = {
  currentTab: number;
  transaction: unknown | null;
  items: unknown[];
  itemSearchTerm: string;
  commentModalOpen: boolean;
};

type PrescriptionAction = any;

const initialState = (): PrescriptionState => ({
  currentTab: 0,
  transaction: null,
  items: fetchItems(),
  itemSearchTerm: '',
  commentModalOpen: false,
});

export const PrescriptionReducer = (
  state: PrescriptionState = initialState(),
  action: PrescriptionAction
): PrescriptionState => {
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

    case PRESCRIPTION_ACTIONS.RELOAD_ITEMS: {
      return {
        ...state,
        items: fetchItems(),
      };
    }

    default: {
      return state;
    }
  }
};
