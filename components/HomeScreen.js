import React, { useState, useEffect, Fragment } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import authTokenPresent from '../utils/authTokenPresent';
import axios from 'axios';
import otpMonitor from '../utils/otpMonitor';


const HomeScreen = ({ navigation }) => {
    useEffect(async () => {
		if(!(await authTokenPresent()))   navigation.navigate('Signup');

        /* try {
			console.log('Calling...');
			const res = await axios.get('/push');
			console.log(res.data);
		} catch (error) {
			console.log('this err: ', { error });
		} */
	}, []);

	return (
		<View style={styles.container}>
			<Text>Hello!</Text>
			<Button
				onPress={async () => await otpMonitor.start()}
				title='Start'
				accessibilityLabel='Learn more about this purple button'
			/>
			<Button
				onPress={async () => await otpMonitor.stop()}
				title='Stop'
				color='#f12000'
				accessibilityLabel='Learn more about this purple button'
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default HomeScreen;
