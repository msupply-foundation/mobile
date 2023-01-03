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

const API_URL = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL);
const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);

export const useMEPrediction = item => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  const storeId = item?.supplying_store_id;
  const params = new URLSearchParams(item).toString();
  const url = `${API_URL}/forecast/suggested-quantities/${storeId}?${params}`;

  useEffect(() => {
    setLoading(true);

    const fetchSuggestions = async () => {
      // TODO: Retry logic here
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            authorization: API_KEY,
          },
        });

        const json = await response.json();
        setData(json);
      } catch (error) {
        setData({
          error: true,
          message: 'Could not fetch data',
        });
      }

      setLoading(false);
    };

    fetchSuggestions();
  }, [url]);

  return { data, loading };
};

// export const updateRequisitionItemList = (requisitionItem, suggestionObject) => {};
