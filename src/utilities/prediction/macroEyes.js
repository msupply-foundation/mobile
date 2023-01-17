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

const API_URL =
  // UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL) || 'http://192.168.0.102:8000';
  UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_URL) ||
  'http://civapitest.dev.macro-eyes.com';

const API_KEY = UIDatabase.getSetting(SETTINGS_KEYS.ME_PREDICTION_API_KEY);

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
export const getMEPrediction = (item, retryCount = 3, timeout = TIMEOUT_MS) => {
  const { supplying_store_id } = item;

  /**
   *
   * Build url parameters from the item object
   *
   */
  const params = new URLSearchParams(item).toString();
  const url = `${API_URL}/forecast/suggested-quantities/${supplying_store_id}?${params}`;

  if (!url) {
    return {
      error: true,
      message: 'Provide valid URL',
    };
  }

  const fetchSuggestions = async () => {
    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          authorization: API_KEY,
        },
        signal: controller.signal,
      });

      let data = {};

      /**
       *
       * Retry when status code is not OK or errored out
       *
       * */
      if (!response.ok) {
        data = {
          error: true,
          message: 'Request completed with error',
        };
      } else {
        data = await response.json();
      }
      return data;
    } catch (error) {
      return {
        error: true,
        message: 'Error processing request',
      };
    } finally {
      clearTimeout(requestTimeout);
    }
  };

  let response = {};

  for (let i = 0; i < retryCount; i++) {
    response = fetchSuggestions();

    if (response.error && i === retryCount - 1) {
      // console.log(`RETRY ${i + 1}`, response);
      response = {
        error: true,
        message: 'Could not fetch data',
      };
    }
  }

  return response;
};

/**
 *
 * Update database on changing suggested values
 *
 */
export const updateRequisitionItem = item => {
  console.log(item);
};
