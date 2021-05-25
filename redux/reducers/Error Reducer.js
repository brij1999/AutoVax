import { ERROR, RESET_ERROR } from '../types';

const initialState = {
    msg: null,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case ERROR:
            return {
                ...state,
                ...action.payload,
            };

        case RESET_ERROR:
            return initialState;

        default:
            return state;
    }
}
