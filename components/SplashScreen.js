import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, Linking, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SplashScr from 'react-native-splash-screen';

const logoDim = 200;

const SplashScreen = ({ navigation }) => {
	const prefs = useSelector((state) => state.user);
    const rotateValue = useState(new Animated.Value(0))[0];
    const fadeValue = useState(new Animated.Value(0))[0];

	useEffect(() => {
        setTimeout(() => navigation.navigate(prefs.set ? 'HomeScreen' : 'PrefsScreen'), 3000);
        SplashScr.hide();
        StartImageRotate();
    }, []);

    const StartImageRotate = () => {
		rotateValue.setValue(0);
		fadeValue.setValue(0);

		Animated.loop(Animated.timing(rotateValue, {
			toValue: 1,
			duration: 3000,
			easing: Easing.linear,
            useNativeDriver: true,
		})).start();

        Animated.timing(fadeValue, {
			toValue: 1,
			duration: 1500,
			useNativeDriver: true,
		}).start();
	}

    const RotateData = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	return (
		<View style={styles.splashContainer}>
			<Animated.View style={[styles.splashLogo, { opacity: fadeValue }]}>
				<Image style={styles.shield} source={require('../assets/shield.png')} />
				<Animated.Image
					style={[styles.gear, { transform: [{ translateY: -0.075 * logoDim }, { rotate: RotateData }] }]}
					source={require('../assets/gear.png')}
				/>
				<Image style={styles.spartan} source={require('../assets/spartan.png')} />
			</Animated.View>
			<Text style={styles.appName}>AutoVax</Text>
			<Text style={styles.msg} onPress={() => Linking.openURL('https://github.com/brij1999')}>
				Made with ❤ by <Text style={styles.dev}>Brijgopal Bharadwaj</Text>
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	splashContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#EEEDFF',
		width: '100%',
		height: '100%',
	},
	splashLogo: {
		height: logoDim,
		width: logoDim,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'visible',
		marginBottom: 20,
	},
	shield: {
		position: 'absolute',
		height: logoDim,
		width: logoDim,
		aspectRatio: 1,
	},
	gear: {
		position: 'absolute',
		height: 0.7 * logoDim,
		width: 0.7 * logoDim,
		aspectRatio: 1,
	},
	spartan: {
		position: 'absolute',
		transform: [{ translateY: -0.035 * logoDim }],
		height: 0.9 * logoDim,
		width: 0.9 * logoDim,
		aspectRatio: 1,
	},
	appName: {
		fontSize: 40,
		fontFamily: 'Ubuntu-BoldItalic',
	},
	msg: {
		position: 'absolute',
		bottom: 40,
		fontSize: 15,
	},
	dev: {
		color: '#0080c4',
	},
});

export default SplashScreen;
