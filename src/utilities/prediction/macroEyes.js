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

const API_URL = 'http://192.168.0.100:8000';
// const API_URL =
//   UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL) ||
//   'http://civapitest.dev.macro-eyes.com';

const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);

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
  }, [API_URL, retries, retryCount]);

  return { MEData: data, loading, retries };
};

/**
 *
 * Non-hook implementation for fetching suggestions
 *
 */
export const getMEPrediction = requestObj => {
  if (!API_URL || !API_KEY) {
    return Promise.resolve({
      error: true,
      message: 'Provide valid API credentials',
    });
  }

  const { supplying_store_id, items } = requestObj;

  if (supplying_store_id === undefined || items.length === 0) {
    return Promise.resolve({
      error: true,
      message: 'Provide valid item object',
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
 */
export const updatePredictedQuantity = (itemCode, quantity) => {
  const item =
    UIDatabase.objects('RequisitionItem').filtered('item.code == $0', itemCode)?.[0] || {};

  if (item?.id) {
    UIDatabase.write(() => {
      UIDatabase.update('RequisitionItem', {
        id: item?.id,
        predictedQuantity: quantity,
      });
    });
  }
};
