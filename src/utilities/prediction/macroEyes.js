/**
 *
 * Macro-Eyes utilities
 *
 * - Fetch suggested values from API
 * - Update suggested values in requisition item list
 *
 */
import { useEffect, useState } from 'react';

import { UIDatabase } from '../../database';
import { SETTINGS_KEYS } from '../../settings';

const API_URL = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_URL);
const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);

export const useMEPrediction = items => {
  const [itemList, setItemList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async () => {
    const config = {
      method: 'GET',
      headers: {
        authorization: API_KEY,
      },
      body: JSON.stringify(itemList),
    };

    // TODO: Retry logic here
    // TODO: Fetch API
    const data = await fetch(`${API_URL}/v1/`, config);

    return data.json();
  };

  useEffect(() => {
    setItemList(items);
  }, [items]);

  // TODO: Replace with useCallback
  useEffect(() => {
    if (itemList.length > 0) {
      setSuggestions(fetchSuggestions(itemList));
    }
  }, [itemList]);

  return suggestions;
};

// export const updateRequisitionItemList = (requisitionItem, suggestionObject) => {};
