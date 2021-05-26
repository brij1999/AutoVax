import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';
import otpFetchService from './otpFetchService';
import isEmpty from '../utils/isEmpty';
import { authTokenPresent, setAuthToken } from '../utils/authUtils';
import floatingNotify from '../utils/floatingNotify';
import { API_GENERATE_OTP, API_CONFIRM_OTP, API_SECRET, API_BENEFICIARIES, TOKEN_FETCH_INTERVAL } from '../ENV';
import { store } from '../redux/store';
import { setUserAuth, setTokenIntervalId, unsetUserAuth } from '../redux/actions/User Actions';

export const deployTokenBot = async () => {
	const state = store.getState();
	try {
		if (!state.auto.tokenBotGo) return;
		console.log('>>> Deploying Token Bot.');
        await getToken();
		const tokenIntervalId = BackgroundTimer.setInterval(getToken, TOKEN_FETCH_INTERVAL * 60 * 1000);
		store.dispatch(setTokenIntervalId(tokenIntervalId));
	} catch (error) {
		console.log('Error <deployTokenBot>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

export const haltTokenBot = () => {
	const state = store.getState();
	try {
		if (state.auto.tokenBotGo) return;
		console.log('>>> Halting Token Bot.');
        BackgroundTimer.clearInterval(state.user.auth.tokenIntervalId);
		store.dispatch(setTokenIntervalId(null));
		store.dispatch(unsetUserAuth());
        setAuthToken(false);
	} catch (error) {
		console.log('Error <deployTokenBot>:\n', error, '\n', error.stack);
		// floatingNotify('Something Went Wrong!');
	}
};

const getToken = async () => {
	const state = store.getState();
	try {
		const prefs = state.user;
		const genRes = await axios.post(API_GENERATE_OTP, { mobile: prefs.mobile, secret: API_SECRET });
		const txnId = genRes.data.txnId;
		const otp = SHA256(await otpFetchService()).toString();

		console.log('Starting Verification\n', { txnId, otp });
		await axios.options(API_CONFIRM_OTP, {
			headers: {
				pragma: 'no-cache',
				'cache-control': 'no-cache',
				accept: '*/*',
				'access-control-request-method': 'POST',
				'access-control-request-headers': 'content-type',
				origin: 'https://selfregistration.cowin.gov.in',
				'user-agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'cross-site',
				'sec-fetch-dest': 'empty',
				referer: 'https://selfregistration.cowin.gov.in/',
				'accept-encoding': 'gzip, deflate, br',
				'accept-language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
			},
		});
		const cnfRes = await axios.post(
			API_CONFIRM_OTP,
			{ txnId, otp },
			{
				headers: {
					pragma: 'no-cache',
					'cache-control': 'no-cache',
					'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
					accept: 'application/json, text/plain, */*',
					dnt: '1',
					'sec-ch-ua-mobile': '?0',
					'user-agent':
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
					'content-type': 'application/json',
					origin: 'https://selfregistration.cowin.gov.in',
					'sec-fetch-site': 'cross-site',
					'sec-fetch-mode': 'cors',
					'sec-fetch-dest': 'empty',
					referer: 'https://selfregistration.cowin.gov.in/',
					'accept-encoding': 'gzip, deflate, br',
					'accept-language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
				},
			},
		);
		const token = cnfRes.data.token;
		console.log('Completed Verification\n', { token });
		const timestamp = new Date().getTime();
		setAuthToken(token);
		store.dispatch(setUserAuth({ token, timestamp }));
	} catch (error) {
		console.log('Error <getToken>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};
