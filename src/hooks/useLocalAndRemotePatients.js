import { useEffect, useReducer } from 'react';
import moment from 'moment';
import unionBy from 'lodash.unionby';
import { UIDatabase } from '../database/index';
import {
  getAuthorizationHeader,
  getPatientRequestUrl,
  getServerURL,
  processPatientResponse,
} from '../sync/lookupApiUtils';
import { DATE_FORMAT } from '../utilities/constants';
import { useFetch } from './useFetch';
import { useThrottled } from './useThrottled';

const RNFetch = fetch;
const BATCH_SIZE = 50;

const initialState = (initialValue = []) => ({
  data: initialValue,
  loading: false,
  error: false,
  searchedWithNoResults: false,
  gettingMore: false,
  noMore: true,
  limit: BATCH_SIZE,
  offset: 0,
});

const reducer = (state, action) => {
  const { type } = action;

  switch (type) {
    case 'fetch_more': {
      const { limit, offset } = state;
      const newOffset = offset + limit;

      return { ...state, offset: newOffset };
    }

    case 'fetch_success': {
      const { payload } = action;
      const { data } = payload;

      return { ...state, data: data ?? [], loading: false, searchedWithNoResults: false };
    }
    case 'fetch_start': {
      const { loading } = state;

      if (loading) return state;

      return { ...state, loading: true, data: [], searchedWithNoResults: false, noMore: false };
    }
    case 'fetch_no_results': {
      return { ...state, data: [], searchedWithNoResults: true, loading: false };
    }

    case 'fetch_error': {
      const { payload } = action;
      const { error } = payload;

      return { ...state, error, loading: false, searchedWithNoResults: false };
    }

    case 'getting_more_patients': {
      return { ...state, gettingMore: true };
    }

    case 'add_more_patients': {
      const { payload } = action;
      const { data } = payload;

      const { offset, data: oldData } = state;
      const newData = unionBy(data, oldData, 'id');
      const newOffset = offset + BATCH_SIZE;

      return { ...state, data: newData, offset: newOffset, gettingMore: false };
    }

    case 'no_more_patients': {
      return { ...state, gettingMore: false, noMore: true };
    }

    case 'clear': {
      return initialState();
    }
    default: {
      return state;
    }
  }
};

/**
 * Hook to help a component to be able to find patients in the local database or through the
 * patient lookup API.
 *
 * Merges the states such that there is a single state value for 'data', 'loading' etc, rather than
 * having to track multiple.
 */
export const useLocalAndRemotePatients = (initialValue = []) => {
  const [
    { data, loading, searchedWithNoResults, error, limit, offset, gettingMore, noMore },
    dispatch,
  ] = useReducer(reducer, initialValue, initialState);

  const { fetch, refresh, isLoading, response, error: fetchError } = useFetch(getServerURL());

  // If response is empty, we are not loading, and there is no error,
  // then we have tried to fetch and had no results.
  // Has fetched guards against the initial state of not loading and a response being empty.
  useEffect(() => {
    const noResults = fetchError?.message === 'No records found';
    if (noResults) {
      dispatch({ type: 'fetch_no_results' });
    }
  }, [fetchError]);

  // When isLoading is set as true, sync this with our merged state.
  useEffect(() => {
    if (isLoading) dispatch({ type: 'fetch_start' });
  }, [isLoading]);

  // When response changes and we have a new response, assign this as our set of data, merging
  // with our combined state.
  useEffect(() => {
    if (response) dispatch({ type: 'fetch_success', payload: { data: response } });
  }, [response]);

  // Synchronizing this error with our merged state.
  useEffect(() => {
    if (fetchError && fetchError.message !== 'No records found') {
      dispatch({ type: 'fetch_error', payload: { error: fetchError } });
    }
  }, [fetchError]);

  const onPressSearchOnline = searchParams => {
    const paramsWithLimits = { ...searchParams, limit: BATCH_SIZE, offset: 0 };

    dispatch({ type: 'clear' });
    refresh();
    dispatch({ type: 'fetch_start' });

    fetch(
      getPatientRequestUrl(paramsWithLimits),
      { headers: { authorization: getAuthorizationHeader() } },
      { responseHandler: processPatientResponse }
    );
    dispatch({ type: 'fetch_more' });
  };

  const getMorePatients = async searchParams => {
    if (!response || noMore) return;

    dispatch({ type: 'getting_more_patients' });
    const paramsWithLimits = { ...searchParams, limit, offset };

    // Use RNFetch as the fetch returned from `useFetch` is coupled with it's state in a specific
    // implementation, which we want to change by appending to the result, rather than replacing.
    const getMoreResponse = await RNFetch(
      `${getServerURL()}${getPatientRequestUrl(paramsWithLimits)}`,
      {
        headers: { authorization: getAuthorizationHeader() },
      }
    );

    try {
      const morePatients = processPatientResponse({
        ...getMoreResponse,
        json: await getMoreResponse.json(),
      });
      dispatch({
        type: 'add_more_patients',
        payload: {
          data: morePatients,
        },
      });
    } catch {
      dispatch({ type: 'no_more_patients' });
    }
  };

  const getLocalPatients = searchParameters => {
    refresh();

    const { lastName = '', firstName = '', dateOfBirth } = searchParameters;
    if (!(lastName || firstName || dateOfBirth)) {
      return dispatch({ type: 'clear' });
    }
    dispatch({ type: 'fetch_start' });

    const query = 'isDeleted == false AND lastName BEGINSWITH[c] $0 AND firstName BEGINSWITH[c] $1';
    let patients = UIDatabase.objects('Patient').filtered(query, lastName, firstName);

    if (dateOfBirth) {
      const dob = moment(dateOfBirth, DATE_FORMAT.DD_MM_YYYY, null, true);
      if (!dob.isValid()) {
        return dispatch({ type: 'fetch_no_results' });
      }

      const dayOfDOB = dob.startOf('day').toDate();
      const dayAfterDOB = dob.endOf('day').toDate();

      patients = patients.filtered('dateOfBirth >= $0 AND dateOfBirth < $1', dayOfDOB, dayAfterDOB);
    }

    if (patients.length) {
      return dispatch({
        type: 'fetch_success',
        payload: {
          data: patients.sorted('lastName'),
        },
      });
    }

    return dispatch({ type: 'fetch_no_results' });
  };

  // Throttle the get local patients such that the method will only be called 1/2 a second
  // after the last invocation, so when typing there is not constant queries happening each
  // press as there are potentially 100,00's of thousands of patients.
  const throttledGetLocalPatients = useThrottled(getLocalPatients, 500, [], {
    leading: false,
    trailing: true,
  });

  const throttledGetMorePatients = useThrottled(
    getMorePatients,
    1000,
    [limit, offset, response, noMore],
    {
      loading: false,
      trailing: true,
    }
  );

  const throttledSearchOnline = useThrottled(onPressSearchOnline, 500, []);

  // getLocalPatients is throttled- ensure that the fetch_start action is still dispatched
  // on the first invocation so the loading state is changed.
  const getLocalPatientsWrapper = searchParameters => {
    dispatch({ type: 'fetch_start' });
    throttledGetLocalPatients(searchParameters);
  };

  return [
    { data, loading, searchedWithNoResults, error, gettingMore },
    throttledSearchOnline,
    getLocalPatientsWrapper,
    throttledGetMorePatients,
  ];
};
