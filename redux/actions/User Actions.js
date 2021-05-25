import axios from 'axios';
import isEmpty from '../../utils/isEmpty';
import {
	SET_USER_PREFS,
	UNSET_USER_PREFS,
	SET_USER_AUTH,
	UNSET_USER_AUTH,
	SET_TOKEN_INTERVAL_ID,
	SET_SELECTED_DATE,
	SET_FIREBASE_TOKEN,
} from '../types';

export const setTokenIntervalId = (val) => (dispatch, getState) => {
	dispatch({ type: SET_TOKEN_INTERVAL_ID, payload: val });
};

export const setUserPrefs = (prefs) => (dispatch, getState) => {
	dispatch({ type: SET_USER_PREFS, payload: prefs });
};

export const unsetUserPrefs = () => (dispatch, getState) => {
	dispatch({ type: UNSET_USER_PREFS });
};

export const setUserAuth = (auth) => (dispatch, getState) => {
	dispatch({ type: SET_USER_AUTH, payload: auth });
};

export const unsetUserAuth = () => (dispatch, getState) => {
	dispatch({ type: UNSET_USER_AUTH });
};

export const setSelectedDate = (date) => (dispatch, getState) => {
	dispatch({ type: SET_SELECTED_DATE, payload: date });
};

export const setFirebaseToken = (token) => (dispatch, getState) => {
	dispatch({ type: SET_FIREBASE_TOKEN, payload: token });
};
