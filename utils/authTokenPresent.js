import jwt_decode from 'jwt-decode';
import setAuthToken from './setAuthToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authTokenPresent = async () => {
    try {
        const token = await AsyncStorage.getItem('@jwtToken');
		if (token) {
			const decoded = jwt_decode(token);
			if (Date.now() / 1000 < decoded.exp) {
				setAuthToken(token);
				return decoded;
			}
		}
        setAuthToken(false);
		return false;
    } catch (error) {
        setAuthToken(false);
        return false;
    }
    
};

export default authTokenPresent;
