import axios from 'axios';
import isEmpty from '../../utils/isEmpty';
import {
	SET_BENEFICIARIES,
	SET_BOOKING_PARAMS,
	SET_SLOT_INTERVAL_ID,
	SET_SLOT_DETAILS,
	SET_STATUS,
    SET_BOOKING,
	SET_TOKEN_BOT_GO,
	SET_AUTO_BOT_GO,
} from '../types';

export const setTokenBotGo = (val) => (dispatch, getState) => {
	dispatch({ type: SET_TOKEN_BOT_GO, payload: val });
};

export const setAutoBotGo = (val) => (dispatch, getState) => {
	dispatch({ type: SET_AUTO_BOT_GO, payload: val });
};

export const setBeneficiaries = (ben) => (dispatch, getState) => {
	dispatch({ type: SET_BENEFICIARIES, payload: ben });
};

export const setBookingParams = (params) => (dispatch, getState) => {
	dispatch({ type: SET_BOOKING_PARAMS, payload: params });
};

export const setSlotIntervalId = (id) => (dispatch, getState) => {
	dispatch({ type: SET_SLOT_INTERVAL_ID, payload: id });
};

export const setSlotDetails = (count, available, session) => (dispatch, getState) => {
	dispatch({ type: SET_SLOT_DETAILS, payload: { count, available, session } });
};

export const setBooking = (val) => (dispatch, getState) => {
	dispatch({ type: SET_BOOKING, payload: val });
};

export const setStatus =
	(msg, code = '') =>
	(dispatch, getState) => {
		let color = '';
		switch (code) {
			case 'R':
				color = '#D2222D';
				break;
			case 'G':
				color = '#28CC2D';
				break;
			case 'B':
				color = '#3581D8';
				break;
			default:
				color = '#333';
		}
		dispatch({ type: SET_STATUS, payload: { msg, color } });
	};
