import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
	StyleSheet,
	Text,
	View,
	Linking,
	ScrollView,
	TouchableOpacity,
	Animated,
	Easing,
	Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { Neomorph, NeomorphFlex } from 'react-native-neomorph-shadows';
import DatePicker from 'react-native-date-picker';
import isEmpty from '../utils/isEmpty';
import floatingNotify from '../utils/floatingNotify';
import { authTokenPresent } from '../utils/authUtils';
import { setSelectedDate } from '../redux/actions/User Actions';
import { setStatus, setTokenBotGo, setAutoBotGo } from '../redux/actions/Auto Actions';
import { deployTokenBot, removeToken } from '../scripts/authScripts';
import { deployAutoBot, stopFetchSlots } from '../scripts/autoScripts';
import PushNotification from 'react-native-push-notification';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const delay = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const HomeScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const prefs = useSelector((state) => state.user);
	const available = useSelector((state) => state.auto.available);
	const booking = useSelector((state) => state.auto.booking);
	const status = useSelector((state) => state.auto.status);
	const statusColor = useSelector((state) => state.auto.statusColor);
	const autoBotGo = useSelector((state) => state.auto.autoBotGo);

	const [date, setDate] = useState(new Date());
	const [openDatePopup, setOpenDatePopup] = useState(false);

	const animatedScale1 = useState(new Animated.Value(0))[0];
	const animatedScale2 = useState(new Animated.Value(0))[0];
	const animatedOpacity1 = useState(new Animated.Value(0))[0];
	const animatedOpacity2 = useState(new Animated.Value(0))[0];

	const scaleAnimation1 = Animated.loop(
		Animated.sequence([
			Animated.timing(animatedScale1, {
				toValue: 0,
				duration: 0,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedScale1, {
				toValue: 1,
				duration: 1 * 4000,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
		]),
	);

	const opacityAnimation1 = Animated.loop(
		Animated.sequence([
			Animated.timing(animatedOpacity1, {
				toValue: 0,
				duration: 0,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedOpacity1, {
				toValue: 1,
				duration: 0.5 * 4000,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedOpacity1, {
				toValue: 0,
				duration: 0.5 * 4000,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
		]),
	);

	const scaleAnimation2 = Animated.loop(
		Animated.sequence([
			Animated.timing(animatedScale2, {
				toValue: 0,
				duration: 0,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedScale2, {
				toValue: 1,
				duration: 1 * 3740,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
		]),
	);

	const opacityAnimation2 = Animated.loop(
		Animated.sequence([
			Animated.timing(animatedOpacity2, {
				toValue: 0,
				duration: 0,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedOpacity2, {
				toValue: 1,
				duration: 0.5 * 3740,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
			Animated.timing(animatedOpacity2, {
				toValue: 0,
				duration: 0.5 * 3740,
				useNativeDriver: true,
				easing: Easing.ease,
			}),
		]),
	);

	const startAnimation = async () => {
		scaleAnimation1.start();
		opacityAnimation1.start();
		scaleAnimation2.start();
		opacityAnimation2.start();
	};

	const stopAnimation = async () => {
		scaleAnimation1.stop();
		opacityAnimation1.stop();
		scaleAnimation2.stop();
		opacityAnimation2.stop();
	};

	useEffect(() => {
		const init = async () => {
			if (!prefs.set) navigation.navigate('PrefsScreen');
			if (prefs.set) dispatch(setStatus("... Idle ... \nPress the 'Power Button' to begin.", 'B'));
			authTokenPresent();
			// dispatch(unsetUserAuth());
		};
		init();
	}, []);

	const mainBtnPress = async () => {
        // PushNotification.localNotification({
        //     channelId: 'slot_info',
		// 	autoCancel: true,
		// 	bigText: 'This is local notification demo in React Native app. Only shown, when expanded.',
		// 	subText: 'Local Notification Demo',
		// 	title: 'Local Notification Title',
		// 	message: 'Expand me to see more',
		// 	vibrate: true,
		// 	vibration: 300,
		// 	playSound: true,
		// 	soundName: 'default',
		// 	actions: '["Yes", "No"]',
		// });
		if (isEmpty(prefs.date)) {
			setOpenDatePopup(true);
			dispatch(setStatus("... Idle ... \nPress the 'Power Button' to begin.", 'B'));
			return;
		}
		if (!autoBotGo) {
			dispatch(setStatus('Deploying Automation...', 'B'));
			dispatch(setTokenBotGo(true));
			dispatch(setAutoBotGo(true));
			await startAnimation();
			await automationStart();
		} else {
			dispatch(setTokenBotGo(false));
			dispatch(setAutoBotGo(false));
			await automationStop();
			await stopAnimation();
			dispatch(setStatus("... Idle ... \nPress the 'Power Button' to begin.", 'B'));
		}
	};

	const automationStart = async () => {
		try {
			await deployTokenBot();
			await deployAutoBot();
		} catch (error) {
			console.log('Error <automationStart>:\n', error, '\n', error.stack);
			floatingNotify('Something Went Wrong!');
		}
	};

	const automationStop = async () => {
		try {
			stopFetchSlots();
		} catch (error) {
			console.log('Error <automationStop>:\n', error, '\n', error.stack);
			floatingNotify('Something Went Wrong!');
		}
	};

	const onDateChange = () => {
		setOpenDatePopup(false);
		const date_str =
			(date.getDate() < 10 ? '0' : '') +
			date.getDate() +
			'-' +
			(date.getMonth() + 1 < 10 ? '0' : '') +
			(date.getMonth() + 1) +
			'-' +
			date.getFullYear();
		dispatch(setSelectedDate(date_str));
	};

	const DatePopup = openDatePopup && (
		<View style={popupStyles.datePopup}>
			<View style={popupStyles.datePopupCard}>
				<Text style={popupStyles.datePopupHeader}>Set date for appointment:</Text>
				<DatePicker
					date={date}
					onDateChange={setDate}
					mode='date'
					locale='en-IN'
					androidVariant='nativeAndroid'
					minimumDate={new Date()}
					style={popupStyles.datePicker}
				/>
				<TouchableOpacity onPress={onDateChange}>
					<Neomorph swapShadows style={popupStyles.neuBtn}>
						<LinearGradient
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							colors={['#00c8ff', '#0055ff']}
							style={popupStyles.dateSubmit}>
							<Text style={popupStyles.dateSubmitText}>Select</Text>
						</LinearGradient>
					</Neomorph>
				</TouchableOpacity>
			</View>
		</View>
	);

	const mainBtn = autoBotGo ? (
		<Neomorph style={styles.btnMainInnerRingActive}>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				colors={['#7ed56f', '#28b485']}
				style={{
					borderRadius: 90 / 2,
					width: 90,
					height: 90,
					alignItems: 'center',
					justifyContent: 'center',
					borderWidth: 2,
					borderColor: '#00000000',
					borderRadius: 90 / 2,
				}}>
				<AntDesignIcon name='poweroff' size={35} color='#FFF' />
			</LinearGradient>
		</Neomorph>
	) : (
		<Neomorph style={styles.btnMainInnerRingInactive}>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				colors={['#f4f4ff', '#cdcdd6']}
				style={{
					width: 90,
					height: 90,
					alignItems: 'center',
					justifyContent: 'center',
					borderWidth: 2,
					borderColor: '#00000000',
					borderRadius: 90 / 2,
				}}>
				<AntDesignIcon name='poweroff' size={35} color='#777' />
			</LinearGradient>
		</Neomorph>
	);

	const slotsDetails = isEmpty(available) ? (
		<>
			<Text style={styles.statusHeading}>Looking for Free Slots</Text>
			<View style={styles.statusLoader}>
				<Neomorph style={styles.statusLoaderOuterRing} onTouchEnd={mainBtnPress}>
					<Neomorph inner style={styles.statusLoaderInnerRing}>
						<AntDesignIcon name='search1' size={35} color='#777' />
					</Neomorph>
				</Neomorph>
				<Animated.View
					style={[
						styles.statusLoaderCircle,
						{ opacity: animatedOpacity1, transform: [{ scale: animatedScale1 }] },
					]}
				/>
				<Animated.View
					style={[
						styles.statusLoaderCircle,
						{ opacity: animatedOpacity2, transform: [{ scale: animatedScale2 }] },
					]}
				/>
			</View>
		</>
	) : (
		<>
			<Text style={styles.statusHeading}>Identified Free Slots</Text>
			<ScrollView contentContainerStyle={styles.availableCentres}>
				{available.map((center) => (
					<TouchableOpacity
						style={styles.center}
						key={center.center_id}
						onPress={() => Linking.openURL(`https://www.google.com/maps/place/${center['pincode']}`)}>
						<View style={styles.centerName}>
							<Text style={styles.centerNameText}>{center.name + ', ' + center.pincode}</Text>
						</View>
						<View style={styles.centerSessionList}>
							{center.sessions
								.filter((s) => s.available_capacity > 0)
								.map((s) => (
									<View style={styles.centerSession} key={center.name + s.date}>
										<Text style={styles.sessionDate}>{s.date + ' :'}</Text>
										<Text style={styles.sessionDose1}>
											{'1st Dose: ' + s.available_capacity_dose1}
										</Text>
										<Text style={styles.sessionDose2}>
											{'2nd Dose: ' + s.available_capacity_dose2}
										</Text>
									</View>
								))}
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</>
	);

	const editPrefsBtn = (
		<Neomorph style={styles.editPrefsBtn} onTouchEnd={() => navigation.navigate('PrefsScreen')}>
			<LinearGradient
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				colors={['#ffb900', '#ff7730']}
				style={styles.editPrefsBtnBg}>
				<Text style={styles.editPrefsBtnText}>Edit Preferences</Text>
			</LinearGradient>
		</Neomorph>
	);

	return (
		<View style={styles.container}>
			<View style={styles.flex1container}>
				<NeomorphFlex style={styles.containerShadow}>
					<LinearGradient
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						colors={['#00c8ff', '#0055ff']}
						style={styles.topContainer}>
						<Neomorph inner style={styles.btnMainOuterRing} onTouchEnd={mainBtnPress}>
							{mainBtn}
						</Neomorph>
						<View style={styles.dateDetails} onTouchEnd={() => setOpenDatePopup(true)}>
							<View style={styles.dateHeading}>
								<Text style={styles.dateHeadingText}>Selected date for slots:</Text>
							</View>
							<View style={styles.dateDisplay}>
								<View style={styles.dateBox}>
									<Text style={styles.dateBoxText}>{prefs.date}</Text>
								</View>
								<View style={styles.dateIcon}>
									<AntDesignIcon name='calendar' size={17} color='#fff' />
								</View>
							</View>
							<View style={styles.dateInst}>
								<Text style={styles.dateInstText}>
									If you want to search on a different date, click on the date to select a new one.
								</Text>
							</View>
						</View>
					</LinearGradient>
				</NeomorphFlex>
			</View>
			<View style={styles.flex1container}>
				<NeomorphFlex style={styles.containerShadow}>
					<LinearGradient
						start={{ x: 0, y: 1 }}
						end={{ x: 0, y: 0 }}
						colors={['#EEEDFF', '#EEEDFF']}
						style={styles.midContainer}>
						<Text style={styles.statusHeading}>System Status</Text>
						<View style={{ justifyContent: 'center', flex: 1, width: '100%' }}>
							<Text style={{ ...styles.status, color: statusColor }}>{status}</Text>
						</View>
					</LinearGradient>
				</NeomorphFlex>
			</View>
			<View style={styles.flex3container}>
				<NeomorphFlex style={styles.containerShadow}>
					{autoBotGo ? (
						<View style={styles.midContainer}>{slotsDetails}</View>
					) : (
						<View style={[styles.midContainer, styles.midContainerEmpty]}>
							<Text>Waiting for the automation to deploy...</Text>
						</View>
					)}
				</NeomorphFlex>
			</View>
			{editPrefsBtn}
			{DatePopup}
		</View>
	);
};

const styles = StyleSheet.create({
	availableCentres: {
		padding: 5,
	},
	center: {
		borderColor: '#999',
		borderWidth: 2,
		borderRadius: 5,
		marginBottom: 10,
		padding: 5,
	},
	centerName: {
		paddingBottom: 5,
	},
	centerNameText: {
		fontSize: 15,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	centerSessionList: {
		padding: 5,
	},
	centerSession: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	sessionDate: {
		fontWeight: 'bold',
	},
	sessionDose1: {
		color: '#D2222D',
	},
	sessionDose2: {
		color: '#28CC2D',
	},
	editPrefsBtn: {
		shadowRadius: 5,
		shadowOpacity: 0.3,
		height: 50,
		width: 160,
		borderRadius: 50 / 2,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		bottom: 30,
		right: 30,
		backgroundColor: '#eee',
		zIndex: 10,
		padding: 3,
	},
	editPrefsBtnBg: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 50 / 2,
	},
	editPrefsBtnText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 20,
	},
	editPrefsBtnText: {
		color: 'white',
		fontSize: 15,
		fontWeight: 'bold',
	},
	statusLoader: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	statusLoaderOuterRing: {
		shadowRadius: 3,
		shadowOpacity: 0.3,
		width: 8 * 10,
		height: 8 * 10,
		borderRadius: (8 / 2) * 10,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		backgroundColor: '#EEEDFF',
		zIndex: 10,
	},
	statusLoaderInnerRing: {
		shadowRadius: 3,
		width: 6.5 * 10,
		height: 6.5 * 10,
		borderRadius: (6.5 / 2) * 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EEEDFF',
	},
	statusLoaderCircle: {
		width: 200,
		height: 200,
		borderRadius: 200 / 2,
		borderWidth: 4,
		borderColor: '#333',
		position: 'absolute',
	},
	container: {
		flex: 1,
		backgroundColor: '#EEEDFF',
		padding: 15,
	},
	containerShadow: {
		flex: 1,
		shadowRadius: 5,
		shadowOpacity: 0.3,
		backgroundColor: '#EEEDFF',
		borderRadius: 7,
	},
	flex1container: {
		flex: 1,
		marginBottom: 20,
	},
	flex1container: {
		flex: 1,
		marginBottom: 20,
	},
	flex3container: {
		flex: 3,
	},
	topContainer: {
		// height: windowHeight * 0.2,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 15,
		borderRadius: 7,
	},
	midContainer: {
		// height: windowHeight * 0.15,
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
		padding: 15,
		borderRadius: 7,
		borderWidth: 1,
		borderRadius: 7,
		borderColor: '#e3e3e3',
		backgroundColor: '#F0EFFF',
	},
	midContainerEmpty: {
		justifyContent: 'center',
	},
	statusHeading: {
		textAlign: 'center',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	status: {
		textAlign: 'center',
	},
	btnMainOuterRing: {
		shadowRadius: 3,
		borderRadius: 110 / 2,
		backgroundColor: '#EFEDFF',
		width: 110,
		height: 110,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnMainInnerRingInactive: {
		shadowRadius: 5,
		shadowOpacity: 0.4,
		backgroundColor: '#EFEFFF',
		borderRadius: 90 / 2,
		width: 90,
		height: 90,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnMainInnerRingActive: {
		shadowRadius: 5,
		borderRadius: 90 / 2,
		backgroundColor: '#EFEFFF',
		width: 90,
		height: 90,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#eee',
	},
	dateDetails: {
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	dateHeading: {},
	dateHeadingText: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
	},
	dateDisplay: {
		flexDirection: 'row',
		paddingTop: 10,
	},
	dateBox: {
		backgroundColor: '#EEEDFF',
		height: 30,
		width: 150,
		justifyContent: 'center',
		// paddingLeft: 25,
		borderTopLeftRadius: 30 / 2,
		borderBottomLeftRadius: 30 / 2,
	},
	dateBoxText: {
		textAlign: 'center',
	},
	dateIcon: {
		backgroundColor: '#555',
		width: 40,
		height: 30,
		borderTopRightRadius: 30 / 2,
		borderBottomRightRadius: 30 / 2,
		alignItems: 'center',
		justifyContent: 'center',
		paddingRight: 2,
	},
	dateInst: {
		paddingTop: 10,
		width: 190,
	},
	dateInstText: {
		color: 'white',
		fontSize: 12,
		textAlign: 'justify',
	},
});

const popupStyles = StyleSheet.create({
	datePopup: {
		backgroundColor: 'rgba(52, 52, 52, 0.8)',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		width: windowWidth,
		height: windowHeight,
	},
	datePopupHeader: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	datePopupCard: {
		backgroundColor: '#EEEDFF',
		width: windowWidth * 0.75,
		height: windowHeight * 0.45,
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 30,
		borderRadius: 5,
	},
	neuBtn: {
		shadowRadius: 3,
		shadowOpacity: 0.2,
		borderRadius: 45 / 2,
		backgroundColor: '#EEEDFF',
		width: 125,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#e1e0f2',
	},
	dateSubmit: {
		borderRadius: 35 / 2,
		width: 115,
		height: 35,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dateSubmitText: {
		fontSize: 18,
		color: '#fff',
		fontWeight: 'bold',
	},
});

export default HomeScreen;
