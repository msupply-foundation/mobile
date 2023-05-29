/**
 *
 * Macro-Eyes utilities
 *
 * - Fetch suggested values from API
 * - Update suggested values in requisition item list
 *
 */
import { ToastAndroid } from 'react-native';
import { useEffect, useState } from 'react';

import { UIDatabase } from '../../database';
import { SETTINGS_KEYS } from '../../settings';
import { programStrings } from '../../localization';

const RETRY_COUNT = 3;
const TIMEOUT_MS = 10 * 1000;

/**
 *
 * Fetches suggested quantities using React hooks
 *
 */
export const useMEPrediction = ({ item, retryCount = 3, timeout = TIMEOUT_MS }) => {
  const [loading, setLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const [data, setData] = useState({});

  useEffect(() => {
    const API_URL =
      UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL) ||
      'http://civapi.dev.macro-eyes.com';

    const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);

    if (!API_URL || !API_KEY) return;

    // Build url string from parameters
    const storeId = item?.supplying_store_id;
    const params = new URLSearchParams(item).toString();
    const url = `${API_URL}/forecast/suggested-quantities/${storeId}?${params}`;

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
  }, [retries, retryCount]);

  return { MEData: data, loading, retries };
};

/**
 *
 * Non-hook implementation for fetching suggestions
 *
 */
export const getMEPrediction = requestObj => {
  const API_URL =
    UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL) ||
    'http://civapi.dev.macro-eyes.com';

  const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);
  if (!API_URL || !API_KEY) {
    return Promise.resolve({
      error: true,
      message: 'ME API credentials not found',
    });
  }
  ToastAndroid.show(programStrings.ai_predictions_fetching_suggestions, ToastAndroid.SHORT);

  const { supplying_store_id } = requestObj;

  if (supplying_store_id === undefined) {
    return Promise.resolve({
      error: true,
      message: 'Supplying store is required',
    });
  }

  const url = `${API_URL}/forecast/suggested-quantities`;

  const retry = (fn, retries = RETRY_COUNT, interval = TIMEOUT_MS) =>
    new Promise((resolve, reject) => {
      fn()
        .then(resolve)
        .catch(error => {
          setTimeout(() => {
            if (retries > 0) {
              retry(fn, retries - 1, interval).then(resolve, reject);
            } else {
              reject(error);
            }
          }, interval);
        });
    });

  const fetchSuggestions = async () => {
    const controller = new AbortController();

    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestObj),
      signal: controller.signal,
    })
      .then(response => response.json())
      .catch(error => ({
        error: true,
        message: 'Error fetching suggestions',
        stack: error.message,
      }));
  };

  return retry(fetchSuggestions);
};

/**
 *
 * Update the RequisitionItem object with prediction values
 *
 * For each item returned, get the item_code and suggested_quantity e.g.:
 *
 * { item_code: "AS0000", suggested_quantity: 20 }
 *
 */
export const updatePredictions = (requisitionId, items) => {
  if (items.length === 0) {
    return;
  }

  /**
   *
   * Get available items for specific requisition
   *
   * Fix using `snapshot()` to fix slow iteration issue on Realm:
   * https://github.com/realm/realm-js/issues/4436#issuecomment-1104971649
   *
   */
  const selection = UIDatabase.objects('RequisitionItem')
    .filtered('requisition.id == $0', requisitionId)
    .snapshot();

  const filterPrediction = itemCode => items.filter(item => item.item_code === itemCode);

  if (selection.length > 0) {
    UIDatabase.write(() => {
      selection.forEach(s => {
        const prediction = filterPrediction(s?.item?.code);

        /**
         * If no prediction available for an item, set predictedQuanity to -1, which triggers
         * fallback to the default calculated based on dailyUsage
         */
        s.predictedQuantity = prediction.length > 0 ? prediction?.[0]?.suggested_quantity : -1;
      });
    });
  }
};

/**
 * ME Logger
 *
 */
export const logME = (...args) => {
  console.log('ME_', args);
};
