import AsyncStorage from '@react-native-async-storage/async-storage';

export const removeItem = async (key) => {
	try {
		return await AsyncStorage.removeItem(key);
	} catch (error) {
		return undefined;
	}
};
export const getItem = async (key) => {
	try {
		return await JSON.parse(await AsyncStorage.getItem(key));
	} catch (error) {
		return undefined;
	}
};
export const setItem = async (key, val) => {
	try {
		return await AsyncStorage.setItem(key, JSON.stringify(val));
	} catch (error) {
		return undefined;
	}
};
