import { combineReducers } from 'redux';
import userReducer from './User Reducer';
import autoReducer from './Auto Reducer';
import errorReducer from './Error Reducer';

export default combineReducers({
	user: userReducer,
	auto: autoReducer,
	error: errorReducer,
});