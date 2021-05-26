import axios from 'axios';
import JSSoup from 'jssoup';
import isEmpty from '../utils/isEmpty';
import floatingNotify from '../utils/floatingNotify';
import { API_BENEFICIARIES, API_SLOTS_FETCH, API_GETCAPTCHA, API_SCHEDULE, SLOT_FETCH_INTERVAL } from '../ENV';
import { store } from '../redux/store';
import model from '../utils/model';
import { authTokenPresent } from '../utils/authUtils';
import PushNotification from 'react-native-push-notification';
import {
	setBeneficiaries,
	setBookingParams,
	setSlotIntervalId,
	setSlotDetails,
	setStatus,
} from '../redux/actions/Auto Actions';

const delay = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const deployAutoBot = async () => {
	const state = store.getState();
	try {
		if (!state.auto.autoBotGo) return;
		await getBeneficiaries();
		await startFetchSlots();
	} catch (error) {
		console.log('Error <deployAutoBot>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

const startFetchSlots = async () => {
	const state = store.getState();
	if (state.auto.slotIntervalId) return;
	try {
		await fetchSlots();
		const slotIntervalId = setInterval(fetchSlots, SLOT_FETCH_INTERVAL * 1000);
		store.dispatch(setSlotIntervalId(slotIntervalId));
	} catch (error) {
		console.log('Error <startFetchSlots>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
	}
};

const fetchSlots = async () => {
	const state = store.getState();
	// PushNotification.localNotification({
	// 	channelId: 'slot_info', // (required) channelId, if the channel doesn't exist, notification will not trigger.
	// 	ticker: 'Congrats!!! Sussessfully Booked Your Vaccination Slot. 🤘', // (optional)
	// 	bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
	// 	subText: 'This is a subText', // (optional) default: none
	// 	color: 'red', // (optional) default: system default
	// 	vibrate: true, // (optional) default: true
	// 	vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
	// 	actions: ['View Slots'], // (Android only) See the doc for notification actions to know more
	// 	invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true
	// });

	if (!state.auto.autoBotGo) return;
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
	if (!state.auto.autoBotGo) return;
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
			const msg = `Found ${count} centers that have available slots listed for ${age}+ age group in your district.`;
			store.dispatch(setStatus(msg, 'G'));

			PushNotification.localNotification({
				channelId: 'slot_info',
				autoCancel: true,
				title: 'Slots found for your profile!!!',
				subText: 'CoWIN Automation',
				message: 'Expand me to see more',
				bigText: msg,
				vibrate: true,
				vibration: 300,
				playSound: true,
				soundName: 'default',
				actions: '["Open App"]',
			});
		}
		await delay(1);
		await book();
	} catch (error) {
		console.log('Error <check>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
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
	}
};

const book = async () => {
	const state = store.getState();
	if (!state.auto.autoBotGo) return;
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
			PushNotification.localNotification({
				channelId: 'slot_info',
				autoCancel: true,
				title: 'Slots Booked!!!',
				subText: 'CoWIN Automation',
				message: `Congrats!!! Sussessfully Booked Your Vaccination Slot. 🤘`,
				bigText: msg,
				vibrate: true,
				vibration: 300,
				playSound: true,
				soundName: 'default',
				actions: '["Open App"]',
			});
			const c = available[0];
			store.dispatch(setBooking(c));
		} catch (e) {
			const error = e.response.data.error;
			console.log('<CoWIN Book Error>: ', error);
			if (state.auto.autoBotGo && isEmpty(state.auto.booking)) await startFetchSlots();
		}
	} catch (error) {
		console.log('Error <book>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
		stopFetchSlots();
	}
};

export const stopFetchSlots = () => {
	const state = store.getState();
	try {
		const slotIntervalId = state.auto.slotIntervalId;
		clearInterval(slotIntervalId);
		store.dispatch(setSlotIntervalId(null));
	} catch (error) {
		console.log('Error <stopFetchSlots>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};

/* export const download = async (appointment_id) => {
    try {
        const res = await axios({
			method: 'get',
			url: 'appointment/appointmentslip/download',
			params: { appointment_id },
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/pdf',
			},
			responseType: 'arraybuffer',
		});
		const url = window.URL.createObjectURL(new Blob([res.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', 'Appointment_slip.pdf');
		document.body.appendChild(link);
		link.click();
    } catch (error) {
        console.log('Error <download>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
    }
} */

export const getBeneficiaries = async () => {
	const state = store.getState();
	try {
		if (!authTokenPresent()) return;
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
		console.log({ params });
		store.dispatch(setBeneficiaries(ben));
		store.dispatch(setBookingParams(params));
	} catch (error) {
		console.log('Error <getBeneficiaries>:\n', error, '\n', error.stack);
		floatingNotify('Something Went Wrong!');
	}
};
