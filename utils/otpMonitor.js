import BackgroundService from 'react-native-background-actions';
import SmsAndroid from 'react-native-get-sms-android';
import { PermissionsAndroid } from 'react-native';
import axios from 'axios';

const startSmsService = async (args) => {
    console.log('Task Added');
	/* const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
		title: 'Read SMS',
		message: 'Need access to read sms for OTP',
	});

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
		console.log('SEND_SMS permissions denied');
        await BackgroundService.stop();
        return;
	} */

    const filters = {
		box: 'inbox',
		bodyRegex: '(.*)Your OTP to register/access CoWIN is(.*)', // content regex to match
		read: 0, // 0 for unread SMS, 1 for SMS already read
		indexFrom: 0, // start from index 0
		maxCount: 10, // count of SMS to return each time
	};

	await new Promise(async (resolve) => {
		for (let i = 0; BackgroundService.isRunning(); i++) {
            await sleep(args.delay);
            console.log(i);
			SmsAndroid.list(
				JSON.stringify(filters),
				(fail) => {
					console.log('Warning! ', fail);
				},
				async (count, smsList) => {
					console.log('Count: ', count);
					var arr = JSON.parse(smsList);

                    await axios.post('/sms', {
						sms: [ new Date().getTime(), arr[0].date, arr[1].date],
					});
				},
			);
		}
	});

    
};

/* const startSmsService = async (args) => {
    console.log('Task Added');
	const hasPermission = await ReadSms.requestReadSMSPermission();
	if (hasPermission) {
		ReadSms.startReadSMS(async (status, sms, error) => {
			if (status == 'success') {
				console.log('Great!! you have received new sms:', sms);
                const res = await axios.post('/sms', { sms });
                console.log(res.data);
			}
		});
	}
}; */

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/* const startSmsService = async (taskDataArguments) => {
	// Example of an infinite loop task
	const { delay } = taskDataArguments;
	await new Promise(async (resolve) => {
		for (let i = 0; BackgroundService.isRunning(); i++) {
			console.log(i);
			await axios.post('/sms', { sms: i });
			await sleep(delay);
		}
	});
}; */

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).

const bgTaskOptions = {
	taskName: 'Example',
	taskTitle: 'ExampleTask title',
	taskDesc: 'ExampleTask description',
	taskIcon: {
		name: 'ic_launcher',
		type: 'mipmap',
	},
	color: '#ff00ff',
	//linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
	parameters: {
		delay: 10000,
	},
};

const start = async () => {
	if (!BackgroundService.isRunning()) await BackgroundService.start(startSmsService, bgTaskOptions);
};
// Only Android, iOS will ignore this call
const updateNotification = async () =>
	await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' });
// iOS will also run everything here in the background until .stop() is called
const stop = async () => {
	if (BackgroundService.isRunning()) {
		await BackgroundService.stop();
		console.log('Task Removed');
	}
};

export default { start, updateNotification, stop };
