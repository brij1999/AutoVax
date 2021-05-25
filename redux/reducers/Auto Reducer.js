import {
	SET_TOKEN_BOT_GO,
	SET_AUTO_BOT_GO,
	SET_BENEFICIARIES,
	SET_BOOKING_PARAMS,
	SET_SLOT_INTERVAL_ID,
	SET_SLOT_DETAILS,
	SET_BOOKING,
	SET_STATUS,
} from '../types';

const initialState = {
	tokenBotGo: false,
	autoBotGo: false,
	beneficiaries: null,
	bookingParams: null,
	slotIntervalId: null,
	available: [],
	count: 0,
	session: null,
	booking: null,
	status: 'Set Preferences to Continue.',
	statusColor: '#333',
};

export default function(state = initialState, action) {
    switch (action.type) {
		case SET_TOKEN_BOT_GO:
			return {
				...state,
				tokenBotGo: action.payload,
			};

		case SET_AUTO_BOT_GO:
			return {
				...state,
				autoBotGo: action.payload,
			};

		case SET_BENEFICIARIES:
			return {
				...state,
				beneficiaries: action.payload,
			};

		case SET_BOOKING_PARAMS:
			return {
				...state,
				bookingParams: action.payload,
			};

		case SET_SLOT_INTERVAL_ID:
			return {
				...state,
				slotIntervalId: action.payload,
			};

		case SET_SLOT_DETAILS:
			return {
				...state,
				...action.payload,
			};

		case SET_BOOKING:
			return {
				...state,
				booking: action.payload,
			};

		case SET_STATUS:
			return {
				...state,
				status: action.payload.msg,
				statusColor: action.payload.color,
			};

		default:
			return state;
	}
}
