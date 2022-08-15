import { NAME_NOTE_ACTIONS } from '../../actions/Entities';

const initialState = () => ({
  creating: {
    id: '',
    data: {},
    patientEventID: '',
    nameID: '',
    entryDate: 0,
    isDeleted: false,
  },
  isValid: false,
});

export const NameNoteReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case NAME_NOTE_ACTIONS.RESET:
    case 'GO_BACK': {
      // reset if heading back
      return initialState();
    }

    case NAME_NOTE_ACTIONS.SELECT: {
      const { payload } = action;
      const { nameNote, isValid } = payload;

      return {
        ...state,
        creating: nameNote,
        isValid,
      };
    }

    case NAME_NOTE_ACTIONS.UPDATE_DATA: {
      const { payload } = action;
      const { data, isValid } = payload;
      const { creating } = state;
      const { data: currentData } = creating;

      const newIsValid = isValid;
      const newData = { ...currentData, ...data };
      const newCreating = { ...creating, data: newData };

      return { ...state, creating: newCreating, isValid: newIsValid };
    }

    default: {
      return state;
    }
  }
};
