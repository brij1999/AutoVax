import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid } from 'react-native';
import isEmpty from '../utils/isEmpty';
import { store } from '../redux/store';

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const otpFetchService = async () => {
	console.log('OTP Fetch Started');
	const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
		title: 'Read SMS',
		message: 'Need access to read sms for OTP',
	});

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
		console.log('SEND_SMS permissions denied');
        return;
	}

    const delay = 5000;
    const time = store.getState().user.auth.prevTimestamp;
	const filters = {
		box: 'inbox',
		bodyRegex: '(.*)Your OTP to register/access CoWIN is (.*)', // content regex to match
		read: 0, // 0 for unread SMS, 1 for SMS already read
		indexFrom: 0, // start from index 0
		maxCount: 10, // count of SMS to return each time
	};
    console.log(filters);

	return new Promise(async (resolve, reject) => {
		try {
			for (let i = 0; i < 10; i++) {
                console.log('OTP poll: ', i+1);
				await sleep(delay);

				SmsAndroid.list(
					JSON.stringify(filters),
					(fail) => {
						reject('Warning! ' + fail);
					},
					async (count, smsList) => {
						const arr = JSON.parse(smsList);
						if (!isEmpty(arr)) resolve(new RegExp('\\d{6}').exec(arr[0].body)[0]);
					},
				);
			}
            console.log('OTP Fetch Stopped.');
            resolve(null);
		} catch (error) {
			reject(error);
		}
	});
};

export default otpFetchService;
