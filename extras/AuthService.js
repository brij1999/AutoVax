import BackgroundService from 'react-native-background-actions';
import SHA256 from 'crypto-js/sha256';
import axios from 'axios';
import otpFetchService from '../scripts/otpFetchService';
import isEmpty from '../utils/isEmpty';
import { authTokenPresent, setAuthToken } from '../utils/authUtils';
import floatingNotify from '../utils/floatingNotify';
import { API_GENERATE_OTP, API_CONFIRM_OTP, API_SECRET } from '../ENV';
import { store } from '../redux/store';
import { setUserAuth, setTokenIntervalId, unsetUserAuth, setTokenBotGo } from '../redux/actions/User Actions';
import { setStatus } from '../redux/actions/Auto Actions';

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const getRandomInt = () => Math.floor(Math.random() * 100);
let serviceResolve = null;
let serviceReject = null;

const startService = async (taskDataArguments) => {
	const state = store.getState();

	await new Promise(async (resolve, reject) => {
		if (!state.user.auth.tokenBotGo) resolve();
        serviceResolve = resolve;
		serviceReject = reject;
		await deployTokenBot();
	});
};

const deployTokenBot = async () => {
    const state = store.getState();
    try {
		if (!(await authTokenPresent())) {
			const prefs = state.user;
			const genRes = await axios.post(API_GENERATE_OTP, { mobile: prefs.mobile, secret: API_SECRET });
			const txnId = genRes.data.txnId;
			const otp = SHA256(await otpFetchService()).toString();

			const cnfRes = await axios.post(API_CONFIRM_OTP, { txnId, otp });
			const token = cnfRes.data.token;
			const timestamp = new Date().getTime();
			setAuthToken(token);
			store.dispatch(setUserAuth({ token, timestamp }));
		}
		checkTokenLoop();
	} catch (error) {
		console.log('Error <deployTokenBot>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        serviceReject();
	}
};

const checkTokenLoop = async () => {
	const state = store.getState();
	try {
		if (!isEmpty(state.user.auth.tokenIntervalId)) return;
        await checkToken();
		const tokenIntervalId = getRandomInt();
		store.dispatch(setTokenIntervalId(tokenIntervalId));
        while (!isEmpty(state.user.auth.tokenIntervalId)) {
            await sleep(60);
            await checkToken();
        }
	} catch (error) {
		console.log('Error <checkTokenLoop>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        serviceReject();
	}
};

const checkToken = async () => {
	const state = store.getState();
	try {
		if (!(await authTokenPresent())) return;
		const timestamp = state.user.auth.timestamp;
		const diff = Math.round((new Date().getTime() - timestamp) / (60 * 1000));
		console.log({ diff });
		if (diff < 15) return;
		removeToken();
		deployTokenBot();
	} catch (error) {
		console.log('Error <checkToken>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        serviceReject();
	}
};

const removeToken = async () => {
	const state = store.getState();
	try {
		store.dispatch(unsetUserAuth());
		setAuthToken(false);
        serviceResolve();
	} catch (error) {
		console.log('Error <removeToken>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        serviceReject();
	}
};

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).

const bgTaskOptions = {
	taskName: 'CoWin Automation',
	taskTitle: 'Authentication Service',
	taskDesc: 'Maintaining Connection to CoWIN server.',
	taskIcon: {
		name: 'ic_launcher',
		type: 'mipmap',
	},
	color: '#0055ff',
};

const start = async () => {
	if (!BackgroundService.isRunning()) {
        store.dispatch(setTokenBotGo(true));
        await BackgroundService.start(startService, bgTaskOptions);
        console.log('Authorization Started.');
    }
};
// Only Android, iOS will ignore this call
const updateNotification = async () =>
	await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' });
// iOS will also run everything here in the background until .stop() is called
const stop = async () => {
	if (BackgroundService.isRunning()) {
        store.dispatch(setAuthError(false));
		await removeToken();
		await BackgroundService.stop();
		console.log('Authorization Stopped.');
	}
};

export default { start, updateNotification, stop };
