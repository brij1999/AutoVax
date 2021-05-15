import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import authTokenPresent from '../utils/authTokenPresent';

const HomeScreen = ({ navigation }) => {
	useEffect(async () => { 
        if (!(await authTokenPresent())) navigation.navigate('Signup'); 
    });
	return (
		<View style={styles.container}>
			<Text>Hello!</Text>
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
