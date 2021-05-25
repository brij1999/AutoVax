import SHA256 from 'crypto-js/sha256';
import axios from 'axios';
import otpFetchService from './otpFetchService';
import isEmpty from '../utils/isEmpty';
import { authTokenPresent, setAuthToken } from '../utils/authUtils';
import floatingNotify from '../utils/floatingNotify';
import { API_GENERATE_OTP, API_CONFIRM_OTP, API_SECRET, API_BENEFICIARIES } from '../ENV';
import { store } from '../redux/store';
import { setUserAuth, setTokenIntervalId, unsetUserAuth } from '../redux/actions/User Actions';

export const deployTokenBot = async () => {
	const state = store.getState();
    console.log('deploying token bot');
	try {
        if (!state.auto.tokenBotGo) return;
        let need = false;
        try {
            await axios.get(API_BENEFICIARIES);
        } catch (error) {
            need = true;
        }
		if (!authTokenPresent() || need) {
			const prefs = state.user;
			const genRes = await axios.post(API_GENERATE_OTP, { mobile: prefs.mobile, secret: API_SECRET });
			const txnId = genRes.data.txnId;
			const otp = SHA256(await otpFetchService()).toString();

            console.log('Starting Verification\n', { txnId, otp });
            await axios.options(API_CONFIRM_OTP, {
                headers: {
                    "pragma":"no-cache",
                    "cache-control":"no-cache",
                    "accept":"*/*",
                    "access-control-request-method":"POST",
                    "access-control-request-headers":"content-type",
                    "origin":"https://selfregistration.cowin.gov.in",
                    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                    "sec-fetch-mode":"cors",
                    "sec-fetch-site":"cross-site",
                    "sec-fetch-dest":"empty",
                    "referer":"https://selfregistration.cowin.gov.in/",
                    "accept-encoding":"gzip, deflate, br",
                    "accept-language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
                }
            });
			const cnfRes = await axios.post(API_CONFIRM_OTP, { txnId, otp }, {
                headers: {
                    "pragma":"no-cache",
                    "cache-control":"no-cache",
                    "sec-ch-ua":"\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                    "accept":"application/json, text/plain, */*",
                    "dnt":"1",
                    "sec-ch-ua-mobile":"?0",
                    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                    "content-type":"application/json",
                    "origin":"https://selfregistration.cowin.gov.in",
                    "sec-fetch-site":"cross-site",
                    "sec-fetch-mode":"cors",
                    "sec-fetch-dest":"empty",
                    "referer":"https://selfregistration.cowin.gov.in/",
                    "accept-encoding":"gzip, deflate, br",
                    "accept-language":"en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
                }
            });
			const token = cnfRes.data.token;
            console.log('Completed Verification\n', { token });
			const timestamp = new Date().getTime();
			setAuthToken(token);
			store.dispatch(setUserAuth({ token, timestamp }));
		}
		checkTokenLoop();
	} catch (error) {
		console.log('Error <deployTokenBot>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

const checkTokenLoop = async () => {
	const state = store.getState();
	try {
		if (!isEmpty(state.user.auth.tokenIntervalId)) return;
		await checkToken();
		const tokenIntervalId = setInterval(checkToken, 60 * 1000);
		store.dispatch(setTokenIntervalId(tokenIntervalId));
	} catch (error) {
		console.log('Error <checkTokenLoop>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

const checkToken = async () => {
	const state = store.getState();
	try {
		if (!authTokenPresent()) return;
		const timestamp = state.user.auth.timestamp;
		const diff = Math.round((new Date().getTime() - timestamp) / (60 * 1000));
		console.log({ diff });
		if (diff < 5) return;
		removeToken();
		deployTokenBot();
	} catch (error) {
		console.log('Error <checkToken>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

export const removeToken = () => {
	const state = store.getState();
	try {
		const tokenIntervalId = state.user.auth.tokenIntervalId;
		clearInterval(tokenIntervalId);
		setAuthToken(false);
		store.dispatch(unsetUserAuth());
	} catch (error) {
		console.log('Error <removeToken>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};
