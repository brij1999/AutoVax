import BackgroundService from 'react-native-background-actions';
import axios from 'axios';
import JSSoup from 'jssoup';
import isEmpty from '../utils/isEmpty';
import floatingNotify from '../utils/floatingNotify';
import { authTokenPresent } from '../utils/authUtils';
import { API_BENEFICIARIES, API_SLOTS_FETCH, API_GETCAPTCHA, API_SCHEDULE, SLOT_FETCH_INTERVAL } from '../ENV';
import { store } from '../redux/store';
import model from '../utils/model';
import {
	setBeneficiaries,
	setBookingParams,
	setAuthError,
	setSlotIntervalId,
	setSlotDetails,
	setStatus,
	setAutoEnabled,
} from '../redux/actions/Auto Actions';

const delay = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const startService = async (taskDataArguments) => {
	const state = store.getState();

	await new Promise(async (resolve) => {
		if (!state.auto.autoEnabled || state.auto.slotIntervalId) resolve();
		try {
			await fetchSlots();
			const slotIntervalId = setInterval(fetchSlots, SLOT_FETCH_INTERVAL * 1000);
			store.dispatch(setSlotIntervalId(slotIntervalId));
		} catch (error) {
			console.log('Error <startFetchSlots>:\n', error, '\n', error.stack);
			floatingNotify('Something Went Wrong!');
			stopFetchSlots();
            throw error;
		}
	});
};

const fetchSlots = async () => {
	const state = store.getState();
	if (!state.auto.autoEnabled) return;
	try {
		store.dispatch(setStatus('Fetching...'));
		const prefs = state.user;
		const params = { district_id: prefs.district, date: prefs.date };
		const res = await axios.get(API_SLOTS_FETCH, { params });
		const centers = res.data['centers'];
		await check(centers);
	} catch (error) {
		console.log('Error <fetchSlots>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
        throw error;
	}
};

const getPincodes = (pins) => {
	if (isEmpty(pins)) return pins;
	const p = pins.replace(/ /g, '');
	if (p.length === 0) return null;
	return p.split(',').map((pc) => Number(pc));
};

const check = async (centers) => {
	const state = store.getState();
	if (!state.auto.autoEnabled) return;
	try {
		const prefs = state.user;
		const age = prefs.is45Plus ? 45 : 18;
		const fees = prefs.fees;
		const vaccine = prefs.prefferedVaccine;
		const pincodes = getPincodes(prefs.PIN);
		let count = 0;
		const available = centers.filter((center) => {
			count += center['sessions'][0]['min_age_limit'] === age;
			if (pincodes && !pincodes.includes(center['pincode'])) return false;
			if (fees && fees !== center['fee_type'].toLowerCase()) return false;
			return center['sessions'].some((s) => {
				if (vaccine && vaccine !== s['vaccine']) return false;
				return (
					s[`available_capacity`] > 10 &&
					s[`available_capacity_dose${prefs.dose}`] > 10 &&
					s['min_age_limit'] === age
				);
			});
		});
		const session = available.length > 0 && available[0]['sessions'][0];
		console.log({ count, available, session });
		store.dispatch(setSlotDetails(count, available, session));
		if (count === 0) {
			store.dispatch(setStatus(`No centers listed for ${age}+ age group found in your district 😔`, 'B'));
		} else if (available.length === 0) {
			store.dispatch(
				setStatus(
					`Found ${count} centers listed for ${age}+ age group in your district, and all of them are fully booked right now 😕`,
					'R',
				),
			);
		} else {
			store.dispatch(
				setStatus(
					`Found ${count} centers that have available slots listed for ${age}+ age group in your district.`,
					'G',
				),
			);
		}
		await delay(1);
		await book();
	} catch (error) {
		console.log('Error <check>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
        throw error;
	}
};

const getCaptcha = async () => {
	try {
		const res = await axios.post(API_GETCAPTCHA);
		const svg_data = res.data.captcha;
		const soup = new JSSoup(svg_data);
		const CAPTCHA = [];
		let captchaStr = '';

		soup.findAll('path', { fill: new RegExp('#') }).forEach((path) => {
			if (!new RegExp('#').test(path.attrs.fill)) return;
			let ENCODED_STRING = path.attrs.d.toUpperCase();
			const INDEX = parseInt(new RegExp(/M(\d+)/).exec(ENCODED_STRING)[1]);
			ENCODED_STRING = [...ENCODED_STRING.matchAll(/[A-Z]/g)].map((val) => val[0]);
			ENCODED_STRING = ENCODED_STRING.join('');
			CAPTCHA.push([parseInt(INDEX), model[ENCODED_STRING]]);
		});

		CAPTCHA.sort((a, b) => a[0] - b[0]);
		CAPTCHA.forEach((item) => (captchaStr += item[1]));
		console.log(captchaStr);
		return captchaStr;
	} catch (error) {
		console.log('Error <getCaptcha>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        throw error;
	}
};

const book = async () => {
	const state = store.getState();
	if (!state.auto.autoEnabled) return;
	try {
		if (!state.user.auth.token || !state.auto.session) return;
		const session = state.auto.session;
		const params = state.auto.bookingParams;
		const dose = params.dose;
		const beneficiaries = params.ben;
		const session_id = session['session_id'];
		const slot = session['slots'][0];
		const captcha = await getCaptcha();
		stopFetchSlots();

		try {
			const res = await axios.post(API_SCHEDULE, { dose, session_id, slot, beneficiaries, captcha });
			appointment_id = res.data['appointment_confirmation_no'];
			store.dispatch(setStatus(`Congrats!!!\nSussessfully Booked Your Vaccination Slot. 🤘`, 'G'));
			console.log('SUCCESS! ', { appointment_id });
			const c = available[0];
			store.dispatch(setBooking(c));
			stopFetchSlots();
		} catch (e) {
			const error = e.response.data.error;
			console.log('<CoWIN Book Error>: ', error);
			if (state.auto.autoEnabled && isEmpty(state.auto.booking)) await startFetchSlots();
		}
	} catch (error) {
		console.log('Error <book>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
        throw error;
	}
};

const stopFetchSlots = () => {
	const state = store.getState();
	try {
		const slotIntervalId = state.auto.slotIntervalId;
		clearInterval(slotIntervalId);
		store.dispatch(setSlotIntervalId(null));
	} catch (error) {
		console.log('Error <stopFetchSlots>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
        throw error;
	}
};

const getBeneficiaries = async () => {
	const state = store.getState();
	try {
		if (!(await authTokenPresent())) return;
		const res = await axios.get(API_BENEFICIARIES);
		const ben = res.data.beneficiaries;
		console.log({ ben });
		if (isEmpty(ben)) return;
		const prefs = state.user;
		const age = prefs.is45Plus ? 45 : 18;
		const dose = prefs.dose;
		const vaccine = prefs.prefferedVaccine;
		for (let i = 0; i < ben.length; ++i) {
			const b = ben[i];
			const ageB = 2021 - parseInt(b['birth_year']);
			const doseC = (dose === 1 && b['dose1_date'] === '') || (dose === 2 && b['dose1_date'] !== '');
			const ageC = age === 18 ? ageB >= 18 && ageB < 45 : ageB >= 45;
			const vaccineC =
				dose === 1 || (dose === 2 && (!vaccine || vaccine === b['vaccine'].replace(/ /g, '-').toLowerCase()));
			ben[i].allow = doseC && ageC && vaccineC;
		}
		const params = {
			dose,
			ben: ben.filter((b) => b.allow).map((b) => b['beneficiary_reference_id']),
		};
		store.dispatch(setBeneficiaries(ben));
		store.dispatch(setBookingParams(params));
	} catch (error) {
		console.log('Error <getBeneficiaries>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		if (error.response.status == 401) store.dispatch(setAuthError(true));
        else throw error;
	}
};

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).

const bgTaskOptions = {
	taskName: 'CoWin Automation',
	taskTitle: 'Automation Service',
	taskDesc: 'Checking for available slots.',
	taskIcon: {
		name: 'ic_launcher',
		type: 'mipmap',
	},
	color: '#00c8ff',
};

const start = async () => {
	if (!BackgroundService.isRunning()) {
		store.dispatch(setAutoEnabled(true));
		await getBeneficiaries();
		await BackgroundService.start(startService, bgTaskOptions);
        console.log('Automation Started.');
	}
};
// Only Android, iOS will ignore this call
const updateNotification = async () =>
	await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' });
// iOS will also run everything here in the background until .stop() is called
const stop = async () => {
	if (BackgroundService.isRunning()) {
		store.dispatch(setAutoEnabled(false));
		await stopFetchSlots();
		await BackgroundService.stop();
		console.log('Automation Stopped.');
	}
};

export default { start, updateNotification, stop };
