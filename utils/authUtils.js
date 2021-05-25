import axios from 'axios';
import { store } from '../redux/store';
import isEmpty from './isEmpty';
import { unsetUserAuth } from '../redux/actions/User Actions';

export const authTokenPresent = () => {
    const state = store.getState();
	try {
		const token = state.user.auth.token;
		const timestamp = state.user.auth.timestamp;
        if(!isEmpty(token)) {
            const diff = Math.round((new Date().getTime() - timestamp) / (60 * 1000));
			if (diff < 15) {
				setAuthToken(token);
				return true;
			}
        }
		setAuthToken(false);
        store.dispatch(unsetUserAuth());
		return false;
	} catch (error) {
		setAuthToken(false);
        store.dispatch(unsetUserAuth());
		return false;
	}
};

export const setAuthToken = (token) => {
	if (token) {
		//apply token to every request's header
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		console.log('\n----------: AUTH TOKEN SET :----------\n', `Bearer ${token}`, '\n------------------\n');
	}
	//delete the auth. field from header
	else delete axios.defaults.headers.common['Authorization'];
};
