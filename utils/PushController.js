import React, { Component } from 'react';
import Firebase from '@react-native-firebase/app';
import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
// var PushNotification = require("react-native-push-notification");

export default class PushController extends Component {
	componentDidMount() {
		PushNotification.configure({
			// (optional) Called when Token is generated (iOS and Android)
			onRegister: async (token) => {
				console.log('TOKEN: ', token);
                await AsyncStorage.setItem('@firebasePushToken', token.token);
			},

			// (required) Called when a remote or local notification is opened or received
			onNotification: (notification) => {
				console.log('NOTIFICATION: ', notification);

				// process the notification here
			},
			// Android only
			senderID: '548458715952',
			// iOS only
			permissions: {
				alert: true,
				badge: true,
				sound: true,
			},
			popInitialNotification: true,
			requestPermissions: true,
		});

        /* PushNotification.createChannel(
			{
				channelId: 'captcha_capture', // (required)
				channelName: 'Captcha notification', // (required)
				channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
				playSound: true, // (optional) default: true
				soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
				importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
				vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
			},
			(created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
		); */
	}

	render() {
		return null;
	}
}
