import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import axios from 'axios';
import PushNotification, { Importance } from 'react-native-push-notification';
import { store } from './redux/store';
import { SET_FIREBASE_TOKEN } from './redux/types';
import { API_BASE_URL, API_CONTENT_TYPE, API_USER_AGENT, SENDER_ID } from './ENV';

console.log(API_BASE_URL);
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = API_CONTENT_TYPE;
axios.defaults.headers.common['User-Agent'] = API_USER_AGENT;

PushNotification.configure({
	// (optional) Called when Token is generated (iOS and Android)
	onRegister: async (token) => {
		console.log('FCM TOKEN: ', token);
		store.dispatch({ type: SET_FIREBASE_TOKEN, payload: token.token });
		// await setItem('@firebasePushToken', token.token);
	},

	// (required) Called when a remote or local notification is opened or received
	onNotification: (notification) => {
		console.log('FCM NOTIFICATION: ', notification);

		// process the notification here
	},
	// Android only
	senderID: SENDER_ID,
	// iOS only
	permissions: {
		alert: true,
		badge: true,
		sound: true,
	},
	popInitialNotification: true,
	requestPermissions: true,
});

PushNotification.createChannel(
	{
		channelId: 'slot_info', // (required)
		channelName: 'Slot Info', // (required)
		channelDescription: 'A channel to show the slot details', // (optional) default: undefined.
		playSound: true, // (optional) default: true
		soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
		importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
		vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
	},
	(created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
);

AppRegistry.registerComponent(appName, () => App);
