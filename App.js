import 'react-native-gesture-handler';
import React, { useState, useEffect, Fragment } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authTokenPresent from './utils/authTokenPresent';
import setAuthToken from './utils/setAuthToken';
import PushController from './utils/PushController';
import HomeScreen from './components/HomeScreen';
import SignupScreen from './components/SignupScreen';

const Stack = createStackNavigator();
// authTokenPresent();
// (async () => await AsyncStorage.removeItem('@jwtToken'))();

const App = () => {
	return (
		<Fragment>
			<NavigationContainer>
				<Stack.Navigator
					initialRouteName='Home'
					screenOptions={{
						headerShown: false,
					}}>
					<Stack.Screen name='Home' component={HomeScreen} />
					<Stack.Screen name='Signup' component={SignupScreen} />
				</Stack.Navigator>
			</NavigationContainer>
			<PushController />
		</Fragment>
	);
};

export default App;
