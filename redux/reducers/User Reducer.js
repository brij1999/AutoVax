import {
	SET_USER_PREFS,
	UNSET_USER_PREFS,
	SET_USER_AUTH,
	UNSET_USER_AUTH,
	SET_TOKEN_INTERVAL_ID,
	SET_SELECTED_DATE,
	SET_FIREBASE_TOKEN,
} from '../types';

const initialState = {
	auth: {
		token: null,
		timestamp: null,
		tokenIntervalId: null,
		prevTimestamp: null,
	},
	name: null,
	mobile: null,
	is45Plus: false,
	dose: 1,
	state: null,
	district: null,
	pin: null,
	prefferedVaccine: null,
	fees: null,
	prefferedTime: 1,
	uniqueID: null,
	date: null,
	set: 0,
	firebaseToken: null,
};

export default function(state = initialState, action) {
    switch (action.type) {
		case SET_TOKEN_INTERVAL_ID:
			return {
				...state,
				auth: { ...state.auth, tokenIntervalId: action.payload },
			};

		case SET_USER_AUTH:
			return {
				...state,
				auth: { ...state.auth, ...action.payload },
			};

		case UNSET_USER_AUTH:
			return {
				...state,
				auth: {
					...initialState.auth,
					prevTimestamp: state.auth.timestamp,
				},
			};

		case SET_USER_PREFS:
			return {
				...state,
				...action.payload,
				set: 1,
			};

		case SET_SELECTED_DATE:
			return {
				...state,
				date: action.payload,
			};

		case SET_FIREBASE_TOKEN:
			return {
				...state,
				firebaseToken: action.payload,
			};

		case UNSET_USER_PREFS:
			return initialState;

		default:
			return state;
	}
}
