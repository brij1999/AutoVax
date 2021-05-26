import 'react-native-gesture-handler';
import React, { useState, useEffect, Fragment } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import PrefsScreen from './components/PrefsScreen';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';

const Stack = createStackNavigator();

const App = () => {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<NavigationContainer>
					<Stack.Navigator initialRouteName='SplashScreen' headerMode='none'>
						<Stack.Screen name='SplashScreen' component={SplashScreen} />
						<Stack.Screen name='HomeScreen' component={HomeScreen} />
						<Stack.Screen name='PrefsScreen' component={PrefsScreen} />
					</Stack.Navigator>
				</NavigationContainer>
			</PersistGate>
		</Provider>
	);
};

export default App;
