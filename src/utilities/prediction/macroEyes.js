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

const TIMEOUT_MS = 10 * 1000;

export const useMEPrediction = ({ item, retryCount = 3, timeout = TIMEOUT_MS }) => {
  const [loading, setLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const [data, setData] = useState({});

  const storeId = item?.supplying_store_id;
  const params = new URLSearchParams(item).toString();
  const url = `${API_URL}/forecast/suggested-quantities/${storeId}?${params}`;

  useEffect(() => {
    if (!url) return;

    const triggerRetry = () => setRetries(prevRetries => prevRetries + 1);

    const fetchSuggestions = async () => {
      const controller = new AbortController();
      const requestTimeout = setTimeout(() => controller.abort(), timeout);

      setLoading(true);
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            authorization: API_KEY,
          },
          signal: controller.signal,
        });

        /**
         *
         * Retry when status code is not OK or errored out
         *
         * */
        if (!response.ok) {
          triggerRetry();
        } else {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        triggerRetry();
        setData({
          error: true,
          message: 'Could not complete request',
        });
      } finally {
        clearTimeout(requestTimeout);
        setLoading(false);
      }
    };

    if (retries < retryCount) {
      fetchSuggestions();
    } else {
      setData({
        error: true,
        message: 'Could not fetch data',
      });
    }
  }, [url, retries, retryCount]);

  return { data, loading, retries };
};

// export const updateRequisitionItemList = (requisitionItem, suggestionObject) => {};
