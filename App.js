import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/HomeScreen';
import SignupScreen from './components/SignupScreen';

const Stack = createStackNavigator();

const App = () => {
	return (
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
	);
}

export default App;